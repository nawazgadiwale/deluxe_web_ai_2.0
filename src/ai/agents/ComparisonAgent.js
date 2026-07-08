import ComparisonService from "../../modules/comparison/ComparisonService.js";
import ResponseBuilder from "../../core/responses/Apiresponse.js";

const comparisonService = new ComparisonService();
const responseBuilder = new ResponseBuilder();

export default class ComparisonAgent {
  async execute(state) {
    /*
     * =====================================================
     * Generate Comparison
     * =====================================================
     */

    const result = await comparisonService.generate(state);

    /*
     * =====================================================
     * Update Workflow
     * =====================================================
     */

    state.workflow = null;
    state.currentStep = null;
    state.awaitingDecision = false;

    state.comparison = {
      products: result.products,
      comparedAt: new Date(),
    };
    /*
     * =====================================================
     * Save Response
     * =====================================================
     */

    state.response = responseBuilder.comparison(result);

    /*
     * =====================================================
     * Persist Conversation
     * =====================================================
     */

    state.persistence.conversation.dirty = true;
    state.persistence.conversation.updatedAt = new Date();

    return state;
  }
}
