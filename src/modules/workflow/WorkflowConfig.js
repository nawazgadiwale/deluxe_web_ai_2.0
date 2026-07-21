export default {
  RECOMMENDATION: {
    capability: "recommendation",
    persistent: true,

    completed: ["SHOW_RECOMMENDATIONS", "RECOMMENDATION_COMPLETED"],

    interruptibleBy: [
      "greeting",
      "faq",
      "support",
      "product_details",
      "comparison",
      "discovery",
      "out_of_scope",
    ],
  },

  LEAD: {
    capability: "lead",
    persistent: true,

    completed: ["LEAD_COMPLETED"],

    interruptibleBy: [
      "greeting",
      "faq",
      "support",
      "product_details",
      "comparison",
      "discovery",
      "out_of_scope",
    ],
  },

  ORDER: {
    capability: "order",
    persistent: true,

    completed: ["ORDER_COMPLETED"],

    interruptibleBy: [
      "greeting",
      "faq",
      "support",
      "product_details",
      "comparison",
      "discovery",
      "out_of_scope",
    ],
  },
};
