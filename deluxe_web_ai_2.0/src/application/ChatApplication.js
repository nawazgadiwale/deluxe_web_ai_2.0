import ConversationRepository from "../repositories/ConversationRepository.js";
import createConversationGraph from "../ai/graph/ConversationGraph.js";

const conversationRepository = new ConversationRepository();

const conversationGraph = createConversationGraph();

export default class ChatApplication {
  async startConversation(sessionId) {
    let conversation = await conversationRepository.findBySessionId(sessionId);

    if (!conversation) {
      conversation = await conversationRepository.create({
        sessionId,
      });
    }

    return conversation;
  }

  async getConversation(sessionId) {
    return conversationRepository.findBySessionId(sessionId);
  }

  async addMessage(sessionId, message) {
    return conversationRepository.update(
      { sessionId },
      {
        $push: {
          messages: message,
        },
      },
    );
  }

  async updateConversation(sessionId, update) {
    return conversationRepository.update({ sessionId }, update);
  }

  async completeConversation(sessionId) {
    return this.updateConversation(sessionId, {
      status: "COMPLETED",
    });
  }

  // -----------------------------
  // AI Conversation
  // -----------------------------

  async process({
    sessionId,
    conversationId = null,
    customerId = null,
    message,
    action = null,
    attachments = [],
  }) {
    await this.startConversation(sessionId);

    const state = await conversationGraph.invoke({
      sessionId,

      conversationId,

      customerId,

      userMessage: message,

      action,

      attachments,
    });

    return state.response;
  }
}
