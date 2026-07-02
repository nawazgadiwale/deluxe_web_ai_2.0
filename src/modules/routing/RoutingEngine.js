import LLMService from "../../ai/llm/LLMService.js";
import RoutingPrompt from "../../ai/llm/prompts/RoutingPrompt.js";

const llmService = new LLMService();

export default class RoutingEngine {
  async route(state) {
    const message = (state.userMessage ?? "").trim().toLowerCase();

    /*
     * =====================================================
     * ACTIVE ORDER
     * =====================================================
     */

    if (
      state.workflow === "ORDER" &&
      state.currentStep &&
      state.currentStep !== "ORDER_COMPLETED"
    ) {
      const interruptWords = [
        "recommend",
        "suggest",
        "idea",
        "ideas",
        "business",
        "branding",
        "promotion",
        "promote",
        "gift",
        "gifts",
        "expert",
        "quotation",
        "quote",
        "location",
        "address",
        "contact",
        "phone",
      ];

      if (!interruptWords.some((word) => message.includes(word))) {
        return {
          capability: "order",
          confidence: 1,
          source: "RULE",
        };
      }
    }

    /*
     * =====================================================
     * ACTIVE LEAD
     * =====================================================
     */

    if (
      state.workflow === "LEAD" &&
      state.currentStep &&
      state.currentStep !== "LEAD_COMPLETED"
    ) {
      const interruptWords = [
        "recommend",
        "suggest",
        "buy",
        "purchase",
        "order",
        "products",
        "ideas",
      ];

      if (!interruptWords.some((word) => message.includes(word))) {
        return {
          capability: "lead",
          confidence: 1,
          source: "RULE",
        };
      }
    }

    /*
     * =====================================================
     * LEAD
     * =====================================================
     */

    if (
      [
        "expert",
        "sales",
        "quotation",
        "quote",
        "callback",
        "call me",
        "representative",
        "human",
        "connect",
      ].some((word) => message.includes(word))
    ) {
      return {
        capability: "lead",
        confidence: 1,
        source: "RULE",
      };
    }

    /*
     * =====================================================
     * FAQ
     * =====================================================
     */

    if (
      [
        "location",
        "address",
        "working hours",
        "contact",
        "phone",
        "email",
      ].some((word) => message.includes(word))
    ) {
      return {
        capability: "faq",
        confidence: 1,
        source: "RULE",
      };
    }

    /*
     * =====================================================
     * RECOMMENDATION
     * =====================================================
     */

    if (
      [
        "recommend",
        "suggest",
        "idea",
        "ideas",
        "looking for",
        "need",
        "search",
        "find",
        "business",
        "branding",
        "promotion",
        "promote",
        "gift",
        "gifts",
        "opening",
        "attract",
        "marketing",
      ].some((word) => message.includes(word))
    ) {
      return {
        capability: "recommendation",
        confidence: 1,
        source: "RULE",
      };
    }

    /*
     * =====================================================
     * ORDER
     * =====================================================
     */

    if (
      [
        "buy",
        "purchase",
        "order",
        "place order",
        "checkout",
        "confirm",
        "confirm order",
        "add another",
        "quantity",
        "qty",
        "i'll take",
        "take this",
      ].some((word) => message.includes(word))
    ) {
      return {
        capability: "order",
        confidence: 1,
        source: "RULE",
      };
    }

    /*
     * =====================================================
     * GREETING
     * =====================================================
     */

    if (
      ["hello", "hi", "hey", "good morning", "good evening"].some((word) =>
        message.startsWith(word),
      )
    ) {
      return {
        capability: "greeting",
        confidence: 1,
        source: "RULE",
      };
    }

    /*
     * =====================================================
     * LLM FALLBACK
     * =====================================================
     */

    const schema = {
      type: "object",
      properties: {
        capability: { type: "string" },
        confidence: { type: "number" },
      },
      required: ["capability", "confidence"],
    };

    const result = await llmService.invokeStructured({
      schema,
      systemPrompt: RoutingPrompt({
        history: state.history ?? [],
        message: state.userMessage,
        conversationState: state.conversationState,
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
