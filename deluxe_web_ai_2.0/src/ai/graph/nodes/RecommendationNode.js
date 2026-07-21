import SalesAgent from "../../agents/SalesAgent.js";

const salesAgent = new SalesAgent();

export default class RecommendationNode {
  async execute(state) {
    // console.log("RecommendationNode Executed");

    return salesAgent.execute(state);
  }
}
