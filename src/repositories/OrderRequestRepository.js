import BaseRepository from "./BaseRepositories.js";

import OrderRequest from "../models/OrderRequest.js";

export default class OrderRequestRepository extends BaseRepository {
  model = OrderRequest;

  async findBySessionId(sessionId) {
    return this.find({
      sessionId,
    });
  }

  async findActiveByConversationId(conversationId) {
    return this.findOne({
      conversationId,

      status: "DRAFT",
    });
  }
}
