import GreetingClassifier from "./classifiers/GreetingClassifier.js";
import FAQClassifier from "./classifiers/FAQClassifier.js";
import SupportClassifier from "./classifiers/SupportClassifier.js";
import LeadClassifier from "./classifiers/LeadClassifier.js";
import ProductIntentClassifier from "./classifiers/ProductIntentClassifier.js";
import RecommendationClassifier from "./classifiers/RecommendationClassifier.js";
import LLMFallbackClassifier from "./classifiers/LLMFallbackClassifier.js";

export default class RoutingEngine {
  constructor() {
    this.classifiers = [
      new GreetingClassifier(),
      new FAQClassifier(),
      new SupportClassifier(),
      new LeadClassifier(),
      new ProductIntentClassifier(),
      new RecommendationClassifier(),
    ];

    this.llmFallback = new LLMFallbackClassifier();
  }

  async route(state) {
    /*
     * =====================================================
     * UI Actions (Highest Priority)
     * =====================================================
     */

    const actionRoute = this.routeAction(state.action);

    if (actionRoute) {
      return actionRoute;
    }

    /*
     * =====================================================
     * Rule-based Classifiers
     * =====================================================
     */

    for (const classifier of this.classifiers) {
      const result = await classifier.classify(state);

      if (result) {
        return {
          capability: result.capability,
          confidence: result.confidence ?? 1,
          source: "RULE",
        };
      }
    }

    /*
     * =====================================================
     * LLM Fallback
     * =====================================================
     */

    const result = await this.llmFallback.classify(state);

    return {
      capability: result.capability,
      confidence: result.confidence ?? 0.5,
      source: "LLM",
    };
  }

  /*
   * =====================================================
   * UI Action Routing
   * =====================================================
   */

  routeAction(action) {
    if (!action?.id) {
      return null;
    }

    switch (action.id) {
      case "SHOW_PRODUCT_DETAILS":
        return {
          capability: "product_details",
          confidence: 1,
          source: "ACTION",
        };

      case "COMPARE_PRODUCT":
      case "COMPARE_PRODUCTS":
        return {
          capability: "comparison",
          confidence: 1,
          source: "ACTION",
        };

      case "CONTACT_SALES":
      case "GET_QUOTE":
      case "REQUEST_QUOTE":
        return {
          capability: "lead",
          confidence: 1,
          source: "ACTION",
        };

      default:
        return null;
    }
  }
}
