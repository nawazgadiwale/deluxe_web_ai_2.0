// import ConversationRepository from "../../../repositories/ConversationRepository.js";
// import LeadRequestRepository from "../../../repositories/LeadRepository.js";
// import MemoryService from "../../../modules/memory/MemoryService.js";
// import OrderRepository from "../../../repositories/OrderRequestRepository.js";

// const orderRepository = new OrderRepository();
// const conversationRepository = new ConversationRepository();

// const leadRequestRepository = new LeadRequestRepository();
// const memoryService = new MemoryService();

// export default class LoadSessionNode {
//   async execute(state) {
//     if (!state.sessionId) {
//       throw new Error("Session ID is required.");
//     }

//     /*
//      * =====================================================
//      * Conversation
//      * =====================================================
//      */

//     let conversation = await conversationRepository.findBySessionId(
//       state.sessionId,
//     );

//     const order = await orderRepository.findActiveBySession(state.sessionId);

//     state.awaitingDecision = false;

//     if (!conversation) {
//       conversation = await conversationRepository.create({
//         sessionId: state.sessionId,

//         customer: {
//           name: null,
//           mobile: null,
//           email: null,
//           company: null,
//         },

//         messages: [],

//         workflow: null,

//         currentStep: null,

//         memory: {},

//         metadata: {},

//         status: "ACTIVE",
//       });
//     }

//     state.conversation = conversation;

//     state.order = order;

//     state.orderContext = order;

//     /*
//      * =====================================================
//      * Restore Active Order
//      * =====================================================
//      */

//     if (order?.active && !state.workflow) {
//       state.workflow = "ORDER";
//     }

//     state.conversationId = conversation._id.toString();

//     state.customer = {
//       name: null,
//       mobile: null,
//       email: null,
//       company: null,
//       ...(conversation.customer ?? {}),
//     };

//     state.history = Array.isArray(conversation.messages)
//       ? [...conversation.messages.slice(-50)]
//       : [];

//     /*
//      * =====================================================
//      * Restore Active Workflow
//      * =====================================================
//      */

//     if (
//       order &&
//       !["CONFIRMED", "CANCELLED", "DELETED"].includes(order.status)
//     ) {
//       state.workflow = "ORDER";
//     } else if (conversation.workflow === "ORDER") {
//       console.warn("Conversation says ORDER but no active order exists.");

//       state.workflow = null;
//     }

//     state.workflowStack = conversation.metadata?.workflowStack ?? [];

//     /*
//      * =====================================================
//      * Restore Memory
//      * =====================================================
//      */

//     state.memory = memoryService.build(conversation);

//     console.log("====== LOAD ======");
//     console.log({
//       workflow: conversation.workflow,
//       currentStep: conversation.currentStep,
//       memoryWorkflow: state.memory.workflow,
//       recommendationActive: state.memory.recommendationContext?.active,
//       recommendationCompleted: state.memory.recommendationContext?.completed,
//     });
//     console.log("==================");

//     /*
//      * =====================================================
//      * Restore Recommendation Workflow
//      * =====================================================
//      */

//     if (
//       !state.workflow &&
//       conversation.workflow === "RECOMMENDATION" &&
//       !state.memory?.recommendationContext?.completed
//     ) {
//       state.workflow = "RECOMMENDATION";
//       state.currentStep = conversation.currentStep;
//       state.awaitingDecision = true;
//     }

//     /*
//      * =====================================================
//      * Restore Recommendation
//      * =====================================================
//      */

//     state.recommendation = state.memory.recommendation ?? null;

//     /*
//      * =====================================================
//      * Restore Recommendation Context
//      * =====================================================
//      */

//     state.recommendationContext =
//       state.memory.recommendationContext ??
//       memoryService.createRecommendationContext();

//     /*
//      * =====================================================
//      * Resume Recommendation Conversation
//      * =====================================================
//      */

//     if (
//       state.recommendationContext.active &&
//       !state.recommendationContext.completed
//     ) {
//       state.workflow = "RECOMMENDATION";

//       state.currentStep =
//         state.currentStep ??
//         state.recommendationContext.currentStep ??
//         "ASK_CUSTOMER_TYPE";

//       state.awaitingDecision = true;
//     }

//     /*
//      * =====================================================
//      * Restore Recommendation Session
//      * =====================================================
//      */

//     if (
//       state.recommendationContext.active &&
//       state.recommendationContext.completed
//     ) {
//       state.recommendation = state.recommendation ?? null;
//     }

//     /*
//      * =====================================================
//      * Restore Recommendation Solution
//      * =====================================================
//      */

//     state.recommendationSolution = state.recommendationContext.solution ?? {
//       primary: [],
//       supporting: [],
//       upsell: [],
//     };

//     /*
//      * =====================================================
//      * Restore Selected Product
//      * =====================================================
//      */

//     state.selectedProduct = state.memory.selectedProduct ?? null;

//     /*
//      * =====================================================
//      * Restore Comparison
//      * =====================================================
//      */

//     state.comparison = state.memory.comparison ?? null;

//     state.comparisonContext = state.memory.comparisonContext ?? null;

//     state.comparisonProducts = state.memory.comparisonProducts ?? [];

//     /*
//      * =====================================================
//      * Load Active Lead
//      * =====================================================
//      */

//     const leadRequest = await leadRequestRepository.findActiveByConversationId(
//       conversation._id,
//     );

//     state.leadRequest = leadRequest ?? null;

