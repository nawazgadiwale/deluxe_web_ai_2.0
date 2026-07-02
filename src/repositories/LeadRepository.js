import BaseRepository from "./BaseRepositories.js";

import LeadRequest from "../models/LeadRequest.js";

export default class LeadRequestRepository extends BaseRepository {
  model = LeadRequest;

  async findBySessionId(sessionId) {
    return this.findOne({
      sessionId,
    });
  }

  async findActiveByConversationId(conversationId) {
    return this.findOne({
      conversationId,

      status: {
        $in: ["DRAFT", "COLLECTING_CUSTOMER"],
      },
    });
  }

  async findSubmittedByConversationId(conversationId) {
    return this.find({
      conversationId,

      status: {
        $in: ["SUBMITTED", "COMPLETED"],
      },
    });
  }
}
