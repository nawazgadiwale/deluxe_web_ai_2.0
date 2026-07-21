import api from "./api";

class ChatService {
  async sendMessage(sessionId, message = "", action = null) {
    const payload = {
      sessionId,
      message,
    };

    /*
     * Only include action when it exists.
     */

    if (action) {
      payload.action = action;
    }

    return await api.post("/", payload);
  }

  async getConversation(sessionId) {
    return await api.get(`/${sessionId}`);
  }

  async completeConversation(sessionId) {
    return await api.patch(`/${sessionId}/complete`);
  }
}

export default new ChatService();
