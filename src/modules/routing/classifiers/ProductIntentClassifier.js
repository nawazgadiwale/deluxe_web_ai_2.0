import CatalogService from "../../catalog/CatalogService.js";
import {
  DETAIL_KEYWORDS,
  COMPARISON_KEYWORDS,
} from "../utils/RoutingConstants.js";

const catalogService = new CatalogService();

export default class ProductIntentClassifier {
  async classify(state) {
    const message = (state.userMessage ?? "").trim().toLowerCase();

    if (!message) {
      return null;
    }

    /*
     * ============================================
     * Comparison
     * ============================================
     */

    const comparisonRequested = COMPARISON_KEYWORDS.some((k) =>
      message.includes(k),
    );

    if (comparisonRequested) {
      return {
        capability: "comparison",
        confidence: 1,
        source: "RULE",
      };
    }

    /*
     * ============================================
     * Product Detection
     * ============================================
     */

    const product = await catalogService.findProductByName(state.userMessage);

    if (!product) {
      return null;
    }

    /*
     * ============================================
     * Product Details
     * ============================================
     */

    const wantsDetails = DETAIL_KEYWORDS.some((k) => message.includes(k));

    if (wantsDetails) {
      return {
        capability: "product_details",
        confidence: 1,
        source: "RULE",
      };
    }

    /*
     * ============================================
     * Discovery
     * ============================================
     */

    return {
      capability: "discovery",
      confidence: 1,
      source: "RULE",
    };
  }
}
