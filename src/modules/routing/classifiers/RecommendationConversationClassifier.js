import LLMService from "../../../ai/llm/LLMService.js";
import RecommendationConversationRoutingPrompt from "../../../ai/llm/prompts/RecommendationConversationRoutingPrompt.js";

import ProductResolver from "../../catalog/ProductResolver.js";

import {
  WORKFLOW_ANSWER_PATTERNS,
  ALL_INTERRUPT_PATTERNS,
  DISCOVERY_PATTERNS,
} from "../utils/RoutingConstants.js";

const llm = new LLMService();
const resolver = new ProductResolver();

export default class RecommendationConversationClassifier {
  async classify(state) {
    const ctx = state.recommendationContext ?? {};

    /*
     * =====================================================
     * No active recommendation session
     * =====================================================
     */

    if (!ctx.active) {
      return null;
    }

    /*
     * =====================================================
     * Another workflow owns the conversation
     * =====================================================
     */

    if (state.workflow && state.workflow !== "RECOMMENDATION") {
      return null;
    }

    const message = (state.userMessage ?? "").trim();

    if (!message) {
      return null;
    }

    const normalized = message.toLowerCase();

    /*
     * =====================================================
     * Explicit workflow answers
     * =====================================================
     */

    if (WORKFLOW_ANSWER_PATTERNS.some((p) => p.test(normalized))) {
      return {
        capability: "recommendation",
        confidence: 1,
        source: "RULE",
      };
    }

    /*
     * =====================================================
     * Explicit interrupt
     * Let Product Router / FAQ / Support handle it.
     * =====================================================
     */

    if (ALL_INTERRUPT_PATTERNS.some((p) => p.test(normalized))) {
      return null;
    }

    /*
     * =====================================================
     * Mentioning recommended products
     * =====================================================
     */

    const context = await resolver.resolveContext(message, state);

    if (context.products.length > 0) {
      return {
        capability: "recommendation",
        confidence: 1,
        source: "RULE",
      };
    }

    /*
     * =====================================================
     * Discovery follow-up
     * =====================================================
     */

    if (DISCOVERY_PATTERNS.some((p) => p.test(normalized))) {
      return {
        capability: "recommendation",
        confidence: 1,
        source: "RULE",
      };
    }

    /*
     * =====================================================
     * Active recommendation session
     *
     * If recommendations already exist and the user has
     * not explicitly switched intent, continue the
     * recommendation conversation.
     * =====================================================
     */

    if (
      ctx.completed &&
      (ctx.catalogProducts?.length ?? 0) > 0 &&
      !state.awaitingDecision
    ) {
      return {
        capability: "recommendation",
        confidence: 1,
        source: "CONVERSATION",
      };
    }

    /*
     * =====================================================
     * Tiny LLM (fallback only)
     * =====================================================
     */

    const schema = {
      type: "object",
      properties: {
        continueConversation: {
          type: "boolean",
        },
      },
      required: ["continueConversation"],
    };

    const result = await llm.invokeStructured({
      schema,

      systemPrompt: RecommendationConversationRoutingPrompt({
        products: (ctx.catalogProducts ?? []).map((p) => p.metadata.product),
      }),

      userMessage: message,
    });

    if (!result.continueConversation) {
      return null;
    }

    return {
      capability: "recommendation",
      confidence: 0.8,
      source: "CONVERSATION",
    };
  }
}
