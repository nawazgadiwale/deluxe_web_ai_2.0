import ResponseBuilder from "../../../core/responses/Apiresponse.js";
import { RECOMMENDATION_RESET_PATTERNS } from "../../routing/utils/RoutingConstants.js";
import BUSINESS_KNOWLEDGE from "../knowledge/BusinessKnowledge.js";

const responseBuilder = new ResponseBuilder();

/*
 * =====================================================
 * Dictionaries
 * =====================================================
 */

const BUSINESS_TYPES = {
  cafe: "Cafe",
  coffee: "Cafe",
  restaurant: "Restaurant",
  hotel: "Hotel",
  clinic: "Clinic",
  hospital: "Hospital",
  school: "School",
  college: "College",
  office: "Corporate Office",
  corporate: "Corporate Office",
  retail: "Retail",
  supermarket: "Supermarket",
  bakery: "Bakery",
  salon: "Salon",
  spa: "Spa",
  pharmacy: "Pharmacy",
  gym: "Gym",
};

const OCCASIONS = {
  wedding: "Wedding",
  birthday: "Birthday",
  baby: "Baby Shower",
  graduation: "Graduation",
  anniversary: "Anniversary",
  festival: "Festival",
  ramadan: "Ramadan",
  eid: "Eid",
  christmas: "Christmas",
  gift: "Gift",
  invitation: "Invitation",
};
export default class RecommendationQuestionEngine {
  execute(state) {
    state.recommendationContext ??= {
      /*
       * =====================================================
       * Conversation
       * =====================================================
       */

      active: false,
      completed: false,

      conversationStage: "DISCOVERY",

      originalQuery: null,

      /*
       * =====================================================
       * Customer Profile
       * =====================================================
       */

      customerType: null,

      businessType: null,

      occasion: null,

      /*
       * =====================================================
       * Business Understanding
       * =====================================================
       */

      goals: [],

      businessGoals: [],

      challenges: [],

      targetAudience: [],

      campaigns: [],

      requirements: [],

      constraints: [],

      budget: null,

      timeline: null,

      /*
       * =====================================================
       * AI Understanding
       * =====================================================
       */

      confidence: 0,

      missingInformation: [],

      extracted: {},

      lastQuestion: null,

      /*
       * =====================================================
       * Recommendation
       * =====================================================
       */

      products: [],

      catalogProducts: [],

      totalProducts: 0,

      page: 1,

      hasMore: false,
    };

    const ctx = state.recommendationContext;

    /*
     * =====================================================
     * Start New Recommendation Session
     * =====================================================
     */

    this.resetIfNewRecommendation(state, ctx);

    /*
     * =====================================================
     * Store Original Query
     * =====================================================
     */

    if (!state.action && !ctx.originalQuery) {
      ctx.originalQuery = state.userMessage;
    }

    /*
     * =====================================================
     * Update Context
     * =====================================================
     */

    this.updateContext(state, ctx);

    /*
     * =====================================================
     * Customer Type
     * =====================================================
     */

    if (!ctx.customerType) {
      state.workflow = "RECOMMENDATION";
      state.currentStep = "ASK_CUSTOMER_TYPE";
      state.awaitingDecision = true;
      ctx.active = true;

      return {
        ready: false,
        response: responseBuilder.recommendation({
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
        }),
      };
    }

    /*
     * =====================================================
     * Business Flow
     * =====================================================
     */
    if (ctx.customerType === "BUSINESS") {
      if (!ctx.businessType) {
        state.workflow = "RECOMMENDATION";
        state.currentStep = "ASK_BUSINESS_TYPE";
        state.awaitingDecision = true;
        ctx.active = true;

        const businessExamples = Object.keys(BUSINESS_KNOWLEDGE)
          .filter((name) => name !== "Other")
          .slice(0, 8)
          .join(", ");

        return {
          ready: false,
          response: responseBuilder.recommendation({
            summary:
              "To recommend the most suitable printing solution, I'd like to understand your business.",

            followUpQuestion: `What type of business do you operate? For example: ${businessExamples}.`,

            products: [],
            actions: [],
          }),
        };
      }
      if (!ctx.businessGoals?.length) {
        state.workflow = "RECOMMENDATION";
        state.currentStep = "ASK_BUSINESS_GOAL";
        state.awaitingDecision = true;
        ctx.active = true;

        const business =
          BUSINESS_KNOWLEDGE[ctx.businessType] ?? BUSINESS_KNOWLEDGE.Other;

        const goalOptions = business.goals.map((goal) => goal.name).join(", ");

        return {
          ready: false,
          response: responseBuilder.recommendation({
            summary: `What would you like your printed materials to achieve for your ${ctx.businessType.toLowerCase()}?`,
            followUpQuestion: `For example: ${goalOptions}. This helps me recommend the most suitable printing products for your business.`,
            products: [],

            actions: [],
          }),
        };
      }

      return {
        ready: true,
      };
    }

    /*
     * =====================================================
     * Individual Flow
     * =====================================================
     */

    if (ctx.customerType === "INDIVIDUAL") {
      if (!ctx.occasion) {
        state.workflow = "RECOMMENDATION";
        state.currentStep = "ASK_OCCASION";
        state.awaitingDecision = true;
        ctx.active = true;

        return {
          ready: false,
          response: responseBuilder.recommendation({
            summary: "What is the occasion?",
            followUpQuestion:
              "Wedding, Birthday, Anniversary, Graduation, Baby Shower...",
            products: [],
            actions: [],
          }),
        };
      }
      if (!ctx.requirements?.length) {
        state.workflow = "RECOMMENDATION";
        state.currentStep = "ASK_REQUIREMENTS";
        state.awaitingDecision = true;
        ctx.active = true;

        return {
          ready: false,
          response: responseBuilder.recommendation({
            summary: "Tell me what you're looking for.",
            followUpQuestion:
              "Invitation cards, gifts, apparel, souvenirs, decorations...",
            products: [],
            actions: [],
          }),
        };
      }

      return {
        ready: true,
      };
    }

    /*
     * =====================================================
     * Ready
     * =====================================================
     */

    return {
      ready: true,
    };
  }

