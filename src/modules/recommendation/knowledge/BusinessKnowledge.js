import BUSINESS_GOALS from "./BusinessGoals.js";
import BUSINESS_CHALLENGES from "./BusinessChallenges.js";
import SALES_STRATEGIES from "./SalesStrategies.js";
import UPSELL_STRATEGIES from "./UpsellStrategies.js";

const BUSINESS_KNOWLEDGE = {
  Restaurant: {
    description:
      "Food service businesses serving dine-in, takeaway and delivery customers.",

    goals: [
      BUSINESS_GOALS.PACKAGING,
      BUSINESS_GOALS.BRAND_AWARENESS,
      BUSINESS_GOALS.CUSTOMER_EXPERIENCE,
      BUSINESS_GOALS.CUSTOMER_RETENTION,
      BUSINESS_GOALS.PROMOTION,
    ],

    challenges: [
      BUSINESS_CHALLENGES.TAKEAWAY,
      BUSINESS_CHALLENGES.DELIVERY,
      BUSINESS_CHALLENGES.BRAND_RECOGNITION,
      BUSINESS_CHALLENGES.CUSTOMER_ATTRACTION,
    ],

    salesStrategy: SALES_STRATEGIES.PACKAGING_FIRST,

    upsellStrategy: UPSELL_STRATEGIES.ENHANCE_CUSTOMER_EXPERIENCE,
  },

  Cafe: {
    description:
      "Coffee shops and cafés focused on takeaway, dine-in and customer experience.",

    goals: [
      BUSINESS_GOALS.PACKAGING,
      BUSINESS_GOALS.BRAND_AWARENESS,
      BUSINESS_GOALS.CUSTOMER_EXPERIENCE,
      BUSINESS_GOALS.PROMOTION,
    ],

    challenges: [
      BUSINESS_CHALLENGES.TAKEAWAY,
      BUSINESS_CHALLENGES.CUSTOMER_RETENTION,
      BUSINESS_CHALLENGES.BRAND_RECOGNITION,
    ],

    salesStrategy: SALES_STRATEGIES.PACKAGING_FIRST,

    upsellStrategy: UPSELL_STRATEGIES.ENHANCE_CUSTOMER_EXPERIENCE,
  },

  "Corporate Office": {
    description:
      "Businesses requiring professional branding, networking and corporate communication.",

    goals: [
      BUSINESS_GOALS.PROFESSIONAL_IDENTITY,
      BUSINESS_GOALS.CORPORATE_BRANDING,
      BUSINESS_GOALS.NETWORKING,
      BUSINESS_GOALS.BRAND_AWARENESS,
    ],

    challenges: [
      BUSINESS_CHALLENGES.PROFESSIONAL_IMAGE,
      BUSINESS_CHALLENGES.CORPORATE_IDENTITY,
      BUSINESS_CHALLENGES.CLIENT_COMMUNICATION,
    ],

    salesStrategy: SALES_STRATEGIES.BUSINESS_IDENTITY_FIRST,

    upsellStrategy: UPSELL_STRATEGIES.COMPLETE_BRAND_IDENTITY,
  },

  Startup: {
    description:
      "New businesses establishing their brand and attracting their first customers.",

    goals: [
      BUSINESS_GOALS.BUSINESS_LAUNCH,
      BUSINESS_GOALS.BRAND_AWARENESS,
      BUSINESS_GOALS.PROFESSIONAL_IDENTITY,
      BUSINESS_GOALS.LEAD_GENERATION,
    ],

    challenges: [
      BUSINESS_CHALLENGES.BRAND_RECOGNITION,
      BUSINESS_CHALLENGES.CUSTOMER_ATTRACTION,
      BUSINESS_CHALLENGES.PROFESSIONAL_IMAGE,
    ],

    salesStrategy: SALES_STRATEGIES.BUSINESS_IDENTITY_FIRST,

    upsellStrategy: UPSELL_STRATEGIES.COMPLETE_BRAND_IDENTITY,
  },

  "Retail Store": {
    description: "Retail businesses selling products directly to customers.",

    goals: [
      BUSINESS_GOALS.PRODUCT_PRESENTATION,
      BUSINESS_GOALS.PACKAGING,
      BUSINESS_GOALS.PROMOTION,
      BUSINESS_GOALS.CUSTOMER_EXPERIENCE,
    ],

    challenges: [
      BUSINESS_CHALLENGES.PRODUCT_VISIBILITY,
      BUSINESS_CHALLENGES.CUSTOMER_ATTRACTION,
      BUSINESS_CHALLENGES.BRAND_RECOGNITION,
    ],

    salesStrategy: SALES_STRATEGIES.MARKETING_FIRST,

    upsellStrategy: UPSELL_STRATEGIES.INCREASE_BRAND_VISIBILITY,
  },

  Hotel: {
    description:
      "Hospitality businesses focused on guest experience and premium branding.",

    goals: [
      BUSINESS_GOALS.CUSTOMER_EXPERIENCE,
      BUSINESS_GOALS.CORPORATE_BRANDING,
      BUSINESS_GOALS.BRAND_AWARENESS,
    ],

    challenges: [
      BUSINESS_CHALLENGES.GUEST_EXPERIENCE,
      BUSINESS_CHALLENGES.PROFESSIONAL_IMAGE,
      BUSINESS_CHALLENGES.BRAND_RECOGNITION,
    ],

    salesStrategy: SALES_STRATEGIES.CUSTOMER_EXPERIENCE_FIRST,

    upsellStrategy: UPSELL_STRATEGIES.ENHANCE_CUSTOMER_EXPERIENCE,
  },

  "Medical Clinic": {
    description:
      "Healthcare providers requiring patient communication and professional branding.",

    goals: [
      BUSINESS_GOALS.INFORMATION_SHARING,
      BUSINESS_GOALS.PROFESSIONAL_IDENTITY,
      BUSINESS_GOALS.CUSTOMER_EXPERIENCE,
    ],

    challenges: [
      BUSINESS_CHALLENGES.INFORMATION_COMMUNICATION,
      BUSINESS_CHALLENGES.PROFESSIONAL_IMAGE,
      BUSINESS_CHALLENGES.PATIENT_COMMUNICATION,
    ],

    salesStrategy: SALES_STRATEGIES.BUSINESS_IDENTITY_FIRST,

    upsellStrategy: UPSELL_STRATEGIES.STRENGTHEN_PROFESSIONAL_IMAGE,
  },

  "Educational Institute": {
    description:
      "Schools, colleges and training institutes communicating with students and parents.",

    goals: [
      BUSINESS_GOALS.INFORMATION_SHARING,
      BUSINESS_GOALS.BRAND_AWARENESS,
      BUSINESS_GOALS.EVENT_MARKETING,
    ],

    challenges: [
      BUSINESS_CHALLENGES.INFORMATION_COMMUNICATION,
      BUSINESS_CHALLENGES.BRAND_RECOGNITION,
    ],

    salesStrategy: SALES_STRATEGIES.MARKETING_FIRST,

    upsellStrategy: UPSELL_STRATEGIES.SUPPORT_MARKETING_CAMPAIGN,
  },

  Other: {
    description: "Generic business profile.",

    goals: [BUSINESS_GOALS.BRAND_AWARENESS],

    challenges: [BUSINESS_CHALLENGES.CUSTOMER_ATTRACTION],

    salesStrategy: SALES_STRATEGIES.MARKETING_FIRST,

    upsellStrategy: UPSELL_STRATEGIES.INCREASE_BRAND_VISIBILITY,
  },
};

export default BUSINESS_KNOWLEDGE;
