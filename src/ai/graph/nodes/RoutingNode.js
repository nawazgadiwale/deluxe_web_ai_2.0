import RoutingService from "../../../modules/routing/RoutingService.js";

const routingService = new RoutingService();

export default class RoutingNode {
  async execute(state) {
    /*
     * =====================================================
     * Route Request
     * =====================================================
     */

    /*
     * =====================================================
     * Continue Recommendation Workflow
     * =====================================================
     */

    const recommendationSteps = [
      "ASK_CUSTOMER_TYPE",
      "ASK_BUSINESS_TYPE",
      "ASK_BUSINESS_GOAL",
      "ASK_REQUIREMENTS",
    ];

    if (
      state.workflow === "RECOMMENDATION" &&
      recommendationSteps.includes(state.currentStep) &&
      state.action
    ) {
      state.capability = "recommendation";
      state.capabilities = ["recommendation"];
      state.routingConfidence = 1;
      return state;
    }

    const routing = await routingService.route(state);

    /*
     * =====================================================
     * Save Routing Result
     * =====================================================
     */

    state.routing = routing;

    state.capability = routing.capability;

    state.capabilities = routing.capabilities;

    state.routingConfidence = routing.confidence;

    /*
     * =====================================================
     * Metadata
     * =====================================================
     */

    state.metadata = {
      ...(state.metadata ?? {}),

      routing: {
        capability: routing.capability,
        capabilities: routing.capabilities,
        confidence: routing.confidence,
        source: routing.source,
      },
    };

    /*
     * =====================================================
     * Debug
     * =====================================================
     */

    console.log(
      `[Routing] ${routing.source} -> ${routing.capability} (${routing.confidence})`,
    );

    return state;
  }
}
