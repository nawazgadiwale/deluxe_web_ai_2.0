import ConversationRepository from "../../../repositories/ConversationRepository.js";
import OrderRequestRepository from "../../../repositories/OrderRequestRepository.js";
import LeadRequestRepository from "../../../repositories/LeadRepository.js";
import MemoryService from "../../../modules/memory/MemoryService.js";

const conversationRepository = new ConversationRepository();
const orderRequestRepository = new OrderRequestRepository();
const leadRequestRepository = new LeadRequestRepository();
const memoryService = new MemoryService();

export default class SaveSessionNode {
  async execute(state) {
    /*
     * =====================================================
     * Synchronize Customer Snapshot
     * =====================================================
     */

    if (state.leadRequest?.customer) {
      state.customer = {
        ...(state.customer ?? {}),
        ...state.leadRequest.customer,
      };
    }

    if (state.orderRequest?.customer) {
      state.customer = {
        ...(state.customer ?? {}),
        ...state.orderRequest.customer,
      };
    }

    /*
     * =====================================================
     * Build Latest Memory Snapshot
     * =====================================================
     */

    state.memory = memoryService.merge(state.memory, state);

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

    if (state.persistence?.conversation?.dirty) {
      await conversationRepository.update(
        {
          sessionId: state.sessionId,
        },
        {
          customer: state.customer,

          workflow: state.workflow ?? null,

          currentStep: state.currentStep ?? null,

          metadata: state.metadata,

          memory: state.memory,

          messages: state.history,

          updatedAt: new Date(),
        },
        {
          upsert: true,
        },
      );

      state.persistence.conversation.dirty = false;
    }

    /*
     * =====================================================
     * Persist Order Request
     * =====================================================
     */

    /*
     * =====================================================
     * Sync Draft Item
     * =====================================================
     */

    if (state.orderRequest) {
      state.orderRequest.activeOrderItem = state.activeOrderItem ?? null;
      state.orderRequest.updatedAt = new Date();
    }

    console.log("======================================");
    console.log("SAVE ORDER REQUEST");
    console.log("Dirty:", state.persistence?.orderRequest?.dirty);
    console.log("Exists:", !!state.orderRequest);

    if (state.orderRequest) {
      console.dir(state.orderRequest, { depth: null });
    }
    console.log("======================================");
    if (state.persistence?.orderRequest?.dirty && state.orderRequest) {
      if (state.orderRequest._id) {
        state.orderRequest = await orderRequestRepository.update(
          {
            _id: state.orderRequest._id,
          },
          state.orderRequest,
        );
      } else {
        try {
          state.orderRequest = await orderRequestRepository.create({
            ...state.orderRequest,
            sessionId: state.sessionId,
            conversationId: state.conversationId,
          });

          console.log("Order saved successfully");
        } catch (err) {
          console.error("ORDER SAVE FAILED");
          console.error(err);
        }
      }

      state.persistence.orderRequest.dirty = false;
    }

    /*
     * =====================================================
     * Persist Lead Request
     * =====================================================
     */
    console.log("Saving workflow:", state.workflow);
    console.log("Saving step:", state.currentStep);
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

    return state;
  }
}
