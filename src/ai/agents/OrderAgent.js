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

    state.extractedOrder = await orderExtractor.extract(state);

    /*
     * =====================================================
     * Process Order
     * =====================================================
     */

    const result = await orderRequestService.process(state);

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
