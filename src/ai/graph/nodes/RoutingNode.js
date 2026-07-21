import RoutingService from "../../../modules/routing/RoutingService.js";

const routingService = new RoutingService();

export default class RoutingNode {
  async execute(state) {
    /*
     * =====================================================
     * Resolve Route
     * =====================================================
     */

    const routing = await routingService.route(state);

    // console.log("Routing Result");
    // console.log(routing);

    // console.log("State Before Workflow");
    // console.log({
    //   workflow: state.workflow,
    //   step: state.currentStep,
    //   awaiting: state.awaitingDecision,
    // });

    /*
     * =====================================================
     * Apply Routing
     * =====================================================
     */

    state.routing = routing;

    state.capability = routing.capability;

    state.capabilities = routing.capabilities ?? [routing.capability];

    state.routingConfidence = routing.confidence ?? 1;

    state.metadata = {
      ...(state.metadata ?? {}),
      routing,
    };

    // console.log(
    // `[Routing] ${routing.source} -> ${routing.capability} (${routing.confidence})`,
    // );

    return state;
  }
}
