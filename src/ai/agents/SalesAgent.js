import BaseAgent from "./BaseAgent.js";

import ResponseBuilder from "../../core/responses/Apiresponse.js";
import RecommendationService from "../../modules/recommendation/RecommendationService.js";

const responseBuilder = new ResponseBuilder();
const recommendationService = new RecommendationService();

export default class SalesAgent extends BaseAgent {
  async execute(state) {
    // console.log("RecommendationNode Executed");

    /*
     * =====================================================
     * Recommendation Context
     * =====================================================
     */

    state.recommendationContext ??= {
      customerType: null,
      businessType: null,
      businessGoal: null,
      requirements: null,
      originalQuery: null,

      products: [],
      totalProducts: 0,
      page: 1,
      hasMore: false,
    };

    const ctx = state.recommendationContext;

    /*
     * Preserve the original recommendation request.
     */

    if (!ctx.originalQuery && !state.action) {
      ctx.originalQuery = state.userMessage;
    }

    /*
     * =====================================================
     * Update Recommendation Context
     * =====================================================
     */
    const text = (state.userMessage ?? "").trim().toLowerCase();

    if (!state.action) {
      if (state.currentStep === "ASK_CUSTOMER_TYPE") {
        if (["business", "company", "corporate", "office"].includes(text)) {
          ctx.customerType = "BUSINESS";
        }

        if (["individual", "personal", "myself", "me"].includes(text)) {
          ctx.customerType = "INDIVIDUAL";
        }
      }

      if (state.currentStep === "ASK_BUSINESS_TYPE") {
        const map = {
          cafe: "Cafe",
          restaurant: "Restaurant",
          hotel: "Hotel",
          retail: "Retail",
          hospital: "Hospital",
          other: "Other",
        };

        if (map[text]) {
          ctx.businessType = map[text];
        }
      }

      if (state.currentStep === "ASK_BUSINESS_GOAL") {
        const goals = {
          branding: "Brand Awareness",
          promotion: "Marketing & Promotion",
          marketing: "Marketing & Promotion",
          packaging: "Packaging",
          signage: "Store Branding",
          "store branding": "Store Branding",
        };

        if (goals[text]) {
          ctx.businessGoal = goals[text];
        }
      }

      if (
        state.currentStep === "ASK_REQUIREMENTS" &&
        ctx.customerType === "INDIVIDUAL"
      ) {
        ctx.requirements = state.userMessage.trim();
      }
    }

    const payload = state.action?.payload ?? {};
    console.log("===== BEFORE UPDATE =====");
    console.log(ctx);
    console.log(payload);

    console.log("===== FINAL CTX =====");
    console.dir(ctx, { depth: null });
    if (payload.customerType) {
      ctx.customerType = payload.customerType;
    }

    if (payload.businessType) {
      ctx.businessType = payload.businessType;
    }
    console.log("===== AFTER UPDATE =====");
    console.log(ctx);

    if (payload.businessGoal) {
      ctx.businessGoal = payload.businessGoal;
    }

    if (
      ctx.customerType === "INDIVIDUAL" &&
      state.currentStep === "ASK_REQUIREMENTS" &&
      state.userMessage?.trim()
    ) {
      ctx.requirements = state.userMessage.trim();
    }

    if (!ctx.customerType) {
      state.workflow = "RECOMMENDATION";
      state.currentStep = "ASK_CUSTOMER_TYPE";
      state.awaitingDecision = true;

      state.response = responseBuilder.recommendation({
        summary: "Let's find the right products for you.",

        followUpQuestion:
          "Are you looking for products for your business or personal use?",

        products: [],

        actions: [
          {
            id: "RECOMMENDATION_BUSINESS",
            label: "Business",
            payload: {
              customerType: "BUSINESS",
            },
          },
          {
            id: "RECOMMENDATION_INDIVIDUAL",
            label: "Individual",
            payload: {
              customerType: "INDIVIDUAL",
            },
          },
        ],
      });
      state.persistence.conversation = {
        ...state.persistence.conversation,
        dirty: true,
        updatedAt: new Date(),
      };

      // console.log("SalesAgent saving workflow");
      // console.log(state.workflow);
      // console.log(state.currentStep);
      // console.log(state.persistence.conversation);
      return state;
    }
    if (ctx.customerType === "BUSINESS" && !ctx.businessType) {
      state.workflow = "RECOMMENDATION";
      state.currentStep = "ASK_BUSINESS_TYPE";
      state.awaitingDecision = true;

      state.response = responseBuilder.recommendation({
        summary: "What type of business do you have?",

        products: [],

        actions: [
          {
            id: "BUSINESS_CAFE",
            label: "Cafe",
            payload: {
              businessType: "Cafe",
            },
          },
          {
            id: "BUSINESS_RESTAURANT",
            label: "Restaurant",
            payload: {
              businessType: "Restaurant",
            },
          },
          {
            id: "BUSINESS_HOTEL",
            label: "Hotel",
            payload: {
              businessType: "Hotel",
            },
          },
          {
            id: "BUSINESS_RETAIL",
            label: "Retail",
            payload: {
              businessType: "Retail",
            },
          },
          {
            id: "BUSINESS_HOSPITAL",
            label: "Hospital",
            payload: {
              businessType: "Hospital",
            },
          },
          {
            id: "BUSINESS_OTHER",
            label: "Other",
            payload: {
              businessType: "Other",
            },
          },
        ],
      });
      state.persistence.conversation = {
        ...state.persistence.conversation,
        dirty: true,
        updatedAt: new Date(),
      };

      // console.log("SalesAgent saving workflow");
      // console.log(state.workflow);
      // console.log(state.currentStep);
      // console.log(state.persistence.conversation);
      return state;
    }
    /*
     * =====================================================
     * Ask Business Goal
     * =====================================================
     */

    if (ctx.customerType === "BUSINESS" && !ctx.businessGoal) {
      state.workflow = "RECOMMENDATION";
      state.currentStep = "ASK_BUSINESS_GOAL";
      state.awaitingDecision = true;

      state.response = responseBuilder.recommendation({
        summary: "What is your primary objective?",

        products: [],

        actions: [
          {
            id: "GOAL_BRANDING",
            label: "Brand Awareness",
            payload: {
              businessGoal: "Brand Awareness",
            },
          },
          {
            id: "GOAL_PROMOTION",
            label: "Marketing & Promotion",
            payload: {
              businessGoal: "Marketing & Promotion",
            },
          },
          {
            id: "GOAL_PACKAGING",
            label: "Packaging",
            payload: {
              businessGoal: "Packaging",
            },
          },
          {
            id: "GOAL_SIGNAGE",
            label: "Store Branding",
            payload: {
              businessGoal: "Store Branding",
            },
          },
        ],
      });
      state.persistence.conversation = {
        ...state.persistence.conversation,
        dirty: true,
        updatedAt: new Date(),
      };

      // console.log("SalesAgent saving workflow");
      // console.log(state.workflow);
      // console.log(state.currentStep);
      // console.log(state.persistence.conversation);

      return state;
    }

    /*
     * =====================================================
     * Ask Individual Requirements
     * =====================================================
     */

    if (ctx.customerType === "INDIVIDUAL" && !ctx.requirements) {
      state.workflow = "RECOMMENDATION";
      state.currentStep = "ASK_REQUIREMENTS";
      state.awaitingDecision = true;

      state.response = responseBuilder.recommendation({
        summary: "Tell me what you're looking for.",

        followUpQuestion:
          "For example: Wedding invitations, Birthday gifts, Custom mugs, Personalized T-shirts.",

        products: [],

        actions: [],
      });
      state.persistence.conversation = {
        ...state.persistence.conversation,
        dirty: true,
        updatedAt: new Date(),
      };

      // console.log("SalesAgent saving workflow");
      // console.log(state.workflow);
      // console.log(state.currentStep);
      // console.log(state.persistence.conversation);
      return state;
    }

    /*
     * =====================================================
     * Generate Recommendation
     * =====================================================
     */

    const result = await recommendationService.generate(state);

    // console.log("Recommendation generated");

    /*
     * =====================================================
     * Store Retrieval Context
     * =====================================================
     */

    state.rag = {
      context: result.context,
      documents: result.documents,
    };

    /*
     * =====================================================
     * Store Recommendation
     * =====================================================
     */

    state.recommendation = result.recommendation;

    /*
     * =====================================================
     * Update Recommendation Context
     * =====================================================
     */

    ctx.products = result.recommendation.products;

    ctx.totalProducts = result.recommendation.products.length;

    ctx.page = 1;

    ctx.hasMore = false;

    /*
     * =====================================================
     * Recommendation Workflow
     * =====================================================
     */

    if (!state.workflow || state.workflow === "NONE") {
      state.workflow = "RECOMMENDATION";
    }
    state.currentStep = "SHOW_RECOMMENDATIONS";
    state.awaitingDecision = true;

    /*
     * =====================================================
     * Recommendation should not overwrite
     * existing draft order.
     * =====================================================
     */

    state.activeOrderItem = null;

    /*
     * =====================================================
     * Persistence
     * =====================================================
     */

    state.persistence.conversation.dirty = true;
    state.persistence.conversation.updatedAt = new Date();

    /*
     * =====================================================
     * Response
     * =====================================================
     */
    state.persistence.conversation = {
      ...state.persistence.conversation,
      dirty: true,
      updatedAt: new Date(),
    };

    // console.log("SalesAgent saving workflow");
    // console.log(state.workflow);
    // console.log(state.currentStep);
    // console.log(state.persistence.conversation);
    state.response = responseBuilder.recommendation(result.recommendation);
    // console.log("========== SALES AGENT ==========");
    // console.log("Dirty:", state.persistence.conversation.dirty);
    // console.log("Workflow:", state.workflow);
    // console.log("Step:", state.currentStep);
    // console.log("=================================");
    return state;
    // console.log("========== SALES AGENT ==========");
    // console.log("Dirty Before Return:", state.persistence.conversation.dirty);
    // console.log("Workflow:", state.workflow);
    // console.log("Current Step:", state.currentStep);
    // console.log("=================================");
  }
}
