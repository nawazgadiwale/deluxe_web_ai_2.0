import { CONVERSATION_STATES } from "../ConversationState.js";

export default class ConversationStateNode {
  async execute(state) {
    /*
     * ---------------------------------------------------------
     * Waiting for Yes / No decision
     * ---------------------------------------------------------
     */

    if (state.awaitingDecision) {
      state.conversationState = CONVERSATION_STATES.WAITING_FOR_DECISION;

      return state;
    }

    /*
     * ---------------------------------------------------------
     * Active Lead Workflow
     * ---------------------------------------------------------
     */

    if (state.workflow === "LEAD" && state.currentStep) {
      state.conversationState = CONVERSATION_STATES.CONTACT_COLLECTION;

      return state;
    }

    /*
     * ---------------------------------------------------------
     * Active Order Workflow
     * ---------------------------------------------------------
     */

    if (state.workflow === "ORDER") {
      switch (state.orderRequest?.status) {
        case "DRAFT":
        case "COLLECTING_ITEMS":
        case "COLLECTING_CUSTOMER":
          state.conversationState = CONVERSATION_STATES.ORDER_COLLECTION;
          return state;

        case "ORDER_REVIEW":
        case "REVIEW":
          state.conversationState = CONVERSATION_STATES.ORDER_REVIEW;
          return state;

        case "WAITING_CONFIRMATION":
          state.conversationState =
            CONVERSATION_STATES.WAITING_FOR_CONFIRMATION;
          return state;

        case "SUBMITTED":
        case "COMPLETED":
          state.conversationState = CONVERSATION_STATES.ORDER_COMPLETED;
          return state;

        default:
          break;
      }
    }

    /*
     * ---------------------------------------------------------
     * Default
     * ---------------------------------------------------------
     */

    state.conversationState = CONVERSATION_STATES.IDLE;

    return state;
  }
}
