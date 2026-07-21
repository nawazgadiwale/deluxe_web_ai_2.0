import BaseAgent from "./BaseAgent.js";

import OrderService from "../../modules/order/OrderService.js";

const orderService = new OrderService();

export default class OrderAgent extends BaseAgent {
  async execute(state) {
    /*
     * =====================================================
     * Execute Order Workflow
     * =====================================================
     */

    const result = await orderService.execute(state);

    /*
     * =====================================================
     * Update Order State
     * =====================================================
     */

    state.order = result.order;

    state.orderContext = result.order;

    state.response = result.response;

    /*
     * =====================================================
     * Workflow
     * =====================================================
     */
    const active =
      result.order &&
      !["CONFIRMED", "CANCELLED", "DELETED"].includes(result.order.status);

    state.workflow = active ? "ORDER" : null;

    /*
     * =====================================================
     * Persistence
     * =====================================================
     */

    state.persistence.order = {
      dirty: true,
      updatedAt: new Date(),
    };

    state.persistence.conversation = {
      ...state.persistence.conversation,
      dirty: true,
      updatedAt: new Date(),
    };

    return state;
  }
}
