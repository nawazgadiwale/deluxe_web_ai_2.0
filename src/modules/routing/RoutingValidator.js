const VALID_CAPABILITIES = [
  "greeting",
  "recommendation",
  "discovery",
  "product_details",
  "comparison",
  "faq",
  "support",
  "lead",
];

const VALID_SOURCES = ["ACTION", "RULE", "LLM", "FALLBACK"];

export default class RoutingValidator {
  validate(result = {}) {
    const capability = this.validateCapability(result.capability);

    const confidence = this.validateConfidence(result.confidence);

    const source = this.validateSource(result.source);

    return {
      capability,
      capabilities: [capability],
      confidence,
      source,
    };
  }

  validateCapability(capability) {
    if (
      typeof capability === "string" &&
      VALID_CAPABILITIES.includes(capability)
    ) {
      return capability;
    }

    return "recommendation";
  }

  validateConfidence(confidence) {
    const value = Number(confidence);

    if (Number.isNaN(value)) {
      return 0;
    }

    return Math.max(0, Math.min(value, 1));
  }

  validateSource(source) {
    if (VALID_SOURCES.includes(source)) {
      return source;
    }

    return "RULE";
  }
}
