import LLMService from "../../../ai/llm/LLMService.js";

import LEAD_TYPES from "./LeadTypes.js";
import LEAD_INTENT_PATTERNS from "./LeadIntentPatterns.js";

const llm = new LLMService();

export default class LeadIntentResolver {
  async resolve(message = "") {
    const text = message.trim().toLowerCase();

    /*
     * =====================================================
     * Empty
     * =====================================================
     */

    if (!text) {
      return {
        type: LEAD_TYPES.GENERAL_ENQUIRY,
        source: "DEFAULT",
      };
    }

    /*
     * =====================================================
     * Rule Based Detection
     * =====================================================
     */

    for (const intent of LEAD_INTENT_PATTERNS) {
      if (
        intent.patterns.some((pattern) => text.includes(pattern.toLowerCase()))
      ) {
        return {
          type: intent.type,
          priority: intent.priority,
          source: "RULE",
        };
      }
    }

    /*
     * =====================================================
     * Tiny LLM
     * =====================================================
     */

    const schema = {
      type: "object",
      properties: {
        leadType: {
          type: "string",
          enum: Object.values(LEAD_TYPES),
        },
      },
      required: ["leadType"],
    };

    const systemPrompt = `
You classify why a customer wants to be contacted.

Return ONLY one lead type.

Available Types:

${Object.values(LEAD_TYPES).join("\n")}

Examples

"I need pricing"
→ QUOTE_REQUEST

"Can I speak to an expert?"
→ EXPERT_CONSULTATION

"I need help choosing products"
→ PRODUCT_ENQUIRY

"I need custom printing"
→ CUSTOM_PRINTING

"I want to place a bulk order"
→ BULK_ORDER

"I need design help"
→ DESIGN_ASSISTANCE

"Please call me"
→ CALLBACK_REQUEST

Anything else
→ GENERAL_ENQUIRY

Return JSON only.
`;

    try {
      const result = await llm.invokeStructured({
        schema,
        systemPrompt,
        userMessage: message,
        temperature: 0,
      });

      return {
        type: result.leadType ?? LEAD_TYPES.GENERAL_ENQUIRY,
        source: "LLM",
      };
    } catch {
      return {
        type: LEAD_TYPES.GENERAL_ENQUIRY,
        source: "DEFAULT",
      };
    }
  }
}
