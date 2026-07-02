import ChatApplication from "../../application/ChatApplication.js";

const chatApplication = new ChatApplication();

export default class ChatController {
  /**
   * POST /api/chat
   */
  chat = async (req, res, next) => {
    try {
      const result = await chatApplication.process(req.body);

      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/chat/:sessionId
   */
  getConversation = async (req, res, next) => {
    try {
      const { sessionId } = req.params;

      const conversation = await chatApplication.getConversation(sessionId);

      if (!conversation) {
        return res.status(404).json({
          success: false,
          message: "Conversation not found.",
        });
      }

      return res.status(200).json({
        success: true,
        data: conversation,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PATCH /api/chat/:sessionId/complete
   */
  completeConversation = async (req, res, next) => {
    try {
      const { sessionId } = req.params;

      await chatApplication.completeConversation(sessionId);

      return res.status(200).json({
        success: true,
        message: "Conversation completed successfully.",
      });
    } catch (error) {
      next(error);
    }
  };
}
