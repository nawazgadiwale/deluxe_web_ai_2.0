import { jsonrepair } from "jsonrepair";

import CatalogService from "../catalog/CatalogService.js";

import RecommendationPrompt from "../../ai/llm/prompts/RecommendationPrompt.js";
import LLMService from "../../ai/llm/LLMService.js";
import RAGPipeline from "../../ai/rag/retrieval/RagPipeline.js";
import RecommendationConversationPrompt from "../../ai/llm/prompts/RecommendationConversationPrompt.js";

import CatalogContextBuilder from "./builders/CatalogContextBuilder.js";
import RecommendationFusion from "./recommendationranking/RecommendationFusion.js";
import BUSINESS_KNOWLEDGE from "./knowledge/BusinessKnowledge.js";

const catalogService = new CatalogService();
const ragPipeline = new RAGPipeline();
const llmService = new LLMService();

const contextBuilder = new CatalogContextBuilder();
const fusion = new RecommendationFusion();

export default class RecommendationEngine {
  async execute(state) {
    if (this.isConversation(state)) {
      return this.continueConversation(state);
    }

    return this.generate(state);
  }

  isConversation(state) {
    const ctx = state.recommendationContext ?? {};

    // No recommendation session
    if (!ctx.active) {
      return false;
    }

    // Another workflow owns the conversation
    if (state.workflow && state.workflow !== "RECOMMENDATION") {
      return false;
    }

    // Still collecting recommendation inputs.
    // We should generate recommendations next,
    // not answer conversationally.
    if (state.awaitingDecision) {
      return false;
    }

    // Recommendation conversation starts only
    // AFTER products have already been generated.
    return (ctx.catalogProducts?.length ?? 0) > 0;
  }

  async continueConversation(state) {
    const ctx = state.recommendationContext ?? {};

    const rag = await ragPipeline.retrieve({
      query: state.userMessage,
      conversation: state,
      options: {
        topK: 5,
      },
    });

    const catalogContext = contextBuilder.build(ctx.catalogProducts ?? []);

    const prompt = RecommendationConversationPrompt({
      context: {
        customerType: ctx.customerType,

        businessType: ctx.businessType,

        businessGoals: ctx.businessGoals ?? [],

        requirements: ctx.requirements ?? [],

        targetAudience: ctx.targetAudience ?? [],

        campaigns: ctx.campaigns ?? [],

        constraints: ctx.constraints ?? [],

        ragContext: rag.context,
      },
      catalogContext,
    });

    const answer = await llmService.invoke({
      systemPrompt: prompt,
      userMessage: state.userMessage,
      temperature: 0.2,
    });

    return {
      llm: {
        summary: answer,
        followUpQuestion:
          "Would you like more details about any of these products?",
        reasons: [],
      },

      catalogMatches: ctx.catalogProducts ?? [],

      context: rag.context,

      documents: rag.documents,
    };
  }

  // business knowledge
  buildRecommendationProfile(ctx = {}) {
    const businessType = (ctx.businessType ?? "").trim().toLowerCase();

    const business =
      Object.entries(BUSINESS_KNOWLEDGE).find(
        ([key]) => key.toLowerCase() === businessType,
      )?.[1] ?? BUSINESS_KNOWLEDGE.Other;

    return {
      business,
      goals: business.goals ?? [],
      challenges: business.challenges ?? [],
      salesStrategy: business.salesStrategy,
      upsellStrategy: business.upsellStrategy,
    };
  }

  async generate(state) {
    const query = this.buildQuery(state);

    const profile = this.buildRecommendationProfile(
      state.recommendationContext,
    );

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
      profile,
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
        profile,
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

  rankProducts(products = [], profile = {}, ctx = {}) {
    const businessType = (ctx.businessType ?? "").toLowerCase();

    const goals = (ctx.businessGoals ?? []).map((g) => g.toLowerCase());

    const requirements = (
      ctx.requirements?.length ? ctx.requirements : [ctx.originalQuery ?? ""]
    ).map((r) => r.toLowerCase());

    const targetAudience = (ctx.targetAudience ?? []).map((t) =>
      t.toLowerCase(),
    );

    const campaigns = (ctx.campaigns ?? []).map((c) => c.toLowerCase());

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

        /*
         * =====================================================
         * Business Goal Match
         * =====================================================
         */

        for (const goal of profile.goals ?? []) {
          if (this.matchesConcept(searchable, goal)) {
            score += 4;
          }
        }

        /*
         * =====================================================
         * Business Challenge Match
         * =====================================================
         */

        for (const challenge of profile.challenges ?? []) {
          if (searchable.includes(challenge.name.toLowerCase())) {
            score += 2;
          }
        }

        /*
         * =====================================================
         * Sales Strategy Match
         * =====================================================
         */

        const preferredGoals = profile.salesStrategy?.preferredGoals ?? [];

        for (const goal of preferredGoals) {
          if (searchable.includes(goal.name.toLowerCase())) {
            score += 3;
          }
        }

        businessType
          .split(/\s+/)
          .filter(Boolean)
          .forEach((word) => {
            if (searchable.includes(word)) {
              score += 3;
            }
          });

        for (const goal of goals) {
          goal
            .split(/\s+/)
            .filter(Boolean)
            .forEach((word) => {
              if (searchable.includes(word)) {
                score += 3;
              }
            });
        }

        for (const requirement of requirements) {
          requirement
            .split(/\s+/)
            .filter((w) => w.length > 2)
            .forEach((word) => {
              if (searchable.includes(word)) {
                score += 1;
              }
            });
        }

        for (const audience of targetAudience) {
          audience
            .split(/\s+/)
            .filter((w) => w.length > 2)
            .forEach((word) => {
              if (searchable.includes(word)) {
                score += 2;
              }
            });
        }

        for (const campaign of campaigns) {
          campaign
            .split(/\s+/)
            .filter((w) => w.length > 2)
            .forEach((word) => {
              if (searchable.includes(word)) {
                score += 2;
              }
            });
        }

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

Business Objectives:
${ctx.businessGoals?.length ? ctx.businessGoals.join(", ") : "Not specified"}

Customer Requirements:
${ctx.requirements?.length ? ctx.requirements.join("\n") : "Not specified"}

Target Audience:
${ctx.targetAudience?.length ? ctx.targetAudience.join(", ") : "Not specified"}

Campaigns:
${ctx.campaigns?.length ? ctx.campaigns.join(", ") : "Not specified"}

Constraints:
${ctx.constraints?.length ? ctx.constraints.join(", ") : "Not specified"}

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
`;
  }

  // helper
  matchesConcept(searchable, concept = {}) {
    const values = [
      concept.name,
      ...(concept.aliases ?? []),
      ...(concept.keywords ?? []),
    ]
      .filter(Boolean)
      .map((v) => v.toLowerCase());

    return values.some((value) => searchable.includes(value));
  }
}
