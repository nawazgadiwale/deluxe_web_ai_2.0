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

      orderRequest: null,

      leadRequest: null,

      recommendation: null,

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

      orderRequest: null,

      leadRequest: null,

      recommendation: conversation.memory?.recommendation ?? null,

      metadata: conversation.metadata ?? {},
    };
  }

  merge(memory = {}, state = {}) {
    return {
      ...memory,

      customer: state.customer ?? memory.customer,

      workflow: state.workflow ?? memory.workflow,

      currentStep: state.currentStep ?? memory.currentStep,

      orderRequest: state.orderRequest ?? memory.orderRequest,

      leadRequest: state.leadRequest ?? memory.leadRequest,

      recommendation: state.recommendation ?? memory.recommendation,

      metadata: {
        ...(memory.metadata ?? {}),
        ...(state.metadata ?? {}),
      },
    };
  }
}
