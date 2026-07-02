import BaseRepository from "./BaseRepositories.js";

import Conversation from "../models/Conversation.js";

export default class ConversationRepository extends BaseRepository {
  model = Conversation;

  async findBySessionId(sessionId) {
    return this.findOne({
      sessionId,
    });
  }
}
