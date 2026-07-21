import LEAD_TYPES from "./LeadTypes.js";

const LEAD_INTENT_PATTERNS = [
  /*
   * =====================================================
   * Quote Request
   * =====================================================
   */
  {
    type: LEAD_TYPES.QUOTE_REQUEST,
    patterns: [
      "quote",
      "quotation",
      "quotation request",
      "pricing",
      "price",
      "cost",
      "estimate",
      "estimated price",
      "how much",
      "budget",
      "quotation for",
      "price for",
      "cost for",
      "need a quote",
      "request a quote",
      "can you quote",
      "quotation please",
    ],
  },

  /*
   * =====================================================
   * Expert Consultation
   * =====================================================
   */
  {
    type: LEAD_TYPES.EXPERT_CONSULTATION,
    patterns: [
      "talk to expert",
      "speak to expert",
      "printing expert",
      "sales expert",
      "sales consultant",
      "consultant",
      "specialist",
      "expert advice",
      "call me",
      "contact me",
      "talk to someone",
      "speak to someone",
      "human",
      "representative",
      "sales team",
      "customer support",
    ],
  },


  /*
   * =====================================================
   * Bulk Order
   * =====================================================
   */
  {
    type: LEAD_TYPES.BULK_ORDER,
    patterns: [
      "bulk",
      "large quantity",
      "wholesale",
      "1000",
      "5000",
      "10000",
      "mass order",
      "corporate order",
      "bulk printing",
    ],
  },

  /*
   * =====================================================
   * Custom Printing
   * =====================================================
   */
  {
    type: LEAD_TYPES.CUSTOM_PRINTING,
    patterns: [
      "custom",
      "custom printing",
      "custom size",
      "custom design",
      "bespoke",
      "tailor made",
      "special requirement",
      "special printing",
    ],
  },

  /*
   * =====================================================
   * Design Assistance
   * =====================================================
   */
  {
    type: LEAD_TYPES.DESIGN_ASSISTANCE,
    patterns: [
      "design",
      "designer",
      "design help",
      "create artwork",
      "artwork",
      "graphic design",
      "logo",
      "branding",
      "layout",
    ],
  },

  /*
   * =====================================================
   * Callback
   * =====================================================
   */
  {
    type: LEAD_TYPES.CALLBACK_REQUEST,
    patterns: ["call back", "callback", "call me back", "phone me", "ring me"],
  },
];

export default LEAD_INTENT_PATTERNS;
