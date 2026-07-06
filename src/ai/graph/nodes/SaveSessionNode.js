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
    console.log("========== SAVE NODE ENTRY ==========");
    console.log("Dirty:", state.persistence?.conversation?.dirty);
    console.log("Workflow:", state.workflow);
    console.log("Step:", state.currentStep);
    console.log("=====================================");
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
    console.log("======================================");
    console.log("SAVE CONVERSATION");
    console.log("Conversation Dirty:", state.persistence?.conversation?.dirty);
    console.log("Workflow:", state.workflow);
    console.log("Current Step:", state.currentStep);
    console.log("======================================");
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
    console.log("Conversation Updated.");

    const verify = await conversationRepository.findBySessionId(
      state.sessionId,
    );

    console.log("Mongo Workflow:", verify.workflow);
    console.log("Mongo Step:", verify.currentStep);

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
    console.log("Saving workflow:", state.workflow);
    console.log("Saving step:", state.currentStep);

    return state;
  }
}
