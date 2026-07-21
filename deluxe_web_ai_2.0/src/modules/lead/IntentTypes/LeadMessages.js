import LEAD_TYPES from "./LeadTypes.js";

const LEAD_MESSAGES = {
  [LEAD_TYPES.QUOTE_REQUEST]: {
    title: "Quotation Request",

    introduction:
      "I'd be happy to prepare a quotation tailored to your requirements.",

    completion:
      "Thank you. Your quotation request has been submitted successfully. One of our sales specialists will contact you shortly.",

    assignedRole: "Sales Team",

    priority: "HIGH",
  },

  [LEAD_TYPES.EXPERT_CONSULTATION]: {
    title: "Expert Consultation",

    introduction:
      "I'll connect you with one of our printing specialists who can guide you.",

    completion:
      "Thank you. Your consultation request has been submitted. One of our printing specialists will contact you shortly.",

    assignedRole: "Printing Consultant",

    priority: "HIGH",
  },

  [LEAD_TYPES.PRODUCT_ENQUIRY]: {
    title: "Product Enquiry",

    introduction:
      "I'd be happy to help you find the most suitable printing solution.",

    completion:
      "Thank you. Your product enquiry has been submitted. One of our product specialists will contact you shortly.",

    assignedRole: "Product Specialist",

    priority: "MEDIUM",
  },

  [LEAD_TYPES.BULK_ORDER]: {
    title: "Bulk Order",

    introduction: "I'll assist you with your bulk printing requirement.",

    completion:
      "Thank you. Your bulk order request has been submitted. Our corporate sales team will contact you shortly.",

    assignedRole: "Corporate Sales",

    priority: "HIGH",
  },

  [LEAD_TYPES.CUSTOM_PRINTING]: {
    title: "Custom Printing",

    introduction: "I'd be happy to discuss your custom printing requirements.",

    completion:
      "Thank you. Your custom printing request has been submitted. Our custom printing specialists will contact you shortly.",

    assignedRole: "Custom Printing Team",

    priority: "HIGH",
  },

  [LEAD_TYPES.DESIGN_ASSISTANCE]: {
    title: "Design Assistance",

    introduction:
      "Our design team will be happy to help bring your ideas to life.",

    completion:
      "Thank you. Your design assistance request has been submitted. One of our design specialists will contact you shortly.",

    assignedRole: "Design Team",

    priority: "MEDIUM",
  },

  [LEAD_TYPES.CALLBACK_REQUEST]: {
    title: "Callback Request",

    introduction: "I'll arrange for one of our team members to contact you.",

    completion:
      "Thank you. Your callback request has been submitted. We'll contact you as soon as possible.",

    assignedRole: "Customer Support",

    priority: "MEDIUM",
  },

  [LEAD_TYPES.ORDER_REQUEST]: {
    title: "Order Request",

    introduction:
      "I'll finalize your order before submitting it to our sales team.",

    completion:
      "Thank you. Your order request has been submitted successfully. One of our printing specialists will contact you shortly to confirm pricing, artwork and production.",

    assignedRole: "Sales Team",

    priority: "HIGH",
  },
  

  [LEAD_TYPES.GENERAL_ENQUIRY]: {
    title: "General Enquiry",

    introduction: "I'd be happy to assist you with your enquiry.",

    completion:
      "Thank you. Your enquiry has been submitted successfully. One of our team members will contact you shortly.",

    assignedRole: "Customer Support",

    priority: "LOW",
  },
};

export default LEAD_MESSAGES;
