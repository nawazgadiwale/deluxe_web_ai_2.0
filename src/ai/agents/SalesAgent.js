import BaseAgent from "./BaseAgent.js";

import ResponseBuilder from "../../core/responses/Apiresponse.js";
import RecommendationService from "../../modules/recommendation/RecommendationService.js";

const responseBuilder = new ResponseBuilder();
const recommendationService = new RecommendationService();

export default class SalesAgent extends BaseAgent {
  async execute(state) {
    /*
     * =====================================================
     * Generate Recommendation
     * =====================================================
     */

    const result = await recommendationService.generate(state);

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
     * Store Current Recommendation
     * =====================================================
     */

    state.recommendation = result.recommendation;

    /*
     * =====================================================
     * Recommendation Workflow
     * =====================================================
     */

    state.workflow = "RECOMMENDATION";
    state.currentStep = "SHOW_RECOMMENDATIONS";
    state.awaitingDecision = true;

    /*
     * =====================================================
     * Recommendation Context
     * =====================================================
     *
     * Keep recommendation-specific information together.
     * This will support:
     *
     * - Show More Products
     * - Product Details
     * - Order From Recommendation
     * - Pagination
     *
     */

    state.recommendationContext = {
      query: state.userMessage,

      products: result.recommendation.products,

      totalProducts: result.recommendation.products.length,

      page: 1,

      hasMore: false, // Will later come from HybridRetriever
    };

    /*
     * =====================================================
     * Recommendation should not overwrite
     * existing draft order.
     * =====================================================
     */

    state.activeOrderItem = null;

    /*
     * Keep existing orderRequest intact.
     */

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

    state.response = responseBuilder.recommendation(result.recommendation);

    return state;
  }
}
