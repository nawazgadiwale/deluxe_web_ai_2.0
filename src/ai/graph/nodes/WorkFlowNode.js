export default class WorkflowNode {
  async execute(state) {
    const plan = [];

    /*
     * =========================================================
     * Current Capability
     * =========================================================
     *
     * RoutingNode stores the selected capability in:
     *
     * state.capability
     *
     * state.capabilities is optional and should only be used
     * if multiple capabilities are ever returned.
     */

    const capability =
      state.capability ??
      (Array.isArray(state.capabilities) && state.capabilities.length > 0
        ? state.capabilities[0]
        : "recommendation");

    /*
     * =========================================================
     * Debug
     * =========================================================
     */

    console.log("Workflow :", state.workflow);
    console.log("Capability :", capability);
    console.log("Capabilities :", state.capabilities);
    /*
     * =========================================================
     * Resume Active Lead
     * =========================================================
     */

    if (
      state.workflow === "LEAD" &&
      state.currentStep &&
      state.currentStep !== "LEAD_COMPLETED"
    ) {
      if (capability === "lead") {
        return this.finalize(state, [
          {
            node: "LeadNode",
            capability: "lead",
          },
        ]);
      }

      /*
       * Allow workflow switch
       */

      state.workflow = null;
      state.currentStep = null;
      state.awaitingDecision = false;
    }

    /*
     * =========================================================
     * Resume Active Recommendation
     * =========================================================
     */

    if (
      state.workflow === "RECOMMENDATION" &&
      state.currentStep &&
      state.currentStep !== "SHOW_RECOMMENDATIONS"
    ) {
      if (capability === "recommendation") {
        return this.finalize(state, [
          {
            node: "RecommendationNode",
            capability: "recommendation",
          },
        ]);
      }

      /*
       * Recommendation can be interrupted
       */

      if (capability === "order") {
        state.workflow = null;
        state.currentStep = null;
        state.awaitingDecision = false;

        return this.finalize(state, [
          {
            node: "OrderNode",
            capability: "order",
          },
        ]);
      }

      if (capability === "lead") {
        state.workflow = null;
        state.currentStep = null;
        state.awaitingDecision = false;

        return this.finalize(state, [
          {
            node: "LeadNode",
            capability: "lead",
          },
        ]);
      }

      if (capability === "faq" || capability === "support") {
        return this.finalize(state, [
          {
            node: "FAQNode",
            capability: "faq",
          },
        ]);
      }
    }

    /*
     * =========================================================
     * Resume Active Order
     * =========================================================
     *
     * Continue only if the user is still ordering.
     * Otherwise allow an interrupt.
     */

    if (
      state.workflow === "ORDER" &&
      state.currentStep &&
      state.currentStep !== "ORDER_COMPLETED"
    ) {
      /*
       * User continues ordering
       */

      if (capability === "order") {
        return this.finalize(state, [
          {
            node: "OrderNode",
            capability: "order",
          },
        ]);
      }

      /*
       * User switched to recommendations
       */

      if (capability === "recommendation") {
        state.workflow = null;
        state.currentStep = null;
        state.awaitingDecision = false;

        return this.finalize(state, [
          {
            node: "RecommendationNode",
            capability: "recommendation",
          },
        ]);
      }

      /*
       * User wants an expert
       */

      if (capability === "lead") {
        state.workflow = null;
        state.currentStep = null;
        state.awaitingDecision = false;

        return this.finalize(state, [
          {
            node: "LeadNode",
            capability: "lead",
          },
        ]);
      }

      /*
       * FAQ / Support interrupt
       */

      if (capability === "faq" || capability === "support") {
        return this.finalize(state, [
          {
            node: "FAQNode",
            capability: "faq",
          },
        ]);
      }
    }

    /*
     * =========================================================
     * Recommendation Waiting
     * =========================================================
     */

    if (
      state.workflow === "RECOMMENDATION" &&
      state.currentStep === "SHOW_RECOMMENDATIONS"
    ) {
      switch (capability) {
        case "order":
          return this.finalize(state, [
            {
              node: "OrderNode",
              capability: "order",
            },
          ]);

        case "product_details":
          return this.finalize(state, [
            {
              node: "RecommendationNode",
              capability: "product_details",
            },
          ]);

        case "lead":
          return this.finalize(state, [
            {
              node: "LeadNode",
              capability: "lead",
            },
          ]);

        default:
          return this.finalize(state, [
            {
              node: "RecommendationNode",
              capability: "recommendation",
            },
          ]);
      }
    }

    /*
     * =========================================================
     * Continue Waiting Decision
     * =========================================================
     */

    if (state.awaitingDecision) {
      switch (state.workflow) {
        case "ORDER":
          return this.finalize(state, [
            {
              node: "OrderNode",
              capability: "order",
            },
          ]);

        case "LEAD":
          return this.finalize(state, [
            {
              node: "LeadNode",
              capability: "lead",
            },
          ]);

        default:
          break;
      }
    }

    /*
     * =========================================================
     * Fresh Request
     * =========================================================
     */

    switch (capability) {
      case "order":
        plan.push({
          node: "OrderNode",
          capability: "order",
        });
        break;

      case "lead":
        plan.push({
          node: "LeadNode",
          capability: "lead",
        });
        break;

      case "faq":
      case "support":
        plan.push({
          node: "FAQNode",
          capability: "faq",
        });
        break;

      case "greeting":
        plan.push({
          node: "GreetingNode",
          capability: "greeting",
        });
        break;

      default:
        plan.push({
          node: "RecommendationNode",
          capability: "recommendation",
        });
    }

    return this.finalize(state, plan);
  }

  finalize(state, plan) {
    state.executionPlan = plan;
    state.currentExecutionIndex = 0;
    return state;
  }
}
