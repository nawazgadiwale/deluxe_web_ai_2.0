import LeadManager from "./LeadManager.js";
import LeadExtractor from "./LeadExtractor.js";

const extractor = new LeadExtractor();
const manager = new LeadManager();

export default class LeadService {
  async process(state) {
    /*
     * =====================================================
     * Load Existing Lead
     * =====================================================
     */

    let lead = state.leadRequest ?? manager.createLead();

    /*
     * =====================================================
     * Extract ONLY current field
     * =====================================================
     */

    const extracted = await extractor.extract(state);

    /*
     * =====================================================
     * Merge Extracted Data
     * =====================================================
     */

    manager.updateCustomer(lead, extracted);

    /*
     * =====================================================
     * Lead Type
     * =====================================================
     */

    if (!lead.type) {
      manager.updateType(lead, state.metadata?.leadType ?? "GENERAL_ENQUIRY");
    }

    /*
     * =====================================================
     * Validate Mobile
     * =====================================================
     */

    if (lead.customer.mobile && !manager.isMobileValid(lead.customer.mobile)) {
      return {
        status: "COLLECTING_CUSTOMER",

        leadRequest: lead,

        awaitingDecision: false,

        currentStep: "ASK_MOBILE",

        response: {
          step: "ASK_MOBILE",

          field: "mobile",

          message:
            "That doesn't appear to be a valid phone number. Please enter your mobile number again.",
        },
      };
    }

    /*
     * =====================================================
     * Validate Email
     * =====================================================
     */

    if (lead.customer.email && !manager.isEmailValid(lead.customer.email)) {
      return {
        status: "COLLECTING_CUSTOMER",

        leadRequest: lead,

        awaitingDecision: false,

        currentStep: "ASK_EMAIL",

        response: {
          step: "ASK_EMAIL",

          field: "email",

          message:
            "That doesn't appear to be a valid email address. Please enter it again.",
        },
      };
    }

    /*
     * =====================================================
     * Ask Next Question
     * =====================================================
     */
    const nextQuestion = manager.getNextQuestion(lead);

    if (nextQuestion.step !== "LEAD_COMPLETED") {
      manager.updateStatus(lead, "COLLECTING_CUSTOMER");

      return {
        status: "COLLECTING_CUSTOMER",
        leadRequest: lead,
        awaitingDecision: false,
        currentStep: nextQuestion.step,
        response: nextQuestion,
      };
    }

    /*
     * Lead Completed
     */

    manager.assignSalesPerson(lead, {
      role: "Admin",
      name: "Admin User",
    });

    manager.updateStatus(lead, "SUBMITTED");

    return {
      status: "COMPLETED",
      leadRequest: lead,
      awaitingDecision: false,
      currentStep: null,
      response: {
        step: "LEAD_COMPLETED",
        message:
          "Thank you. Your request has been submitted successfully. One of our product specialists will contact you shortly.",
      },
    };
  }
}
