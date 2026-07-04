const VALID_CAPABILITIES = [
  "greeting",
  "recommendation",
  "product_details",
  "order",
  "lead",
  "support",
  "faq",
];
const VALID_SOURCES = ["ACTION", "RULE", "LLM", "FALLBACK"];

export default class RoutingValidator {
  validate(result = {}) {
    let capability = "recommendation";

    if (
      typeof result.capability === "string" &&
      VALID_CAPABILITIES.includes(result.capability)
    ) {
      capability = result.capability;
    }

    let confidence = Number(result.confidence ?? 0);

    if (Number.isNaN(confidence)) {
      confidence = 0;
    }

    confidence = Math.max(0, Math.min(confidence, 1));

    const source = VALID_SOURCES.includes(result.source)
      ? result.source
      : "RULE";

    /*
     * Low-confidence LLM → safe fallback.
     */

    if (source === "LLM" && confidence < 0.7) {
      capability = "recommendation";
    }

    return {
      capability,
      capabilities: [capability],
      confidence,
      source,
    };
  }
}
