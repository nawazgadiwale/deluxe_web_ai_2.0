// import LLMService from "../../ai/llm/LLMService.js";
// import RAGPipeline from "../../ai/rag/retrieval/RagPipeline.js";
// import RecommendationPrompt from "../../ai/llm/prompts/RecommendationPrompt.js";

// const llmService = new LLMService();
// const ragPipeline = new RAGPipeline();

// export default class RecommendationEngine {
//   async generate(state, mode = "RECOMMENDATION") {
//     /*
//      * Retrieve Catalog Matches
//      */

//     const retrieval = await ragPipeline.retrieve({
//       query: state.userMessage,
//       conversation: state,
//     });

//     /*
//      * Convert Retrieved Documents
//      */

//     const catalogMatches = retrieval.documents.map((doc) => ({
//       content: doc.pageContent,
//       metadata: doc.metadata ?? {},
//     }));

//     console.log(
//       "Catalog Matches:",
//       catalogMatches.map((item) => item.metadata.product),
//     );

//     /*
//      * Remove Duplicate Products
//      */

//     const uniqueProducts = new Map();

//     for (const item of catalogMatches) {
//       const product = item.metadata.product;

//       if (!product) continue;

//       const key = product.toLowerCase();

//       if (!uniqueProducts.has(key)) {
//         uniqueProducts.set(key, item);
//       }
//     }

//     let rankedProducts = [...uniqueProducts.values()];

//     /*
//      * Generic Metadata Ranking
//      */

//     const normalizedQuery = retrieval.normalizedQuery;

//     const queryText = [
//       normalizedQuery.normalizedQuery,

//       ...(normalizedQuery.keywords ?? []),

//       normalizedQuery.entities?.businessType,

//       ...(normalizedQuery.entities?.customerGoals ?? []),
//     ]
//       .filter(Boolean)
//       .join(" ")
//       .toLowerCase();

//     rankedProducts = rankedProducts.map((item) => {
//       const metadata = item.metadata ?? {};

//       let score = 0;

//       const contains = (value = "") =>
//         queryText.includes(String(value).toLowerCase());

//       /*
//        * Product
//        */

//       if (contains(metadata.product)) score += 40;

//       /*
//        * Categories
//        */

//       if (contains(metadata.mainCategory)) score += 12;

//       if (contains(metadata.subCategory)) score += 10;

//       /*
//        * Business Types
//        */

//       for (const value of metadata.businessTypes ?? []) {
//         if (contains(value)) score += 18;
//       }

//       /*
//        * Industries
//        */

//       for (const value of metadata.industries ?? []) {
//         if (contains(value)) score += 15;
//       }

//       /*
//        * Customer Goals
//        */

//       for (const value of metadata.customerGoals ?? []) {
//         if (contains(value)) score += 14;
//       }

//       /*
//        * Use Cases
//        */

//       for (const value of metadata.useCases ?? []) {
//         if (contains(value)) score += 10;
//       }

//       /*
//        * Keywords
//        */

//       for (const value of metadata.keywords ?? []) {
//         if (contains(value)) score += 8;
//       }

//       /*
//        * Synonyms
//        */

//       for (const value of metadata.synonyms ?? []) {
//         if (contains(value)) score += 8;
//       }

//       /*
//        * Related Products
//        */

//       for (const value of metadata.relatedProducts ?? []) {
//         if (contains(value)) score += 4;
//       }

//       /*
//        * Frequently Bought Together
//        */

//       for (const value of metadata.frequentlyBoughtWith ?? []) {
//         if (contains(value)) score += 3;
//       }

//       /*
//        * Description
//        */

//       const description = (item.content ?? "").toLowerCase();

//       for (const keyword of normalizedQuery.keywords ?? []) {
//         if (description.includes(keyword)) {
//           score += 2;
//         }
//       }

//       /*
//        * Semantic Score
//        */

//       score += (metadata.score ?? 0) * 50;

//       return {
//         ...item,
//         score,
//       };
//     });

//     /*
//      * Sort
//      */

//     rankedProducts.sort((a, b) => b.score - a.score);

//     /*
//      * Top Products
//      */

//     let topProducts;

//     if (mode === "PRODUCT_DETAILS") {
//       topProducts = rankedProducts.slice(0, 1);
//     } else {
//       topProducts = rankedProducts.slice(0, 5);
//     }
//     /*
//      * Build Catalog Context
//      */

//     const catalogContext = JSON.stringify(
//       topProducts.map((item) => ({
//         product: item.metadata.product,

//         mainCategory: item.metadata.mainCategory,

//         subCategory: item.metadata.subCategory,

//         description: item.content,

//         keywords: item.metadata.keywords ?? [],

//         synonyms: item.metadata.synonyms ?? [],

//         industries: item.metadata.industries ?? [],

//         businessTypes: item.metadata.businessTypes ?? [],

//         useCases: item.metadata.useCases ?? [],

//         customerGoals: item.metadata.customerGoals ?? [],

//         relatedProducts: item.metadata.relatedProducts ?? [],

//         frequentlyBoughtWith: item.metadata.frequentlyBoughtWith ?? [],
//       })),
//       null,
//       2,
//     );

//     /*
//      * LLM Schema
//      * Only explain products.
//      */

//     const schema = {
//       type: "object",

//       properties: {
//         summary: {
//           type: "string",
//         },

//         followUpQuestion: {
//           type: "string",
//         },

//         reasons: {
//           type: "array",

//           items: {
//             type: "object",

//             properties: {
//               product: {
//                 type: "string",
//               },

//               reason: {
//                 type: "string",
//               },
//             },

//             required: ["product", "reason"],
//           },
//         },
//       },

//       required: ["summary", "followUpQuestion", "reasons"],
//     };

//     /*
//      * Prompt
//      */

//     const prompt = RecommendationPrompt({
//       mode,

//       customer: state.customer,

//       history: state.history,

//       ragContext: retrieval.context,

//       catalogContext,

//       message: state.userMessage,

//       orderRequest: state.orderRequest,
//     });

//     /*
//      * LLM Explanation
//      */

//     const llm = await llmService.invokeStructured({
//       schema,

//       systemPrompt: prompt,

//       userMessage: state.userMessage,

//       temperature: 0.05,

//       topP: 0.8,
//     });

//     return {
//       mode,

//       context: retrieval.context,

//       documents: retrieval.documents,

//       catalogMatches: topProducts,

//       llm,
//     };
//   }
// }

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

      let mode = "RECOMMENDATION";
      let exactProduct = null;

      if (state.capability === "product_details") {
        exactProduct = await catalogService.findProductByName(
          state.userMessage,
        );

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

      const retrieval = await ragPipeline.retrieve({
        query: state.userMessage,
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
          message: state.userMessage,
          catalogContext,
        }),
        userMessage: state.userMessage,
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
