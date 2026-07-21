/**
 * ============================================================
 * Upsell Strategies
 * ============================================================
 *
 * Defines WHY additional products should be recommended.
 *
 * Never recommend products simply because they are related.
 * Recommend products only if they strengthen the customer's
 * overall business solution.
 */

const UPSELL_STRATEGIES = {
  COMPLETE_BRAND_IDENTITY: {
    id: "complete_brand_identity",

    name: "Complete Brand Identity",

    description:
      "Recommend additional branding materials that create a consistent and professional business identity.",
  },

  EXPAND_MARKETING_REACH: {
    id: "expand_marketing_reach",

    name: "Expand Marketing Reach",

    description:
      "Recommend complementary marketing materials that increase customer reach and engagement.",
  },

  IMPROVE_CUSTOMER_EXPERIENCE: {
    id: "improve_customer_experience",

    name: "Improve Customer Experience",

    description:
      "Recommend products that enhance the customer's experience before, during and after purchase.",
  },

  SUPPORT_DAILY_OPERATIONS: {
    id: "support_daily_operations",

    name: "Support Daily Operations",

    description:
      "Recommend products that improve business efficiency and day-to-day operations.",
  },

  COMPLETE_EVENT_SOLUTION: {
    id: "complete_event_solution",

    name: "Complete Event Solution",

    description:
      "Recommend additional materials required for a successful exhibition, conference or promotional event.",
  },

  INCREASE_BRAND_VISIBILITY: {
    id: "increase_brand_visibility",

    name: "Increase Brand Visibility",

    description:
      "Recommend products that reinforce the customer's brand across multiple touchpoints.",
  },
};

export default UPSELL_STRATEGIES;
