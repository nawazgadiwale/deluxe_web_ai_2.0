import ConversationRepository from "../../../repositories/ConversationRepository.js";
import OrderRequestRepository from "../../../repositories/OrderRequestRepository.js";
import LeadRequestRepository from "../../../repositories/LeadRepository.js";
import MemoryService from "../../../modules/memory/MemoryService.js";

const conversationRepository = new ConversationRepository();
const orderRequestRepository = new OrderRequestRepository();
const leadRequestRepository = new LeadRequestRepository();
const memoryService = new MemoryService();

export default class LoadSessionNode {
  async execute(state) {
    if (!state.sessionId) {
      throw new Error("Session ID is required.");
    }

    /*
     * =====================================================
     * Conversation
     * =====================================================
     */

    let conversation = await conversationRepository.findBySessionId(
      state.sessionId,
    );

    state.awaitingDecision = ["NEXT_ITEM", "ORDER_REVIEW"].includes(
      state.currentStep,
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

    state.conversation = conversation;

    state.conversationId = conversation._id.toString();

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

    state.workflow = conversation.workflow ?? null;

    state.currentStep = conversation.currentStep ?? null;

    console.log("Loaded workflow:", state.workflow);
    console.log("Loaded currentStep:", state.currentStep);

    state.metadata = conversation.metadata ?? {};

    state.memory = memoryService.build(conversation);
    /*
     * =====================================================
     * Restore Recommendation Context
     * =====================================================
     */

    state.recommendation = state.memory.recommendation ?? null;

    state.recommendationContext = state.memory.recommendationContext ?? {
      customerType: null,
      businessType: null,
      businessGoal: null,
      requirements: null,
      originalQuery: null,

      products: [],
      totalProducts: 0,
      page: 1,
      hasMore: false,
    };
    /*
     * =====================================================
     * Load Active Order
     * =====================================================
     */

    const orderRequest =
      await orderRequestRepository.findActiveByConversationId(conversation._id);

    state.orderRequest = orderRequest ?? null;

    state.activeOrderItem = orderRequest?.activeOrderItem ?? null;

    /*
     * =====================================================
     * Load Active Lead
     * =====================================================
     */

    const leadRequest = await leadRequestRepository.findActiveByConversationId(
      conversation._id,
    );

    state.leadRequest = leadRequest ?? null;

    /*
     * =====================================================
     * Restore Workflow
     * =====================================================
     */

    if (leadRequest && leadRequest.status !== "SUBMITTED") {
      state.workflow = "LEAD";

      state.currentStep = conversation.currentStep ?? "ASK_NAME";
    }

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

      orderRequest: {
        dirty: false,
        updatedAt: null,
      },

      leadRequest: {
        dirty: false,
        updatedAt: null,
      },
    };

    return state;
  }
}
