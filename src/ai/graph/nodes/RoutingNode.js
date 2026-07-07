import RoutingService from "../../../modules/routing/RoutingService.js";
import WorkflowState from "../../../modules/workflow/WorkflowState.js";

const routingService = new RoutingService();
const workflowState = new WorkflowState();

export default class RoutingNode {
  async execute(state) {
    /*
     * =====================================================
     * Resume Active Workflow
     * =====================================================
     */

    if (workflowState.isActive(state) && workflowState.hasPendingStep(state)) {
      const capability = workflowState.currentCapability(state);

      console.log(`[Routing] Resume ${state.workflow} (${state.currentStep})`);

      state.routing = {
        capability,
        capabilities: [capability],
        confidence: 1,
        source: "WORKFLOW",
      };

      state.capability = capability;
      state.capabilities = [capability];
      state.routingConfidence = 1;

      state.metadata = {
        ...(state.metadata ?? {}),
        routing: state.routing,
      };

      return state;
    }
    /*
     * =====================================================
     * Route Request
     * =====================================================
     */

    const routing = await routingService.route(state);

    /*
     * =====================================================
     * Continue Persistent Workflow
     * =====================================================
     */

    if (
      workflowState.isActive(state) &&
      !workflowState.canInterrupt(state, routing.capability)
    ) {
      const capability = workflowState.currentCapability(state);

      console.log(
        `[Routing] Continue ${state.workflow} (${state.currentStep})`,
      );

      state.routing = {
        capability,
        capabilities: [capability],
        confidence: 1,
        source: "WORKFLOW",
      };

      state.capability = capability;
      state.capabilities = [capability];
      state.routingConfidence = 1;

      state.metadata = {
        ...(state.metadata ?? {}),
        routing: state.routing,
      };

      return state;
    }

    /*
     * =====================================================
     * Save Routing Result
     * =====================================================
     */

    state.routing = routing;

    state.capability = routing.capability;
    state.capabilities = routing.capabilities;
    state.routingConfidence = routing.confidence;

    state.metadata = {
      ...(state.metadata ?? {}),
      routing,
    };

    console.log(
      `[Routing] ${routing.source} -> ${routing.capability} (${routing.confidence})`,
    );

    return state;
  }
}