  resetIfNewRecommendation(state, ctx) {
    /*
     * -----------------------------------------
     * No active recommendation
     * -----------------------------------------
     */

    if (!ctx.active) {
      return;
    }

    /*
     * -----------------------------------------
     * Ignore UI actions
     * -----------------------------------------
     */

    if (state.action) {
      return;
    }

    const message = (state.userMessage ?? "").trim().toLowerCase();

    /*
     * -----------------------------------------
     * Fresh recommendation request
     * -----------------------------------------
     */
    const newRecommendationRequest = RECOMMENDATION_RESET_PATTERNS.some(
      (keyword) => message.includes(keyword),
    );
    if (!newRecommendationRequest) {
      return;
    }

    // console.log("[Recommendation] Starting New Recommendation Session");

    Object.assign(ctx, {
      customerType: null,

      businessType: null,

      businessGoal: null,

      occasion: null,

      requirements: null,

      originalQuery: null,

      completedAt: null,

      extracted: false,

      active: false,

      products: [],

      totalProducts: 0,

      page: 1,

      hasMore: false,
    });

    /*
     * Reset workflow
     */

    state.workflow = null;
    state.currentStep = null;
    state.awaitingDecision = false;
  }

  updateContext(state, ctx) {
    const payload = state.action?.payload ?? {};
    const text = (state.userMessage ?? "").trim().toLowerCase();

    /*
     * =====================================================
     * Cached Dictionaries
     * =====================================================
     */

    const businessTypes = Object.entries(BUSINESS_TYPES);
    const occasions = Object.entries(OCCASIONS);

    /*
     * =====================================================
     * Automatic Extraction
     * =====================================================
     */

    if (!state.action) {
      /*
       * --------------------------
       * Business Type
       * --------------------------
       */

      for (const [keyword, value] of businessTypes) {
        if (text.includes(keyword)) {
          ctx.customerType = "BUSINESS";
          ctx.businessType = value;
          break;
        }
      }

      /*
       * --------------------------
       * Business Goal
       * --------------------------
       */

      const business =
        BUSINESS_KNOWLEDGE[ctx.businessType] ?? BUSINESS_KNOWLEDGE.Other;

      for (const goal of business.goals) {
        if (this.matchesGoal(text, goal)) {
          ctx.businessGoals = [goal.name];
          break;
        }
      }

      /*
       * --------------------------
       * Occasion
       * --------------------------
       */

      if (state.currentStep === "ASK_OCCASION") {
        for (const [keyword, value] of occasions) {
          if (text.includes(keyword)) {
            ctx.occasion = value;
            break;
          }
        }
      }

      /*
       * --------------------------
       * Requirement
       * --------------------------
       */

      if (
        state.currentStep === "ASK_REQUIREMENTS" &&
        !ctx.requirements?.length
      ) {
        ctx.requirements = [state.userMessage.replace(/\s+/g, " ").trim()];
      }

      /*
       * --------------------------
       * Extraction Status
       * --------------------------
       */

      ctx.extracted = Boolean(
        ctx.customerType ||
        ctx.businessType ||
        (ctx.businessGoals?.length ?? 0) > 0 ||
        ctx.occasion ||
        (ctx.requirements?.length ?? 0) > 0 ||
        (ctx.targetAudience?.length ?? 0) > 0 ||
        (ctx.campaigns?.length ?? 0) > 0 ||
        (ctx.constraints?.length ?? 0) > 0 ||
        ctx.budget ||
        ctx.timeline,
      );
    }
    /*
     * =====================================================
     * UI Actions
     * =====================================================
     */

    const actionId = state.action?.id;

    /*
     * Customer Type
     */
    switch (actionId) {
      case "RECOMMENDATION_BUSINESS":
        ctx.customerType = "BUSINESS";
        break;

      case "RECOMMENDATION_INDIVIDUAL":
        ctx.customerType = "INDIVIDUAL";
        break;

      case "BUSINESS_CAFE":
        ctx.customerType = "BUSINESS";
        ctx.businessType = "Cafe";
        break;

      case "BUSINESS_RESTAURANT":
        ctx.customerType = "BUSINESS";
        ctx.businessType = "Restaurant";
        break;

      case "BUSINESS_HOTEL":
        ctx.customerType = "BUSINESS";
        ctx.businessType = "Hotel";
        break;

      case "BUSINESS_RETAIL":
        ctx.customerType = "BUSINESS";
        ctx.businessType = "Retail";
        break;

      case "BUSINESS_HOSPITAL":
        ctx.customerType = "BUSINESS";
        ctx.businessType = "Hospital";
        break;

      case "BUSINESS_OTHER":
        ctx.customerType = "BUSINESS";
        ctx.businessType = "Other";
        break;

      case "GOAL_BRANDING":
        ctx.businessGoals = ["Brand Awareness"];
        break;

      case "GOAL_PROMOTION":
        ctx.businessGoals = ["Promotions"];
        break;

      case "GOAL_PACKAGING":
        ctx.businessGoals = ["Packaging"];
        break;

      case "GOAL_SIGNAGE":
        ctx.businessGoals = ["Signage"];
        break;
    }

    /*
     * Payload (if present)
     */

    if (payload.customerType) {
      ctx.customerType = payload.customerType;
    }

    if (payload.businessType) {
      ctx.businessType = payload.businessType;
    }

    if (payload.businessGoal) {
      ctx.businessGoals = [payload.businessGoal];
    }

    if (payload.occasion) {
      ctx.occasion = payload.occasion;
    }

    /*
     * Action already handled
     */

    if (state.action) {
      return;
    }

    /*
     * =====================================================
     * Manual Conversation Answers
     * =====================================================
     */

    switch (state.currentStep) {
      /*
       * --------------------------
       * Customer Type
       * --------------------------
       */

      case "ASK_CUSTOMER_TYPE": {
        if (["business", "company", "corporate"].includes(text)) {
          ctx.customerType = "BUSINESS";
        }

        if (["individual", "personal"].includes(text)) {
          ctx.customerType = "INDIVIDUAL";
        }

        break;
      }

      /*
       * --------------------------
       * Business Type
       * --------------------------
       */

      case "ASK_BUSINESS_TYPE": {
        for (const [keyword, value] of businessTypes) {
          if (text.includes(keyword)) {
            ctx.businessType = value;
            break;
          }
        }

        break;
      }

      /*
       * --------------------------
       * Business Goal
       * --------------------------
       */

      case "ASK_BUSINESS_GOAL": {
        const business =
          BUSINESS_KNOWLEDGE[ctx.businessType] ?? BUSINESS_KNOWLEDGE.Other;

        for (const goal of business.goals) {
          if (this.matchesGoal(text, goal)) {
            ctx.businessGoals = [goal.name];
            break;
          }
        }

        break;
      }

      /*
       * --------------------------
       * Occasion
       * --------------------------
       */

      case "ASK_OCCASION": {
        for (const [keyword, value] of occasions) {
          if (text.includes(keyword)) {
            ctx.occasion = value;
            break;
          }
        }

        break;
      }

      /*
       * --------------------------
       * Requirement
       * --------------------------
       */

      case "ASK_REQUIREMENTS": {
        ctx.requirements = [state.userMessage.replace(/\s+/g, " ").trim()];
        break;
      }

      default:
        break;
    }
  }

  // helper method
  matchesGoal(text, goal = {}) {
    const searchable = [goal.name, goal.description, ...(goal.keywords ?? [])]
      .filter(Boolean)
      .map((value) => value.toLowerCase());

    return searchable.some((keyword) => text.includes(keyword));
  }
}
