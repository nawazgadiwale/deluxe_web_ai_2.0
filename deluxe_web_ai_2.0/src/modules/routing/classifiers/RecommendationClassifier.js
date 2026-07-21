import LLMService from "../../../ai/llm/LLMService.js";
import RecommendationRoutingPrompt from "../../../ai/llm/prompts/RecommendationRoutingPrompt.js";

import {
  RECOMMENDATION_PATTERNS,
  ALL_INTERRUPT_PATTERNS,
} from "../utils/RoutingConstants.js";

const llm = new LLMService();

export default class RecommendationClassifier {
  async classify(state) {
    /*
     * Active workflow
     */

    if (state.workflow) {
      return null;
    }

    /*
     * Already inside recommendation
     */

    if (state.recommendationContext?.active) {
      return null;
    }

    const message = (state.userMessage ?? "").trim();

    if (!message) {
      return null;
    }

    const normalized = message.toLowerCase();

    /*
     * Rule Based
     */

    if (RECOMMENDATION_PATTERNS.some((pattern) => pattern.test(normalized))) {
      return {
        capability: "recommendation",
        confidence: 1,
        source: "RULE",
      };
    }

    /*
     * Don't steal other intents
     */

    if (ALL_INTERRUPT_PATTERNS.some((pattern) => pattern.test(normalized))) {
      return null;
    }

    /*
     * Tiny LLM
     */

    const schema = {
      type: "object",
      properties: {
        recommendation: {
          type: "boolean",
        },
      },
      required: ["recommendation"],
    };

    const result = await llm.invokeStructured({
      schema,
      systemPrompt: RecommendationRoutingPrompt(),
      userMessage: message,
    });

    if (!result.recommendation) {
      return null;
    }

    return {
      capability: "recommendation",
      confidence: 0.8,
      source: "LLM",
    };
  }
}
