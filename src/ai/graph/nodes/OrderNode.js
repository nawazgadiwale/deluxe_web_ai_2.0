import OrderAgent from "../../agents/OrderAgent.js";

const orderAgent = new OrderAgent();

export default class OrderNode {
  async execute(state) {
    await orderAgent.execute(state);

    return state;
  }
}