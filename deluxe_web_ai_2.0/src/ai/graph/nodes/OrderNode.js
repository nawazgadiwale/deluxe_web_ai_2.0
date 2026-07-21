import OrderAgent from "../../agents/OrderAgent.js";

const agent = new OrderAgent();

export default class OrderNode {
  async execute(state) {
    console.log("OrderNode Executed");

    return await agent.execute(state);
  }
}
