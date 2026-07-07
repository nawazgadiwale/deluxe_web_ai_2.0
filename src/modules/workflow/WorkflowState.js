import WorkflowRegistry from "./WorkflowRegistry.js";

const RESUMABLE_STEPS = {
  RECOMMENDATION: [
    "ASK_CUSTOMER_TYPE",
    "ASK_BUSINESS_TYPE",
    "ASK_BUSINESS_GOAL",
    "ASK_REQUIREMENTS",
  ],

  LEAD: ["ASK_NAME", "ASK_PHONE", "ASK_EMAIL", "ASK_COMPANY"],
};

const COMPLETED_STEPS = {
  RECOMMENDATION: ["SHOW_RECOMMENDATIONS", "RECOMMENDATION_COMPLETED"],
  LEAD: ["LEAD_COMPLETED"],
};

const INTERRUPT_CAPABILITIES = [
  "greeting",
  "faq",
  "support",
  "product_details",
  "comparison",
  "discovery",
];

export default class WorkflowState {
  isActive(state) {
    return Boolean(state.workflow);
  }

  isAwaitingDecision(state) {
    return Boolean(state.awaitingDecision);
  }

  get(workflow) {
    if (!workflow) return null;

    return WorkflowRegistry[workflow.toLowerCase()] ?? null;
  }

  getCapability(workflow) {
    return this.get(workflow)?.capability ?? null;
  }

  currentCapability(state) {
    return this.getCapability(state.workflow);
  }

  isPersistent(workflow) {
    return this.get(workflow)?.persistent ?? false;
  }

  shouldResume(state) {
    if (!this.isActive(state)) return false;

    if (!this.isAwaitingDecision(state)) return false;

    if (this.isCompleted(state)) return false;

    const resumable = RESUMABLE_STEPS[state.workflow] ?? [];

    return resumable.includes(state.currentStep);
  }

  canInterrupt(state, capability) {
    if (!this.isActive(state)) return true;

    if (this.isCompleted(state)) return true;

    if (!this.isPersistent(state.workflow)) return true;

    return INTERRUPT_CAPABILITIES.includes(capability);
  }

  clear(state) {
    state.workflow = null;
    state.currentStep = null;
    state.awaitingDecision = false;

    return state;
  }

  /*
   * =====================================================
   * Completed Workflow
   * =====================================================
   */

  isCompleted(state) {
    if (!this.isActive(state)) {
      return false;
    }

    const completed = COMPLETED_STEPS[state.workflow] ?? [];

    return completed.includes(state.currentStep);
  }
  /*
   * =====================================================
   * Clear Workflow
   * =====================================================
   */

  shouldClear(state) {
    if (!this.isActive(state)) {
      return false;
    }

    /*
     * Clear completed workflows
     */

    if (this.isCompleted(state)) {
      return true;
    }

    /*
     * Clear non-persistent workflows
     */

    return !this.isPersistent(state.workflow);
  }

  /*
   * =====================================================
   * Pending Step
   * =====================================================
   */

  hasPendingStep(state) {
    return Boolean(state.currentStep);
  }

  /*
   * =====================================================
   * Awaiting Decision
   * =====================================================
   */

  isAwaitingDecision(state) {
    return Boolean(state.awaitingDecision);
  }

  /*
   * =====================================================
   * Active Workflow
   * =====================================================
   */

  isActive(state) {
    return Boolean(state.workflow);
  }
}
