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

    state.workflow = "COMPARISON";
    state.currentStep = "SHOW_COMPARISON";
    state.awaitingDecision = false;

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