//     /*
//      * =====================================================
//      * Restore Lead Workflow
//      * =====================================================
//      */

//     if (!state.workflow && leadRequest && leadRequest.status !== "SUBMITTED") {
//       state.workflow = "LEAD";
//       state.currentStep = conversation.currentStep ?? "ASK_NAME";
//     }

//     /*
//      * =====================================================
//      * Persistence Flags
//      * =====================================================
//      */

//     state.persistence = {
//       conversation: {
//         dirty: false,
//         updatedAt: null,
//       },

//       customer: {
//         dirty: false,
//         updatedAt: null,
//       },

//       leadRequest: {
//         dirty: false,
//         updatedAt: null,
//       },

//       order: {
//         dirty: false,
//         updatedAt: null,
//       },
//     };

//     return state;
//   }
// }

import ConversationRepository from "../../../repositories/ConversationRepository.js";
import LeadRequestRepository from "../../../repositories/LeadRepository.js";
import OrderRepository from "../../../repositories/OrderRequestRepository.js";
import MemoryService from "../../../modules/memory/MemoryService.js";

const conversationRepository = new ConversationRepository();
const leadRequestRepository = new LeadRequestRepository();
const orderRepository = new OrderRepository();
const memoryService = new MemoryService();

export default class LoadSessionNode {
  async execute(state) {
    if (!state.sessionId) {
      throw new Error("Session ID is required.");
    }

    /*
     * =====================================================
     * Load Conversation
     * =====================================================
     */

    let conversation = await conversationRepository.findBySessionId(
      state.sessionId,
    );

    if (!conversation) {
      conversation = await conversationRepository.create({
        sessionId: state.sessionId,

        customer: {
          name: null,
          mobile: null,
          email: null,
          company: null,
        },

        messages: [],

        workflow: null,

        currentStep: null,

        memory: {},

        metadata: {},

        status: "ACTIVE",
      });
    }

    /*
     * =====================================================
     * Load Related Documents
     * =====================================================
     */

    const order = await orderRepository.findActiveBySession(state.sessionId);

    const leadRequest = await leadRequestRepository.findActiveByConversationId(
      conversation._id,
    );

    /*
     * =====================================================
     * Base Conversation
     * =====================================================
     */

    state.conversation = conversation;

    state.conversationId = conversation._id.toString();

    state.order = order ?? null;

    state.orderContext = order ?? null;

    state.leadRequest = leadRequest ?? null;

    state.customer = {
      name: null,
      mobile: null,
      email: null,
      company: null,
      ...(conversation.customer ?? {}),
    };

    state.history = Array.isArray(conversation.messages)
      ? [...conversation.messages.slice(-50)]
      : [];

    state.workflow = null;

    state.currentStep = null;

    state.awaitingDecision = false;

    state.workflowStack = conversation.metadata?.workflowStack ?? [];

    /*
     * =====================================================
     * Restore Memory
     * =====================================================
     */

    state.memory = memoryService.build(conversation);

    state.recommendation = state.memory.recommendation ?? null;

    state.recommendationContext =
      state.memory.recommendationContext ??
      memoryService.createRecommendationContext();

    state.recommendationSolution = state.recommendationContext.solution ?? {
      primary: [],
      supporting: [],
      upsell: [],
    };

    state.selectedProduct = state.memory.selectedProduct ?? null;

    state.comparison = state.memory.comparison ?? null;

    state.comparisonContext = state.memory.comparisonContext ?? null;

    state.comparisonProducts = state.memory.comparisonProducts ?? [];

    /*
     * =====================================================
     * Restore Active Workflow
     * Priority:
     * ORDER > RECOMMENDATION > LEAD
     * =====================================================
     */

    const activeOrder =
      order && !["CONFIRMED", "CANCELLED", "DELETED"].includes(order.status);

    if (activeOrder) {
      state.workflow = "ORDER";

      state.currentStep = null;

      state.awaitingDecision = false;
    } else if (
      conversation.workflow === "RECOMMENDATION" &&
      state.recommendationContext.active &&
      !state.recommendationContext.completed
    ) {
      state.workflow = "RECOMMENDATION";

      state.currentStep =
        conversation.currentStep ??
        state.recommendationContext.currentStep ??
        "ASK_CUSTOMER_TYPE";

      state.awaitingDecision = true;
    } else if (
      conversation.workflow === "LEAD" &&
      leadRequest &&
      leadRequest.status !== "SUBMITTED"
    ) {
      state.workflow = "LEAD";

      state.currentStep = conversation.currentStep ?? "ASK_NAME";

      state.awaitingDecision = true;
    }

    /*
     * =====================================================
     * Logging
     * =====================================================
     */

    // console.log("====== LOAD ======");
    // console.dir(
    //   {
    //     workflow: state.workflow,
    //     currentStep: state.currentStep,
    //     awaitingDecision: state.awaitingDecision,
    //     memoryWorkflow: state.memory.workflow,
    //     recommendationActive: state.recommendationContext.active,
    //     recommendationCompleted: state.recommendationContext.completed,
    //   },
    //   { depth: null },
    // );
    // console.log("==================");

    /*
     * =====================================================
     * Persistence Flags
     * =====================================================
     */

    state.persistence = {
      conversation: {
        dirty: false,
        updatedAt: null,
      },

      customer: {
        dirty: false,
        updatedAt: null,
      },

      leadRequest: {
        dirty: false,
        updatedAt: null,
      },

      order: {
        dirty: false,
        updatedAt: null,
      },
    };

    return state;
  }
}
