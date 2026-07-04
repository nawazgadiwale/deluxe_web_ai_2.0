import LLMService from "../../ai/llm/LLMService.js";
import RoutingPrompt from "../../ai/llm/prompts/RoutingPrompt.js";
import CatalogService from "../catalog/CatalogService.js";

const llmService = new LLMService();
const catalogService = new CatalogService();

export default class RoutingEngine {
  // updated correct code
  async route(state) {
    const message = (state.userMessage ?? "").trim().toLowerCase();
    /*
     * =====================================================
     * ACTION ROUTING (Highest Priority)
     * =====================================================
     *
     * UI actions should bypass keyword detection and LLM.
     */

    const actionId = state.action?.id;

    if (actionId) {
      switch (actionId) {
        /*
         * Recommendation
         */

        case "SHOW_PRODUCT_DETAILS":
          return {
            capability: "product_details",
            confidence: 1,
            source: "ACTION",
          };

        /*
         * Order Workflow
         */

        case "ORDER_PRODUCT":
        case "REVIEW_ORDER":
        case "MODIFY_ORDER":
        case "CONFIRM_ORDER":
        case "ADD_ANOTHER_PRODUCT":
        case "CANCEL_ORDER":
        case "REMOVE_ITEM":
        case "CHANGE_QUANTITY":
          return {
            capability: "order",
            confidence: 1,
            source: "ACTION",
          };

        /*
         * Lead
         */

        case "CONTACT_SALES":
        case "GET_QUOTE":
          return {
            capability: "lead",
            confidence: 1,
            source: "ACTION",
          };

        default:
          break;
      }
    }
    /*
     * =====================================================
     * Keyword Lists
     * =====================================================
     */

    const leadKeywords = [
      "expert",
      "sales",
      "quotation",
      "quote",
      "callback",
      "call me",
      "representative",
      "human",
      "consultant",
      "connect",
      "talk to sales",
      "sales team",
      "contact sales",
    ];

    const faqKeywords = [
      "return",
      "returns",
      "return policy",
      "refund",
      "replacement",
      "exchange",
      "policy",
      "shipping",
      "delivery",
      "delivery time",
      "payment",
      "payments",
      "payment methods",
      "contact",
      "phone",
      "email",
      "location",
      "located",
      "address",
      "working hours",
      "timing",
      "about company",
      "about deluxe",
      "company",
      "services",
      "minimum order",
      "sample",
      "samples",
      "turnaround",
      "printing time",
      "delivery",
    "deliver",
    "shipping",
    "ship",
    "courier",

    "outside dubai",
    "outside uae",
    "international",
    "worldwide",
    "deliver outside",
    "deliver to",
    "delivery charges",
    "all over the world",
    ];

    const recommendationKeywords = [
      "recommend",
      "suggest",
      "ideas",
      "idea",
      "opening",
      "starting",
      "business",
      "branding",
      "promotion",
      "marketing",
      "looking for",
      "find",
      "search",
      "best",
      "suitable",
      "what should",
      "which product",
      "which products",
    ];

    const orderKeywords = [
      "buy",
      "purchase",
      "order",
      "checkout",
      "confirm",
      "place order",
      "confirm order",
      "quantity",
      "qty",
      "i'll take",
      "take this",
      "add another",
      "add to cart",
    ];

    const detailKeywords = [
      "show",
      "details",
      "detail",
      "tell me about",
      "about",
      "information",
      "info",
      "price",
      "cost",
      "specification",
      "specifications",
      "sizes",
      "materials",
      "finish",
    ];

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
      const interrupt = [
        ...recommendationKeywords,
        ...leadKeywords,
        ...faqKeywords,
      ];

      if (!interrupt.some((w) => message.includes(w))) {
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
      const interrupt = [
        ...recommendationKeywords,
        ...orderKeywords,
        ...faqKeywords,
      ];

      if (!interrupt.some((w) => message.includes(w))) {
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

    if (leadKeywords.some((w) => message.includes(w))) {
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

    if (faqKeywords.some((w) => message.includes(w))) {
      return {
        capability: "faq",
        confidence: 1,
        source: "RULE",
      };
    }

    /*
     * =====================================================
     * ORDER
     * =====================================================
     */

    if (orderKeywords.some((w) => message.includes(w))) {
      return {
        capability: "order",
        confidence: 1,
        source: "RULE",
      };
    }

    /*
     * =====================================================
     * RECOMMENDATION
     * =====================================================
     */
    const businessTypes = [
      "cafe",
      "restaurant",
      "hotel",
      "hospital",
      "school",
      "college",
      "clinic",
      "gym",
      "salon",
      "spa",
      "bakery",
      "pharmacy",
      "office",
      "real estate",
      "retail",
      "supermarket",
      "boutique",
      "fashion",
      "jewellery",
      "travel",
      "tourism",
    ];

    if (businessTypes.some((type) => message.includes(type))) {
      return {
        capability: "recommendation",
        confidence: 1,
        source: "RULE",
      };
    }
    if (recommendationKeywords.some((w) => message.includes(w))) {
      return {
        capability: "recommendation",
        confidence: 1,
        source: "RULE",
      };
    }

    /*
     * =====================================================
     * PRODUCT DETAILS
     * =====================================================
     */

    const product = await catalogService.findExactProduct(state.userMessage);

    if (product) {
      return {
        capability: "product_details",
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
      ["hello", "hi", "hey", "good morning", "good evening"].some((w) =>
        message.startsWith(w),
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
        capability: {
          type: "string",
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
        conversationState: state.workflow,
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
