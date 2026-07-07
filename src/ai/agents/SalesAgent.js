import BaseAgent from "./BaseAgent.js";

import ResponseBuilder from "../../core/responses/Apiresponse.js";

import RecommendationService from "../../modules/recommendation/RecommendationService.js";
import RecommendationQuestionService from "../../modules/recommendation/questions/RecommendationQuestionService.js";

const responseBuilder = new ResponseBuilder();

const recommendationService = new RecommendationService();
const recommendationQuestionService = new RecommendationQuestionService();

export default class SalesAgent extends BaseAgent {
  async execute(state) {
    /*
     * =====================================================
     * Recommendation Questions
     * =====================================================
     */

    const questionResult = await recommendationQuestionService.execute(state);

    if (!questionResult.ready) {
      state.response = questionResult.response;

      state.persistence.conversation = {
        ...state.persistence.conversation,
        dirty: true,
        updatedAt: new Date(),
      };

      return state;
    }

    /*
     * =====================================================
     * Generate Recommendation
     * =====================================================
     */

    const result = await recommendationService.generate(state);
    console.log("Recommendation Result");
    console.dir(result, { depth: null });

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

    state.recommendationContext.products = result.recommendation.products ?? [];

    state.recommendationContext.totalProducts =
      result.recommendation.products?.length ?? 0;

    state.recommendationContext.page = 1;
    state.recommendationContext.hasMore = false;

    /*
     * =====================================================
     * Recommendation Session
     * =====================================================
     */

    state.recommendationContext = {
      ...(state.recommendationContext ?? {}),

      active: true,

      products: result.recommendation.products ?? [],

      totalProducts: result.recommendation.products?.length ?? 0,

      page: 1,

      hasMore: false,

      completedAt: new Date(),
    };

    /*
     * =====================================================
     * Workflow Ends
     * =====================================================
     */

    state.workflow = null;
    state.currentStep = null;
    state.awaitingDecision = false;

    /*
     * =====================================================
     * Persistence
     * =====================================================
     */

    state.persistence.conversation = {
      ...state.persistence.conversation,
      dirty: true,
      updatedAt: new Date(),
    };

    /*
     * =====================================================
     * Response
     * =====================================================
     */

    state.response = responseBuilder.recommendation(result.recommendation);

    return state;
  }
}
