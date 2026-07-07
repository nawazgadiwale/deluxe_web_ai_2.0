import ResponseBuilder from "../../../core/responses/Apiresponse.js";
import { RECOMMENDATION_RESET_PATTERNS } from "../../routing/utils/RoutingConstants.js";

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

const BUSINESS_GOALS = {
  branding: "Brand Awareness",
  awareness: "Brand Awareness",
  visibility: "Brand Awareness",
  identity: "Brand Awareness",
  recognition: "Brand Awareness",

  advertise: "Advertising",
  advertising: "Advertising",

  promotion: "Promotion",
  promote: "Promotion",
  marketing: "Marketing",
  customers: "Promotion",
  traffic: "Promotion",
  sales: "Promotion",
  footfall: "Promotion",

  packaging: "Packaging",

  interior: "Interior Branding",
  exterior: "Exterior Branding",

  signage: "Store Branding",

  opening: "Store Launch",
  launch: "Store Launch",

  gifts: "Corporate Gifts",

  loyalty: "Customer Engagement",
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

// export default class RecommendationQuestionEngine {
//   execute(state) {
//     const ctx = state.recommendationContext;

//     this.resetIfNewRecommendation(state, ctx);

//     this.updateContext(state, ctx);

//     resetIfNewRecommendation(state, ctx) {
//   if (!ctx.active) {
//     return;
//   }

//   const message = (state.userMessage ?? "").toLowerCase();

//   const startsNewRecommendation =
//     [
//       "recommend",
//       "suggest",
//       "looking for",
//       "need products",
//       "opening",
//       "starting",
//       "launching",
//     ].some((x) => message.includes(x));

//   if (!startsNewRecommendation) {
//     return;
//   }

//   Object.assign(ctx, {
//     customerType: null,
//     businessType: null,
//     businessGoal: null,
//     occasion: null,
//     requirements: null,
//     originalQuery: state.userMessage,
//     extracted: false,

//     active: false,

//     products: [],
//     totalProducts: 0,
//     page: 1,
//     hasMore: false,
//   });
// }

//     state.recommendationContext ??= {
//       customerType: null,

//       businessType: null,

//       businessGoal: null,

//       occasion: null,

//       requirements: null,

//       originalQuery: null,

//       extracted: false,

//       products: [],

//       totalProducts: 0,

//       page: 1,

//       hasMore: false,
//     };

//     const ctx = state.recommendationContext;

//     if (!state.action) {
//     ctx.originalQuery = state.userMessage;
// }

//     this.updateContext(state, ctx);

//     /*
//      * =====================================================
//      * Ask Customer Type
//      * =====================================================
//      */

//     if (!ctx.customerType) {
//       state.workflow = "RECOMMENDATION";
//       state.currentStep = "ASK_CUSTOMER_TYPE";
//       state.awaitingDecision = true;

//       return {
//         ready: false,
//         response: responseBuilder.recommendation({
//           summary: "Let's find the right products for you.",
//           followUpQuestion:
//             "Are you looking for products for your business or personal use?",
//           products: [],
//           actions: [
//             {
//               id: "RECOMMENDATION_BUSINESS",
//               label: "Business",
//               payload: {
//                 customerType: "BUSINESS",
//               },
//             },
//             {
//               id: "RECOMMENDATION_INDIVIDUAL",
//               label: "Individual",
//               payload: {
//                 customerType: "INDIVIDUAL",
//               },
//             },
//           ],
//         }),
//       };
//     }

//     /*
//      * =====================================================
//      * Ask Business Type
//      * =====================================================
//      */

//     if (ctx.customerType === "BUSINESS" && !ctx.businessType) {
//       state.workflow = "RECOMMENDATION";
//       state.currentStep = "ASK_BUSINESS_TYPE";
//       state.awaitingDecision = true;

//       return {
//         ready: false,
//         response: responseBuilder.recommendation({
//           summary: "What type of business do you have?",
//           products: [],
//           actions: [
//             {
//               id: "BUSINESS_CAFE",
//               label: "Cafe",
//               payload: {
//                 businessType: "Cafe",
//               },
//             },
//             {
//               id: "BUSINESS_RESTAURANT",
//               label: "Restaurant",
//               payload: {
//                 businessType: "Restaurant",
//               },
//             },
//             {
//               id: "BUSINESS_HOTEL",
//               label: "Hotel",
//               payload: {
//                 businessType: "Hotel",
//               },
//             },
//             {
//               id: "BUSINESS_RETAIL",
//               label: "Retail",
//               payload: {
//                 businessType: "Retail",
//               },
//             },
//             {
//               id: "BUSINESS_HOSPITAL",
//               label: "Hospital",
//               payload: {
//                 businessType: "Hospital",
//               },
//             },
//             {
//               id: "BUSINESS_OTHER",
//               label: "Other",
//               payload: {
//                 businessType: "Other",
//               },
//             },
//           ],
//         }),
//       };
//     }

//     /*
//      * =====================================================
//      * Ask Business Goal
//      * =====================================================
//      */

//     if (ctx.customerType === "BUSINESS" && !ctx.businessGoal) {
//       state.workflow = "RECOMMENDATION";
//       state.currentStep = "ASK_BUSINESS_GOAL";
//       state.awaitingDecision = true;

//       return {
//         ready: false,
//         response: responseBuilder.recommendation({
//           summary: "What is your primary objective?",
//           products: [],
//           actions: [
//             {
//               id: "GOAL_BRANDING",
//               label: "Brand Awareness",
//               payload: {
//                 businessGoal: "Brand Awareness",
//               },
//             },
//             {
//               id: "GOAL_PROMOTION",
//               label: "Marketing & Promotion",
//               payload: {
//                 businessGoal: "Marketing & Promotion",
//               },
//             },
//             {
//               id: "GOAL_PACKAGING",
//               label: "Packaging",
//               payload: {
//                 businessGoal: "Packaging",
//               },
//             },
//             {
//               id: "GOAL_SIGNAGE",
//               label: "Store Branding",
//               payload: {
//                 businessGoal: "Store Branding",
//               },
//             },
//           ],
//         }),
//       };
//     }

//     /*
//      * =====================================================
//      * Ask Individual Requirement
//      * =====================================================
//      */

//     if (ctx.customerType === "INDIVIDUAL" && !ctx.requirements) {
//       state.workflow = "RECOMMENDATION";
//       if (ctx.customerType === "INDIVIDUAL" && !ctx.occasion) {
//         state.workflow = "RECOMMENDATION";
//         state.currentStep = "ASK_OCCASION";
//         state.awaitingDecision = true;

//         return {
//           ready: false,
//           response: responseBuilder.recommendation({
//             summary: "What is the occasion?",
//             followUpQuestion:
//               "For example: Wedding, Birthday, Anniversary, Baby Shower, Festival.",
//             products: [],
//             actions: [],
//           }),
//         };
//       }
//       state.currentStep = "ASK_REQUIREMENTS";
//       state.awaitingDecision = true;

//       return {
//         ready: false,
//         response: responseBuilder.recommendation({
//           summary: "Tell me what you're looking for.",
//           followUpQuestion:
//             "For example: Wedding invitations, Birthday gifts, Custom mugs.",
//           products: [],
//           actions: [],
//         }),
//       };
//     }

//     return {
//       ready: true,
//     };
//   }
//   updateContext(state, ctx) {
//     const payload = state.action?.payload ?? {};
//     const text = (state.userMessage ?? "").trim().toLowerCase();

//     /*
//      * ============================================
//      * Automatic Extraction
//      * ============================================
//      */

//     if (!state.action) {
//       for (const [key, value] of Object.entries(BUSINESS_TYPES)) {
//         if (text.includes(key)) {
//           ctx.customerType = "BUSINESS";
//           ctx.businessType = value;
//           ctx.extracted = false;
//           break;
//         }
//       }

//       for (const [key, value] of Object.entries(BUSINESS_GOALS)) {
//         if (text.includes(key)) {
//           ctx.businessGoal = value;
//           break;
//         }
//       }

//       for (const [key, value] of Object.entries(OCCASIONS)) {
//         if (text.includes(key)) {
//           ctx.customerType = "INDIVIDUAL";
//           ctx.occasion = value;
//           break;
//         }
//       }

//       ctx.extracted = true;
//     }

//     /*
//      * ============================================
//      * UI Actions
//      * ============================================
//      */

//     if (payload.customerType) {
//       ctx.customerType = payload.customerType;
//     }

//     if (payload.businessType) {
//       ctx.businessType = payload.businessType;
//     }

//     if (payload.businessGoal) {
//       ctx.businessGoal = payload.businessGoal;
//     }

//     if (payload.occasion) {
//       ctx.occasion = payload.occasion;
//     }

//     /*
//      * ============================================
//      * Text Answers
//      * ============================================
//      */

//     if (!state.action) {
//       switch (state.currentStep) {
//         case "ASK_CUSTOMER_TYPE":
//           if (["business", "company", "corporate"].includes(text)) {
//             ctx.customerType = "BUSINESS";
//           }

//           if (["individual", "personal"].includes(text)) {
//             ctx.customerType = "INDIVIDUAL";
//           }
//           break;

//         case "ASK_BUSINESS_TYPE":
//           for (const [key, value] of Object.entries(BUSINESS_TYPES)) {
//             if (text.includes(key)) {
//               ctx.businessType = value;
//               break;
//             }
//           }
//           break;

//         case "ASK_BUSINESS_GOAL":
//           for (const [key, value] of Object.entries(BUSINESS_GOALS)) {
//             if (text.includes(key)) {
//               ctx.businessGoal = value;
//               break;
//             }
//           }
//           break;

//         case "ASK_OCCASION":
//           for (const [key, value] of Object.entries(OCCASIONS)) {
//             if (text.includes(key)) {
//               ctx.occasion = value;
//               break;
//             }
//           }
//           break;

//         case "ASK_REQUIREMENTS":
//           ctx.requirements = state.userMessage.trim();
//           break;
//       }
//     }
//   }
// }

export default class RecommendationQuestionEngine {
  execute(state) {
    /*
     * =====================================================
     * Recommendation Context
     * =====================================================
     */

    state.recommendationContext ??= {
      customerType: null,

      businessType: null,

      businessGoal: null,

      occasion: null,

      requirements: null,

      originalQuery: null,

      extracted: false,

      active: false,

      products: [],

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

    if (!state.action) {
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

        return {
          ready: false,
          response: responseBuilder.recommendation({
            summary: "What type of business do you have?",
            followUpQuestion:
              "For example: Cafe, Clinic, Restaurant, Hotel, Retail Store...",
            products: [],
            actions: [],
          }),
        };
      }

      if (!ctx.businessGoal) {
        state.workflow = "RECOMMENDATION";
        state.currentStep = "ASK_BUSINESS_GOAL";
        state.awaitingDecision = true;

        return {
          ready: false,
          response: responseBuilder.recommendation({
            summary: "What would you like to achieve?",
            followUpQuestion:
              "Brand awareness, marketing, packaging, promotions, signage...",
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

      if (!ctx.requirements) {
        state.workflow = "RECOMMENDATION";
        state.currentStep = "ASK_REQUIREMENTS";
        state.awaitingDecision = true;

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
    const businessGoals = Object.entries(BUSINESS_GOALS);
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

      let detectedGoal = null;

      for (const [keyword, value] of businessGoals) {
        if (text.includes(keyword)) {
          detectedGoal = value;
        }
      }

      if (detectedGoal) {
        ctx.businessGoal = detectedGoal;
      }

      /*
       * --------------------------
       * Occasion
       * --------------------------
       */

      for (const [keyword, value] of occasions) {
        if (text.includes(keyword)) {
          ctx.customerType = "INDIVIDUAL";
          ctx.occasion = value;
          break;
        }
      }

      /*
       * --------------------------
       * Requirement
       * --------------------------
       */

      if (state.currentStep === "ASK_REQUIREMENTS" && !ctx.requirements) {
        ctx.requirements = state.userMessage.trim();
      }

      /*
       * --------------------------
       * Extraction Status
       * --------------------------
       */

      ctx.extracted = Boolean(
        ctx.businessType || ctx.businessGoal || ctx.occasion,
      );
    }

    /*
     * =====================================================
     * UI Actions
     * =====================================================
     */

    if (payload.customerType) {
      ctx.customerType = payload.customerType;
    }

    if (payload.businessType) {
      ctx.businessType = payload.businessType;
    }

    if (payload.businessGoal) {
      ctx.businessGoal = payload.businessGoal;
    }

    if (payload.occasion) {
      ctx.occasion = payload.occasion;
    }

    /*
     * UI action already updated the context.
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
        let detectedGoal = null;

        for (const [keyword, value] of businessGoals) {
          if (text.includes(keyword)) {
            detectedGoal = value;
          }
        }

        if (detectedGoal) {
          ctx.businessGoal = detectedGoal;
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
        ctx.requirements = state.userMessage.trim();
        break;
      }

      default:
        break;
    }
  }
}
