export default class MemoryService {
  create(sessionId = null) {
    return {
      sessionId,

      customer: {
        name: null,
        mobile: null,
        email: null,
        company: null,
      },

      workflow: null,

      currentStep: null,

      leadRequest: null,

      recommendation: null,

      selectedProduct: null,

      comparisonProducts: [],

      recommendationContext: null,

      metadata: {},
    };
  }

  build(conversation = null) {
    if (!conversation) {
      return this.create();
    }

    return {
      sessionId: conversation.sessionId,

      customer: {
        name: null,
        mobile: null,
        email: null,
        company: null,
        ...(conversation.customer ?? {}),
      },

      workflow: conversation.workflow ?? null,

      currentStep: conversation.currentStep ?? null,
      selectedProduct: null,

      recommendation: conversation.memory?.recommendation ?? null,

      recommendationContext: conversation.memory?.recommendationContext ?? null,

      selectedProduct: conversation.memory?.selectedProduct ?? null,

      comparisonProducts: conversation.memory?.comparisonProducts ?? [],

      metadata: conversation.metadata ?? {},
    };
  }
  merge(memory = {}, state = {}) {
    return {
      ...memory,

      customer: state.customer ?? memory.customer,

      workflow: state.workflow ?? memory.workflow,

      currentStep: state.currentStep ?? memory.currentStep,

      leadRequest: state.leadRequest ?? memory.leadRequest,

      recommendation: state.recommendation ?? memory.recommendation,

      recommendationContext:
        state.recommendationContext ?? memory.recommendationContext,

      selectedProduct: state.selectedProduct ?? memory.selectedProduct,

      comparisonProducts: state.comparisonProducts ?? memory.comparisonProducts,

      metadata: {
        ...(memory.metadata ?? {}),
        ...(state.metadata ?? {}),
      },
    };
  }
}
