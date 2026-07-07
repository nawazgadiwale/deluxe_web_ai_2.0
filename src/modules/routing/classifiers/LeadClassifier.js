import { LEAD_KEYWORDS } from "../utils/RoutingConstants.js";

export default class LeadClassifier {
  classify(state) {
    const message = (state.userMessage ?? "").trim().toLowerCase();

    if (!message) {
      return null;
    }

    const matched = LEAD_KEYWORDS.some((keyword) => message.includes(keyword));

    if (!matched) {
      return null;
    }

    return {
      capability: "lead",
      confidence: 1,
      source: "RULE",
    };
  }
}
