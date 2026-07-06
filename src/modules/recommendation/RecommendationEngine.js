// new clean and updated without duplicate product removal and ranking logic
import LLMService from "../../ai/llm/LLMService.js";
import RAGPipeline from "../../ai/rag/retrieval/RagPipeline.js";
import RecommendationPrompt from "../../ai/llm/prompts/RecommendationPrompt.js";
import CatalogService from "../catalog/CatalogService.js";

const llmService = new LLMService();
const ragPipeline = new RAGPipeline();
const catalogService = new CatalogService();

const SCHEMA = {
  type: "object",
  properties: {
    summary: { type: "string" },
    followUpQuestion: { type: "string" },
    reasons: {
      type: "array",
      items: {
        type: "object",
        properties: {
          product: { type: "string" },
          priority: { type: "number" },
          reason: { type: "string" },
        },
        required: ["product", "priority", "reason"],
      },
    },
  },
  required: ["summary", "followUpQuestion", "reasons"],
};

export default class RecommendationEngine {
  async generate(state) {
    console.time("RecommendationEngine");

    try {
      /*
       * =====================================================
       * Decide Mode
       * =====================================================
       */

      /*
       * =====================================================
       * Decide Mode
       * =====================================================
       */

      let mode = "RECOMMENDATION";
      let exactProduct = null;

      const selectedProduct =
        state.action?.payload?.product ??
        state.selectedProduct ??
        state.userMessage;

      console.log("Selected Product:", selectedProduct);

      if (state.capability === "product_details" && selectedProduct) {
        exactProduct = await catalogService.getProductByAction(selectedProduct);

        console.log("Exact Product:", exactProduct?.metadata?.product);

        if (exactProduct) {
          mode = "PRODUCT_DETAILS";
        }
      }

      /*
       * =====================================================
       * PRODUCT DETAILS
       * Skip RAG
       * Skip LLM
       * =====================================================
       */

      if (mode === "PRODUCT_DETAILS") {
        return {
          mode,

          context: "",

          documents: [exactProduct],

          catalogMatches: [
            {
              content: exactProduct.pageContent,
              metadata: exactProduct.metadata,
            },
          ],

          llm: {
            summary: exactProduct.pageContent,

            followUpQuestion: "Would you like to order this product?",

            reasons: [
              {
                product: exactProduct.metadata.product,
                priority: 1,
                reason: exactProduct.pageContent,
              },
            ],
          },
        };
      }

      /*
       * =====================================================
       * Retrieve
       * =====================================================
       */

      console.time("Retrieve");

      const ctx = state.recommendationContext ?? {};

      const originalQuery = ctx.originalQuery ?? state.userMessage;

      let query = originalQuery;

      if (ctx.customerType === "BUSINESS") {
        query = `
Customer Type:
Business

Business Type:
${ctx.businessType}

Business Goal:
${ctx.businessGoal}

Original Request:
${originalQuery}
`;
      }

      if (ctx.customerType === "INDIVIDUAL") {
        query = `
Customer Type:
Individual

Requirements:
${ctx.requirements}

Original Request:
${originalQuery}
`;
      }

      const retrieval = await ragPipeline.retrieve({
        query,
        conversation: state,
      });

      console.timeEnd("Retrieve");

      /*
       * =====================================================
       * Remove Duplicate Products
       * =====================================================
       */

      const products = [];
      const seen = new Set();

      for (const doc of retrieval.documents ?? []) {
        const metadata = doc.metadata ?? {};

        if (!metadata.product) continue;

        const key = metadata.product.toLowerCase();

        if (seen.has(key)) continue;

        seen.add(key);

        products.push({
          content: doc.pageContent,
          metadata,
        });
      }

      const selectedProducts = products.slice(0, 5);

      console.log(
        "Catalog Matches:",
        selectedProducts.map((p) => p.metadata.product),
      );

      /*
       * =====================================================
       * Catalog Context
       * =====================================================
       */

      const catalogContext = selectedProducts
        .map(
          (item, index) => `
Product ${index + 1}

Name: ${item.metadata.product}
Category: ${item.metadata.mainCategory}
Sub Category: ${item.metadata.subCategory}

Business Types:
${(item.metadata.businessTypes ?? []).join(", ")}

Industries:
${(item.metadata.industries ?? []).join(", ")}

Customer Goals:
${(item.metadata.customerGoals ?? []).join(", ")}

Use Cases:
${(item.metadata.useCases ?? []).join(", ")}

Related Products:
${(item.metadata.relatedProducts ?? []).join(", ")}

Frequently Bought Together:
${(item.metadata.frequentlyBoughtWith ?? []).join(", ")}

Description:
${item.content}
`,
        )
        .join("\n");

      /*
       * =====================================================
       * LLM
       * =====================================================
       */

      console.time("LLM");

      // const llm = await llmService.invokeStructured({
      //   schema: SCHEMA,

      //   systemPrompt: RecommendationPrompt({
      //     mode,
      //     message: state.userMessage,
      //     catalogContext,
      //   }),

      //   userMessage: state.userMessage,

      //   temperature: 0,

      //   topP: 0.8,
      // });

      const llm = await llmService.invoke({
        systemPrompt: RecommendationPrompt({
          mode,
          message: query,
          catalogContext,
        }),
        userMessage: query,
        temperature: 0.5,
      });
      console.log("LLM Response:", llm);

      console.timeEnd("LLM");

      return {
        mode,

        context: retrieval.context,

        documents: retrieval.documents,

        catalogMatches: selectedProducts,

        llm,
      };
    } finally {
      console.timeEnd("RecommendationEngine");
    }
  }
}
