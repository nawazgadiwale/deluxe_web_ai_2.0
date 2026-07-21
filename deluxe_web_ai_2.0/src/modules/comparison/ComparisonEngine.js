import ProductResolver from "../catalog/ProductResolver.js";
import ComparisonContextBuilder from "./builders/ComparisonContextBuilder.js";
import ComparisonPrompt from "../../ai/llm/prompts/ComparisonPrompt.js";
import ComparisonConversationPrompt from "../../ai/llm/prompts/ComparisonConversationPrompt.js";
import ComparisonQueryBuilder from "./builders/ComparisonQueryBuilder.js";
import LLMService from "../../ai/llm/LLMService.js";
import RAGPipeline from "../../ai/rag/retrieval/RagPipeline.js";

const resolver = new ProductResolver();
const contextBuilder = new ComparisonContextBuilder();
const queryBuilder = new ComparisonQueryBuilder();
const llmService = new LLMService();
const ragPipeline = new RAGPipeline();

export default class ComparisonEngine {
  /*
   * =====================================================
   * Execute
   * =====================================================
   */

  async execute(state) {
    if (this.isConversation(state)) {
      return this.continueConversation(state);
    }

    return this.executeComparison(state);
  }

  /*
   * =====================================================
   * Existing Comparison Conversation
   * =====================================================
   */

  isConversation(state) {
    const ctx = state.comparisonContext;

    if (!ctx?.active) {
      return false;
    }

    if (state.workflow) {
      return false;
    }

    if (state.action) {
      return false;
    }

    if (state.routing?.capability === "comparison") {
      return false;
    }

    return Boolean((state.userMessage ?? "").trim());
  }

  /*
   * =====================================================
   * Continue Conversation
   * =====================================================
   */

  async continueConversation(state) {
    const ctx = state.comparisonContext;

    let rag = { context: "" };

    try {
      rag = await ragPipeline.retrieve({
        query: state.userMessage,
        conversation: state,
        options: {
          topK: 5,
        },
      });
    } catch (error) {
      console.error("Comparison RAG Error:", error);
    }

    const catalogContext = contextBuilder.build({
      products: ctx.products,
      query: ctx.query,
    });

    const prompt = ComparisonConversationPrompt({
      comparison: state.comparison,
      catalogContext,
      ragContext: rag.context,
    });

    const answer = await llmService.invoke({
      systemPrompt: prompt,
      userMessage: state.userMessage,
      temperature: 0.2,
    });

    return {
      llm: {
        summary: answer,
        comparison: state.comparison.comparison,
        recommendation: state.comparison.recommendation,
        followUpQuestion: "Would you like to compare another product?",
      },

      query: ctx.query,

      products: ctx.products,
    };
  }

  /*
   * =====================================================
   * Generate New Comparison
   * =====================================================
   */

  async executeComparison(state) {
    /*
     * =====================================================
     * Build Query
     * =====================================================
     */

    const query = await queryBuilder.build(state);

    if (!query.products?.length || query.products.length < 2) {
      return null;
    }

    /*
     * =====================================================
     * Resolve Products
     * =====================================================
     */

    const products = [];

    for (const productName of query.products) {
      const product = await resolver.resolve(productName);

      if (product) {
        products.push(product);
      }
    }

    if (products.length < 2) {
      return null;
    }

    /*
     * =====================================================
     * Catalog Context
     * =====================================================
     */

    const catalogContext = contextBuilder.build({
      products,
      query,
    });

    /*
     * =====================================================
     * Compare Products
     * =====================================================
     */

    const schema = {
      type: "object",

      properties: {
        summary: {
          type: "string",
        },

        comparison: {
          type: "array",

          items: {
            type: "object",

            properties: {
              attribute: {
                type: "string",
              },

              product1: {
                type: "string",
              },

              product2: {
                type: "string",
              },
            },

            required: ["attribute", "product1", "product2"],
          },
        },

        recommendation: {
          type: "string",
        },

        followUpQuestion: {
          type: "string",
        },
      },

      required: ["summary", "comparison", "recommendation", "followUpQuestion"],
    };

    const systemPrompt = ComparisonPrompt({
      catalogContext,
      query,
    });

    const userMessage = query.originalQuestion;

    console.log("========== Prompt Statistics ==========");
    console.log({
      systemPromptChars: systemPrompt.length,
      catalogContextChars: catalogContext.length,
      userMessageChars: userMessage.length,
    });
    console.log("=======================================");

    const comparison = await llmService.invokeStructured({
      schema,

      systemPrompt: ComparisonPrompt({
        catalogContext,
        query,
      }),

      userMessage: query.originalQuestion,

      temperature: 0.2,
    });

    // console.log("========== COMPARISON LLM ==========");
    // console.dir(comparison, { depth: null });
    // console.log("====================================");

    /*
     * =====================================================
     * Return
     * =====================================================
     */

    return {
      llm: comparison,

      query,

      products,
    };
  }
}
