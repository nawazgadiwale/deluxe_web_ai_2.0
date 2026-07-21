/**
 * ============================================================
 * Sales Strategies
 * ============================================================
 *
 * Defines how the recommendation engine should think.
 * These strategies describe HOW to solve a customer's
 * business problem, not WHICH products to recommend.
 */

const SALES_STRATEGIES = {
  BUSINESS_IDENTITY_FIRST: {
    id: "business_identity_first",

    name: "Business Identity First",

    objective: "Establish a strong and professional brand identity.",

    description:
      "Prioritize products that help businesses build trust and present a consistent professional image.",

    priority: "PRIMARY",

    reasoning:
      "Businesses without a strong identity struggle to build trust and recognition.",

    recommendationOrder: ["Identity", "Communication", "Marketing"],

    upsellApproach: "Expand the customer's corporate identity solution.",
  },

  PACKAGING_FIRST: {
    id: "packaging_first",

    name: "Packaging First",

    objective: "Solve product packaging before promotional needs.",

    description:
      "Focus on protecting products while improving presentation and brand visibility.",

    priority: "PRIMARY",

    reasoning:
      "Packaging directly affects customer experience and brand perception.",

    recommendationOrder: ["Packaging", "Branding", "Marketing"],

    upsellApproach:
      "Recommend complementary branding products that enhance packaging.",
  },

  MARKETING_FIRST: {
    id: "marketing_first",

    name: "Marketing First",

    objective: "Help the customer attract new business.",

    description:
      "Prioritize products that increase visibility and generate enquiries.",

    priority: "PRIMARY",

    reasoning:
      "Businesses seeking growth benefit most from increased visibility.",

    recommendationOrder: [
      "Promotion",
      "Brand Awareness",
      "Customer Engagement",
    ],

    upsellApproach: "Expand into a complete marketing campaign.",
  },

  CUSTOMER_EXPERIENCE_FIRST: {
    id: "customer_experience_first",

    name: "Customer Experience First",

    objective: "Improve how customers interact with the business.",

    description:
      "Recommend products that improve the customer's journey before promotional materials.",

    priority: "SECONDARY",

    reasoning:
      "A better customer experience increases repeat business and loyalty.",

    recommendationOrder: ["Experience", "Branding", "Promotion"],

    upsellApproach: "Strengthen the complete customer experience.",
  },

  EVENT_SUCCESS: {
    id: "event_success",

    name: "Event Success",

    objective: "Support exhibitions, launches and promotional events.",

    description:
      "Recommend products that maximize visibility and engagement during events.",

    priority: "PRIMARY",

    reasoning:
      "Events require a coordinated branding strategy rather than isolated products.",

    recommendationOrder: ["Visibility", "Engagement", "Follow-up"],

    upsellApproach: "Recommend products that complete the event experience.",
  },
};

export default SALES_STRATEGIES;
