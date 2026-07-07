import {
  RECOMMENDATION_KEYWORDS,
  BUSINESS_TYPES,
  BUSINESS_GOALS,
  OCCASIONS,
  PLANNING_PATTERNS,
} from "../utils/RoutingConstants.js";

export default class RecommendationClassifier {
  classify(state) {
    const message = (state.userMessage ?? "").trim().toLowerCase();

    if (!message) {
      return null;
    }

    if (PLANNING_PATTERNS.some((pattern) => pattern.test(message))) {
      return {
        capability: "recommendation",
        confidence: 1,
        source: "RULE",
      };
    }

    /*
     * ==========================================
     * Planning Intent
     * ==========================================
     */

    if (RECOMMENDATION_KEYWORDS.some((k) => message.includes(k))) {
      return {
        capability: "recommendation",
        confidence: 1,
        source: "RULE",
      };
    }

    /*
     * ==========================================
     * Business Recommendation
     * ==========================================
     */

    const mentionsBusiness = BUSINESS_TYPES.some((type) =>
      message.includes(type),
    );

    const mentionsGoal = BUSINESS_GOALS.some((goal) => message.includes(goal));

    if (mentionsBusiness && mentionsGoal) {
      return {
        capability: "recommendation",
        confidence: 1,
        source: "RULE",
      };
    }

    /*
     * ==========================================
     * Event Recommendation
     * ==========================================
     */

    const mentionsOccasion = OCCASIONS.some((event) => message.includes(event));

    if (mentionsOccasion) {
      return {
        capability: "recommendation",
        confidence: 1,
        source: "RULE",
      };
    }

    return null;
  }
}
