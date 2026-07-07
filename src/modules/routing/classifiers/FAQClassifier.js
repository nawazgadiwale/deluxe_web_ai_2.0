export default class FAQClassifier {
  classify(state) {
    const message = (state.userMessage ?? "").trim().toLowerCase();

    if (!message) {
      return null;
    }

    const faqKeywords = [
      // Company
      "about",
      "about deluxe",
      "company",
      "who are you",
      "contact",
      "address",
      "location",
      "phone",
      "email",

      // Delivery
      "delivery",
      "shipping",
      "ship",
      "courier",
      "delivery time",
      "delivery charges",
      "international shipping",
      "outside uae",
      "outside dubai",

      // Payment
      "payment",
      "payments",
      "payment methods",
      "invoice",

      // Policies
      "return",
      "returns",
      "refund",
      "replacement",
      "exchange",
      "policy",
      "privacy",

      // Ordering
      "minimum order",
      "sample",
      "samples",

      // Printing
      "turnaround",
      "printing time",
      "production time",

      // Business
      "working hours",
      "business hours",
      "timing",
      "open today",
      "closed today",
    ];

    const matched = faqKeywords.some((keyword) => message.includes(keyword));

    if (!matched) {
      return null;
    }

    return {
      capability: "faq",
      confidence: 1,
      source: "RULE",
    };
  }
}
