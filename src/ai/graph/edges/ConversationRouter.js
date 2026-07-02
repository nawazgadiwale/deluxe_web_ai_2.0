export default class ConversationRouter {
  route(state) {
    const { executionPlan = [], currentExecutionIndex = 0 } = state;

    if (currentExecutionIndex >= executionPlan.length) {
      return "ResponseNode";
    }

    return executionPlan[currentExecutionIndex].node;
  }

  continue(state) {
    state.currentExecutionIndex += 1;

    const { executionPlan = [], currentExecutionIndex } = state;

    if (currentExecutionIndex >= executionPlan.length) {
      return "ResponseNode";
    }

    return executionPlan[currentExecutionIndex].node;
  }
}
