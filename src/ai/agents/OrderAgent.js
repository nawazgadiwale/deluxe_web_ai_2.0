import BaseAgent from "./BaseAgent.js";

import ResponseBuilder from "../../core/responses/Apiresponse.js";
import OrderRequestService from "../../modules/order/OrderRequestService.js";
import OrderExtractor from "../../modules/order/OrderExtractor.js";

const responseBuilder = new ResponseBuilder();
const orderRequestService = new OrderRequestService();
const orderExtractor = new OrderExtractor();

export default class OrderAgent extends BaseAgent {
  async execute(state) {
    /*
     * =====================================================
     * Extract Order
     * =====================================================
     */

    const step = state.currentStep;

    const skipExtractionSteps = [
      "NEXT_ITEM",
      "ORDER_REVIEW",
    ];

    if (skipExtractionSteps.includes(step)) {
      state.extractedOrder = null;
    } else {
      console.log("\n================ ORDER AGENT ================");
      console.log("User Message:", state.userMessage);

      console.log("\nIncoming Action:");
      console.dir(state.action, { depth: null });

      console.log("\nSelected Product:");
      console.log(state.selectedProduct);

      console.log("\nRecommendation:");
      console.dir(state.recommendation, { depth: 2 });

      console.log("=============================================\n");
      state.extractedOrder = await orderExtractor.extract(state);
    }
    /*
     * =====================================================
     * Process Order
     * =====================================================
     */

    const result = await orderRequestService.process(state);
    console.log("Returned Active Item");
    console.dir(result.activeOrderItem, { depth: null });

    if (!result) {
      throw new Error("OrderRequestService returned undefined.");
    }

    /*
     * =====================================================
     * Update Order State
     * =====================================================
     */

    state.orderRequest = result.orderRequest;
    state.orderStatus = result.status;
    state.activeOrderItem = result.activeOrderItem ?? null;
    console.log("Saved Active Item");
    console.dir(state.activeOrderItem, { depth: null });
    /*
     * =====================================================
     * Workflow
     * =====================================================
     */

    if (result.status === "COMPLETED") {
      /*
       * Order finished
       */

      state.workflow = null;
      state.currentStep = null;
      state.awaitingDecision = false;
      state.activeOrderItem = null;

      /*
       * Recommendation no longer active
       */

      state.recommendation = null;
      state.rag = null;
    } else {
      /*
       * Order in progress
       */

      state.workflow = "ORDER";
      state.currentStep = result.currentStep ?? null;
      state.awaitingDecision = result.awaitingDecision ?? false;

      /*
       * Recommendation context should not continue
       * once user has entered ordering.
       */

      state.recommendation = null;
      state.rag = null;
    }

    /*
     * =====================================================
     * Persistence
     * =====================================================
     */

    state.persistence.orderRequest.dirty = true;
    state.persistence.orderRequest.updatedAt = new Date();

    state.persistence.conversation.dirty = true;
    state.persistence.conversation.updatedAt = new Date();

    /*
     * =====================================================
     * Response
     * =====================================================
     */

    state.response = responseBuilder.order(result.response);

    return state;
  }
}
