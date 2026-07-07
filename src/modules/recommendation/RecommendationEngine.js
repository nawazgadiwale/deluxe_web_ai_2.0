import { jsonrepair } from "jsonrepair";

import CatalogService from "../catalog/CatalogService.js";

import RecommendationPrompt from "../../ai/llm/prompts/RecommendationPrompt.js";
import LLMService from "../../ai/llm/LLMService.js";
import RAGPipeline from "../../ai/rag/retrieval/RagPipeline.js";

import CatalogContextBuilder from "./builders/CatalogContextBuilder.js";
import RecommendationFusion from "./recommendationranking/RecommendationFusion.js";

const catalogService = new CatalogService();
const ragPipeline = new RAGPipeline();
const llmService = new LLMService();

const contextBuilder = new CatalogContextBuilder();
const fusion = new RecommendationFusion();

export default class RecommendationEngine {
  async generate(state) {
    const query = this.buildQuery(state);

    /*
     * =====================================================
     * Parallel Retrieval
     * =====================================================
     */

    const [catalogMatches, rag] = await Promise.all([
      catalogService.searchProducts(query, 8),

      ragPipeline.retrieve({
        query,
        conversation: state,
        options: {
          topK: 8,
        },
      }),
    ]);

    /*
     * =====================================================
     * Hybrid Fusion
     * =====================================================
     */

    const fusedProducts = fusion.merge(catalogMatches, rag.documents ?? []);

    const finalProducts = this.rankProducts(
      fusedProducts,
      state.recommendationContext,
    ).slice(0, 5);

    /*
     * =====================================================
     * No Products
     * =====================================================
     */

    if (!finalProducts.length) {
      return {
        llm: {
          summary: "Sorry, I couldn't find any matching products.",
          followUpQuestion:
            "Can you tell me more about what you're looking for?",
          reasons: [],
        },

        catalogMatches: [],

        context: rag.context ?? "",

        documents: rag.documents ?? [],
      };
    }

    /*
     * =====================================================
     * Context
     * =====================================================
     */

    const catalogContext = contextBuilder.build(finalProducts);

    /*
     * =====================================================
     * LLM
     * =====================================================
     */

    const raw = await llmService.invoke({
      systemPrompt: RecommendationPrompt({
        message: query,
        catalogContext,
      }),

      userMessage: query,

      temperature: 0.2,
    });

    let llm;

    try {
      llm = JSON.parse(jsonrepair(raw));
    } catch (err) {
      console.error("Recommendation JSON Error:", err);

      llm = {
        summary: "Here are the recommended products.",

        followUpQuestion:
          "Would you like more information about any of these products?",

        reasons: [],
      };
    }

    /*
     * =====================================================
     * Result
     * =====================================================
     */

    return {
      llm,

      catalogMatches: finalProducts,

      context: rag.context ?? "",

      documents: rag.documents ?? [],
    };
  }

  rankProducts(products = [], ctx = {}) {
    const businessType = (ctx.businessType ?? "").toLowerCase();

    const goal = (ctx.businessGoal ?? "").toLowerCase();

    const requirement = (
      ctx.requirements ??
      ctx.originalQuery ??
      ""
    ).toLowerCase();

    const selectedCategories = new Set();

    const ranked = products
      .map((product) => {
        const metadata = product.metadata ?? {};

        const methods = metadata.retrievalMethods ?? [];

        let score = metadata.hybridScore ?? metadata.score ?? 0;

        /*
         * Prefer Catalog over Semantic
         */

        if (methods.includes("CATALOG")) {
          score += 7;
        }

        if (methods.includes("SEMANTIC")) {
          score += 3;
        }

        const searchable = [
          ...(metadata.businessTypes ?? []),
          ...(metadata.industries ?? []),
          ...(metadata.customerGoals ?? []),
          ...(metadata.useCases ?? []),
          ...(metadata.keywords ?? []),
          ...(metadata.tags ?? []),
          ...(metadata.synonyms ?? []),
          product.pageContent ?? "",
          product.content ?? "",
        ]
          .join(" ")
          .toLowerCase();

        businessType
          .split(/\s+/)
          .filter(Boolean)
          .forEach((word) => {
            if (searchable.includes(word)) {
              score += 3;
            }
          });

        goal
          .split(/\s+/)
          .filter(Boolean)
          .forEach((word) => {
            if (searchable.includes(word)) {
              score += 3;
            }
          });

        requirement
          .split(/\s+/)
          .filter((w) => w.length > 2)
          .forEach((word) => {
            if (searchable.includes(word)) {
              score += 1;
            }
          });

        return {
          ...product,
          metadata: {
            ...metadata,
            finalScore: score,
          },
        };
      })
      .sort((a, b) => b.metadata.finalScore - a.metadata.finalScore);

    /*
     * Category Diversity
     */

    const diversified = [];

    for (const product of ranked) {
      const category = product.metadata?.mainCategory ?? "Other";

      if (selectedCategories.has(category)) {
        continue;
      }

      selectedCategories.add(category);
      diversified.push(product);

      if (diversified.length === 5) {
        break;
      }
    }

    /*
     * Fill remaining slots
     */

    if (diversified.length < 5) {
      for (const product of ranked) {
        if (diversified.includes(product)) {
          continue;
        }

        diversified.push(product);

        if (diversified.length === 5) {
          break;
        }
      }
    }

    return diversified;
  }

  buildQuery(state) {
    const ctx = state.recommendationContext ?? {};

    /*
     * =====================================================
     * Direct Recommendation
     * =====================================================
     */

    if (!ctx.customerType) {
      return state.userMessage;
    }

    /*
     * =====================================================
     * Business
     * =====================================================
     */

    if (ctx.customerType === "BUSINESS") {
      return `
Customer Type:
Business

Business Type:
${ctx.businessType ?? "Not specified"}

Business Objective:
${ctx.businessGoal ?? "Not specified"}

Customer Requirement:
${ctx.requirements ?? "Not specified"}

Original Request:
${ctx.originalQuery ?? state.userMessage}
`;
    }

    /*
     * =====================================================
     * Individual
     * =====================================================
     */

    return `
Customer Type:
Individual

Occasion:
${ctx.occasion ?? "Not specified"}

Requirement:
${ctx.requirements ?? "Not specified"}

Original Request:
${ctx.originalQuery ?? state.userMessage}
`;
  }
}
