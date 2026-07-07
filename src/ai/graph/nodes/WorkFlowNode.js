import WorkflowPlanner from "../../../modules/workflow/WorkflowPlanner.js";
import WorkflowState from "../../../modules/workflow/WorkflowState.js";

const planner = new WorkflowPlanner();
const workflowState = new WorkflowState();

export default class WorkflowNode {
  async execute(state) {
    if (workflowState.shouldClear(state)) {
      workflowState.clear(state);
    }

    const capability = state.capability ?? state.capabilities?.[0];

    // console.log("Workflow :", state.workflow);
    // console.log("Capability :", capability);

    const plan = planner.plan(capability);

    if (!plan) {
      state.response = {
        type: "assistant",
        data: {
          message:
            state.routing?.assistantQuestion ??
            "Could you tell me a little more about what you're looking for?",
        },
      };

      return state;
    }

    state.executionPlan = plan;
    state.currentExecutionIndex = 0;

    return state;
  }
}
