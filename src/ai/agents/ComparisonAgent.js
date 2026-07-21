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
      summary: result.summary,

      comparison: result.comparison,

      recommendation: result.recommendation,

      followUpQuestion: result.followUpQuestion,

      products: result.products,

      query: result.query,

      comparedAt: new Date(),
    };

    /*
     * =====================================================
     * Comparison Conversation Context
     * =====================================================
     */

    state.comparisonContext = {
      active: true,

      products: result.products,

      query: result.query,

      comparedAt: new Date(),
    };
    /*
     * =====================================================
     * Save Response
     * =====================================================
     */

    state.response = responseBuilder.comparison(result);

    if (state.workflowStack?.length) {
      responseBuilder.appendResumePrompt(
        state.response,
        state.workflowStack[state.workflowStack.length - 1],
      );
    }

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
