import ResponseBuilder from "../../../core/responses/Apiresponse.js";

const responseBuilder = new ResponseBuilder();

export default class GreetingNode {
  async execute(state) {
    /*
     * =====================================================
     * Greeting Workflow
     * =====================================================
     */

    state.workflow = "GREETING";
    state.currentStep = null;
    state.awaitingDecision = false;

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

    state.response = responseBuilder.success({
      type: "greeting",

      message:
        "Hello! 👋 Welcome to Deluxe Printing. I'm your AI Assistant. I can recommend products, explain product details, help you place an order, or connect you with our sales team. How can I assist you today?",
    });

    return state;
  }
}
