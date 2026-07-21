import ComparisonAgent from "../../agents/ComparisonAgent.js";

const comparisonAgent = new ComparisonAgent();

export default class ComparisonNode {
  async execute(state) {
    return comparisonAgent.execute(state);
  }
}
