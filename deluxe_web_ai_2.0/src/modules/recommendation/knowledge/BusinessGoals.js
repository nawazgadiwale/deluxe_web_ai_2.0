/**
 * ============================================================
 * Business Goals Knowledge
 * ============================================================
 *
 * Describes the business outcome a customer wants to achieve.
 *
 * These are business concepts.
 * NOT products.
 * NOT catalog categories.
 */

const BUSINESS_GOALS = {
  BRAND_AWARENESS: {
    id: "brand_awareness",
    name: "Brand Awareness",
    description:
      "Increase visibility and recognition of the business or brand.",
    priority: "PRIMARY",
    keywords: [
      "brand",
      "branding",
      "brand awareness",
      "visibility",
      "recognition",
      "exposure",
      "brand identity",
      "company image",
      "business image",
      "brand recall",
    ],
  },

  PROFESSIONAL_IDENTITY: {
    id: "professional_identity",
    name: "Professional Identity",
    description: "Establish a credible and professional business image.",
    priority: "PRIMARY",
    keywords: [
      "professional",
      "professional identity",
      "professional image",
      "credibility",
      "corporate image",
      "business identity",
      "company identity",
      "first impression",
      "official",
    ],
  },

  CORPORATE_BRANDING: {
    id: "corporate_branding",
    name: "Corporate Branding",
    description: "Maintain consistent branding across business materials.",
    priority: "PRIMARY",
    keywords: [
      "corporate branding",
      "corporate",
      "company branding",
      "consistent branding",
      "brand consistency",
      "business branding",
      "company profile",
    ],
  },

  PACKAGING: {
    id: "packaging",
    name: "Packaging",
    description:
      "Protect products while improving presentation and brand visibility.",
    priority: "PRIMARY",
    keywords: [
      "packaging",
      "package",
      "box",
      "boxes",
      "food box",
      "food boxes",
      "gift box",
      "paper bag",
      "carry bag",
      "shopping bag",
      "wrapper",
      "wrapping",
      "packing",
      "pack",
    ],
  },

  PRODUCT_PRESENTATION: {
    id: "product_presentation",
    name: "Product Presentation",
    description: "Present products in an attractive and professional manner.",
    priority: "SECONDARY",
    keywords: [
      "display",
      "presentation",
      "product presentation",
      "showcase",
      "premium look",
      "luxury",
      "attractive",
      "professional presentation",
    ],
  },

  CUSTOMER_EXPERIENCE: {
    id: "customer_experience",
    name: "Customer Experience",
    description:
      "Improve the customer's interaction and overall brand experience.",
    priority: "SECONDARY",
    keywords: [
      "customer experience",
      "customer satisfaction",
      "guest experience",
      "shopping experience",
      "user experience",
      "experience",
      "premium experience",
      "better experience",
    ],
  },

  PROMOTION: {
    id: "promotion",
    name: "Promotion",
    description:
      "Promote products, services or campaigns to attract customers.",
    priority: "SECONDARY",
    keywords: [
      "promotion",
      "promote",
      "advertise",
      "advertising",
      "marketing",
      "campaign",
      "offer",
      "offers",
      "discount",
      "sale",
      "launch",
      "promotion campaign",
      "awareness campaign",
    ],
  },

  LEAD_GENERATION: {
    id: "lead_generation",
    name: "Lead Generation",
    description: "Generate new customer enquiries and business opportunities.",
    priority: "SECONDARY",
    keywords: [
      "lead",
      "leads",
      "lead generation",
      "generate leads",
      "new customers",
      "enquiries",
      "prospects",
      "business enquiries",
      "customer acquisition",
    ],
  },

  NETWORKING: {
    id: "networking",
    name: "Networking",
    description:
      "Support professional networking and business relationship building.",
    priority: "SECONDARY",
    keywords: [
      "networking",
      "network",
      "client meeting",
      "business meeting",
      "meeting",
      "connections",
      "contacts",
      "trade show",
      "exhibition",
    ],
  },

  SALES_GROWTH: {
    id: "sales_growth",
    name: "Sales Growth",
    description:
      "Increase sales by improving marketing and customer engagement.",
    priority: "SECONDARY",
    keywords: [
      "increase sales",
      "grow sales",
      "boost sales",
      "sell more",
      "sales growth",
      "increase revenue",
      "business growth",
      "more customers",
    ],
  },

  EVENT_MARKETING: {
    id: "event_marketing",
    name: "Event Marketing",
    description:
      "Support exhibitions, conferences, launches and promotional events.",
    priority: "SECONDARY",
    keywords: [
      "event",
      "events",
      "conference",
      "seminar",
      "trade show",
      "exhibition",
      "expo",
      "launch event",
      "event marketing",
      "booth",
    ],
  },

  INFORMATION_SHARING: {
    id: "information_sharing",
    name: "Information Sharing",
    description:
      "Clearly communicate business, product or service information.",
    priority: "OPTIONAL",
    keywords: [
      "information",
      "details",
      "brochure",
      "catalogue",
      "catalog",
      "menu",
      "guide",
      "instructions",
      "price list",
      "company profile",
    ],
  },

  WAYFINDING: {
    id: "wayfinding",
    name: "Wayfinding",
    description: "Help customers navigate locations through effective signage.",
    priority: "OPTIONAL",
    keywords: [
      "direction",
      "directions",
      "wayfinding",
      "sign",
      "signage",
      "navigation",
      "directory",
      "floor guide",
      "location",
    ],
  },

  SAFETY_COMPLIANCE: {
    id: "safety_compliance",
    name: "Safety & Compliance",
    description:
      "Communicate mandatory safety, compliance and regulatory information.",
    priority: "OPTIONAL",
    keywords: [
      "safety",
      "warning",
      "hazard",
      "mandatory",
      "compliance",
      "regulation",
      "policy",
      "instruction",
      "ppe",
      "notice",
    ],
  },

  CUSTOMER_RETENTION: {
    id: "customer_retention",
    name: "Customer Retention",
    description: "Encourage repeat business and strengthen customer loyalty.",
    priority: "SECONDARY",
    keywords: [
      "customer retention",
      "loyalty",
      "repeat customers",
      "return customers",
      "customer loyalty",
      "retention",
      "keep customers",
      "retain customers",
    ],
  },

  BUSINESS_LAUNCH: {
    id: "business_launch",
    name: "Business Launch",
    description: "Support the successful launch of a new business or brand.",
    priority: "PRIMARY",
    keywords: [
      "launch",
      "new business",
      "opening",
      "grand opening",
      "startup",
      "business launch",
      "new brand",
      "opening soon",
    ],
  },

  SEASONAL_PROMOTION: {
    id: "seasonal_promotion",
    name: "Seasonal Promotion",
    description:
      "Promote seasonal campaigns, festivals and limited-time offers.",
    priority: "OPTIONAL",
    keywords: [
      "seasonal",
      "festival",
      "holiday",
      "eid",
      "ramadan",
      "christmas",
      "new year",
      "diwali",
      "offer",
      "limited time",
    ],
  },
};

export default BUSINESS_GOALS;
