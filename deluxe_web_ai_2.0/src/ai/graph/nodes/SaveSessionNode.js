import ConversationRepository from "../../../repositories/ConversationRepository.js";
import LeadRequestRepository from "../../../repositories/LeadRepository.js";
import MemoryService from "../../../modules/memory/MemoryService.js";
import OrderRepository from "../../../repositories/OrderRequestRepository.js";

const conversationRepository = new ConversationRepository();
const leadRequestRepository = new LeadRequestRepository();
const orderRepository = new OrderRepository();

const memoryService = new MemoryService();

export default class SaveSessionNode {
  async execute(state) {
    /*
     * =====================================================
     * Synchronize Customer
     * =====================================================
     */

    if (state.leadRequest?.customer) {
      state.customer = {
        ...(state.customer ?? {}),
        ...state.leadRequest.customer,
      };
    }

    /*
     * =====================================================
     * Build Latest Memory Snapshot
     * =====================================================
     */

    // console.log("BEFORE MERGE");
    // console.dir(state.recommendationContext, { depth: null });

    state.memory = memoryService.merge(state.memory, state);

    // console.log("AFTER MERGE");
    // console.dir(state.memory.recommendationContext, { depth: null });

    state.recommendation = state.memory.recommendation;

    state.recommendationContext = state.memory.recommendationContext;

    /*
     * =====================================================
     * Clean Conversation History
     * =====================================================
     */

    state.history = (state.history ?? [])
      .filter(
        (message) =>
          message &&
          message.role &&
          typeof message.content === "string" &&
          message.content.trim().length > 0,
      )
      .slice(-50);

    /*
     * =====================================================
     * Persist Conversation
     * =====================================================
     */

    // console.log("==== BEFORE SAVE ====");
    // console.dir(
    //   {
    //     dirty: state.persistence?.conversation?.dirty,
    //     workflow: state.workflow,
    //     currentStep: state.currentStep,
    //     recommendationActive: state.recommendationContext?.active,
    //   },
    //   { depth: null },
    // );

    if (true) {
      const active =
        state.order &&
        !["CONFIRMED", "CANCELLED", "DELETED"].includes(state.order.status);

      const workflow = active ? "ORDER" : (state.workflow ?? null);
      /*
       * Order workflow is now form-based.
       * Only Recommendation / Lead persist conversational steps.
       */
      const currentStep = state.order?.active
        ? null
        : (state.currentStep ?? null);
      const conversationUpdate = {
        customer: state.customer,

        workflow,

        currentStep,

        metadata: {
          ...(state.metadata ?? {}),
          workflowStack: state.workflowStack ?? [],
          lastRecommendationAt:
            state.recommendationContext?.completedAt ?? null,
        },

        memory: {
          ...state.memory,
          recommendation: state.recommendation,
          recommendationContext: state.recommendationContext,
        },

        messages: state.history,

        updatedAt: new Date(),
      };

      state.conversation = await conversationRepository.update(
        {
          sessionId: state.sessionId,
        },
        {
          $set: conversationUpdate,
        },
        {
          upsert: true,
        },
      );

      const db = await conversationRepository.findBySessionId(state.sessionId);

      // console.log("==== DATABASE ====");
      // console.dir(
      //   {
      //     workflow: db.workflow,
      //     currentStep: db.currentStep,
      //     recommendationActive: db.memory?.recommendationContext?.active,
      //   },
      //   { depth: null },
      // );

      /*
       * =====================================================
       * Synchronize Memory Snapshot
       * =====================================================
       */

      state.memory = memoryService.build(state.conversation);

      state.persistence.conversation.dirty = false;
    }

    /*
     * =====================================================
     * Persist Lead Request
     * =====================================================
     */

    if (state.persistence?.leadRequest?.dirty && state.leadRequest) {
      if (state.leadRequest._id) {
        state.leadRequest = await leadRequestRepository.update(
          {
            _id: state.leadRequest._id,
          },
          state.leadRequest,
        );
      } else {
        state.leadRequest = await leadRequestRepository.create({
          ...state.leadRequest,

          sessionId: state.sessionId,

          conversationId: state.conversationId,
        });
      }

      state.persistence.leadRequest.dirty = false;
    }

    /*
     * =====================================================
     * Link Order -> Lead
     * =====================================================
     */

    const pendingLeadId =
      state.order &&
      state.leadRequest?._id &&
      state.order.leadId !== state.leadRequest._id
        ? state.leadRequest._id
        : null;

    /*
     * =====================================================
     * Persist Order
     * =====================================================
     */

    if (state.persistence?.order?.dirty && state.order) {
      /*
       * Order no longer stores conversational workflow state.
       */

      state.order.updatedAt = new Date();

      state.order = await orderRepository.saveDraft(
        state.sessionId,
        state.conversationId,
        state.order,
      );

      if (pendingLeadId) {
        state.order = await orderRepository.update(state.order._id, {
          leadId: pendingLeadId,
        });
      }

      state.orderContext = state.order;

      state.persistence.order.dirty = false;
    }

    // console.log("========== SAVE ==========");
    // console.log({
    //   workflow: state.workflow,
    //   orderActive: state.order?.active,
    //   currentStep: state.currentStep,
    //   awaitingDecision: state.awaitingDecision,
    //   recommendationActive: state.recommendationContext?.active,
    //   dirty: state.persistence?.conversation?.dirty,
    // });
    // console.log("==========================");

    return state;
  }
}
