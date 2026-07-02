import LLMService from "../../ai/llm/LLMService.js";
import RAGPipeline from "../../ai/rag/retrieval/RagPipeline.js";
import RecommendationPrompt from "../../ai/llm/prompts/RecommendationPrompt.js";

const llmService = new LLMService();
const ragPipeline = new RAGPipeline();

export default class RecommendationEngine {
  async generate(state) {
    /*
     * =====================================================
     * Retrieve Catalog Matches
     * =====================================================
     */

    const retrieval = await ragPipeline.retrieve({
      query: state.userMessage,
      conversation: state,
    });

    /*
     * =====================================================
     * Convert Retrieved Documents
     * =====================================================
     */

    const catalogMatches = retrieval.documents.map((doc) => ({
      content: doc.pageContent,
      metadata: doc.metadata,
    }));

    console.log(
      "Catalog Matches:",
      catalogMatches.map((item) => item.metadata.product),
    );

    /*
     * =====================================================
     * Limit to Top 5
     * (Ranking will later move into HybridRetriever)
     * =====================================================
     */

    /*
     * =====================================================
     * Remove Duplicate Products
     * =====================================================
     */

    const uniqueProducts = new Map();

    for (const item of catalogMatches) {
      const key = (item.metadata.product ?? "").toLowerCase();

      if (!key) continue;

      if (!uniqueProducts.has(key)) {
        uniqueProducts.set(key, item);
      }
    }

    let rankedProducts = [...uniqueProducts.values()];

    /*
     * =====================================================
     * Business Relevance Ranking
     * =====================================================
     */

    const query = state.userMessage.toLowerCase();

    rankedProducts = rankedProducts.map((item) => {
      let score = 0;

      const text = [
        item.metadata.mainCategory,
        item.metadata.subCategory,
        item.metadata.product,
        item.content,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      // Prefer documents mentioning business keywords
      if (query.includes("hotel")) {
        if (text.includes("hotel")) score += 5;
        if (text.includes("hospitality")) score += 4;
        if (text.includes("restaurant")) score += 2;
      }

      if (query.includes("pharmacy")) {
        if (text.includes("pharmacy")) score += 5;
        if (text.includes("medical")) score += 4;
        if (text.includes("medicine")) score += 4;
        if (text.includes("clinic")) score += 3;
        if (text.includes("hospital")) score += 3;
      }

      if (query.includes("restaurant")) {
        if (text.includes("restaurant")) score += 5;
        if (text.includes("food")) score += 4;
        if (text.includes("menu")) score += 4;
      }

      // Penalize ceremonial products unless explicitly requested
      if (
        text.includes("ceremonial") &&
        !query.includes("opening ceremony") &&
        !query.includes("inauguration") &&
        !query.includes("ribbon cutting")
      ) {
        score -= 10;
      }

      return {
        ...item,
        score,
      };
    });

    /*
     * =====================================================
     * Sort by Score
     * =====================================================
     */

    rankedProducts.sort((a, b) => b.score - a.score);

    /*
     * =====================================================
     * Top Products
     * =====================================================
     */

    const topProducts = rankedProducts.slice(0, 5);
    /*
     * =====================================================
     * Build Catalog Context
     * =====================================================
     */

    const catalogContext = JSON.stringify(
      topProducts.map((item) => ({
        product: item.metadata.product,
        mainCategory: item.metadata.mainCategory,
        subCategory: item.metadata.subCategory,
        description: item.content,
      })),
      null,
      2,
    );

    /*
     * =====================================================
     * LLM Schema
     * Only explain products.
     * =====================================================
     */

    const schema = {
      type: "object",

      properties: {
        summary: {
          type: "string",
        },

        followUpQuestion: {
          type: "string",
        },

        reasons: {
          type: "array",

          items: {
            type: "object",

            properties: {
              product: {
                type: "string",
              },

              reason: {
                type: "string",
              },
            },

            required: ["product", "reason"],
          },
        },
      },

      required: ["summary", "followUpQuestion", "reasons"],
    };

    /*
     * =====================================================
     * Prompt
     * =====================================================
     */

    const prompt = RecommendationPrompt({
      customer: state.customer,
      history: state.history,
      ragContext: retrieval.context,
      catalogContext,
      message: state.userMessage,
      orderRequest: state.orderRequest,
    });

    /*
     * =====================================================
     * LLM Explanation
     * =====================================================
     */

    const llm = await llmService.invokeStructured({
      schema,

      systemPrompt: prompt,

      userMessage: state.userMessage,

      temperature: 0.05,

      topP: 0.8,
    });

    return {
      context: retrieval.context,

      documents: retrieval.documents,

      catalogMatches: topProducts,

      llm,
    };
  }
}
