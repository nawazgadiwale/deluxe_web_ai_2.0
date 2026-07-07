export default class ConversationRouter {
  /*
   * =====================================================
   * First Node
   * =====================================================
   */

  route(state) {
    const executionPlan = state.executionPlan ?? [];
    const index = state.currentExecutionIndex ?? 0;

    if (!executionPlan.length || index >= executionPlan.length) {
      return "ResponseNode";
    }

    return executionPlan[index].node;
  }

  /*
   * =====================================================
   * Next Node
   * =====================================================
   */

  continue(state) {
    state.currentExecutionIndex = (state.currentExecutionIndex ?? 0) + 1;

    const executionPlan = state.executionPlan ?? [];

    if (state.currentExecutionIndex >= executionPlan.length) {
      return "ResponseNode";
    }

    return executionPlan[state.currentExecutionIndex].node;
  }

  /*
   * =====================================================
   * Reset
   * =====================================================
   */

  reset(state) {
    state.executionPlan = [];
    state.currentExecutionIndex = 0;

    return "ResponseNode";
  }
}
