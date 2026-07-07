import LLMService from "../../../ai/llm/LLMService.js";
import RoutingPrompt from "../../../ai/llm/prompts/RoutingPrompt.js";

const llmService = new LLMService();

export default class LLMFallbackClassifier {
  async classify(state) {
    const schema = {
      type: "object",
      properties: {
        capability: {
          type: "string",
          enum: [
            "greeting",
            "faq",
            "discovery",
            "recommendation",
            "product_details",
            "comparison",
            "support",
            "lead",
          ],
        },

        confidence: {
          type: "number",
        },
      },

      required: ["capability", "confidence"],
    };

    const result = await llmService.invokeStructured({
      schema,

      systemPrompt: RoutingPrompt({
        history: state.history ?? [],
        message: state.userMessage,
      }),

      userMessage: state.userMessage,
    });

    return {
      capability: result.capability,
      confidence: result.confidence,
      source: "LLM",
    };
  }
}
