import LeadManager from "./LeadManager.js";
import LeadExtractor from "./LeadExtractor.js";
import LeadIntentResolver from "./IntentTypes/LeadIntentResolver.js";

const extractor = new LeadExtractor();
const manager = new LeadManager();
const intentResolver = new LeadIntentResolver();

export default class LeadService {
  async process(state) {
    let lead = state.leadRequest ?? manager.createLead();

    /*
     * =====================================================
     * First entry into Lead workflow
     * =====================================================
     */

    if (!state.leadRequest && !state.currentStep) {
      /*
       * =====================================================
       * Resolve Lead Intent
       * =====================================================
       */

      const intent = await intentResolver.resolve(state.userMessage);

      manager.updateType(lead, intent.type);

      /*
       * =====================================================
       * Metadata
       * =====================================================
       */

      state.metadata = {
        ...(state.metadata ?? {}),
        leadType: intent.type,
        leadPriority: intent.priority,
      };

      /*
       * =====================================================
       * Status
       * =====================================================
       */

      manager.updateStatus(lead, "COLLECTING_CUSTOMER");

      const nextQuestion = manager.getNextQuestion(lead);

      return {
        status: "COLLECTING_CUSTOMER",

        leadRequest: lead,

        awaitingDecision: false,

        currentStep: nextQuestion.step,

        response: nextQuestion,
      };
    }

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
      const intent = await intentResolver.resolve(state.userMessage);

      manager.updateType(lead, intent.type);
    }

    /*
     * =====================================================
     * Validate Phone
     * =====================================================
     */

    if (lead.customer.phone && !manager.isPhoneValid(lead.customer.phone)) {
      return {
        status: "COLLECTING_CUSTOMER",

        leadRequest: lead,

        awaitingDecision: false,

        currentStep: "ASK_PHONE",

        response: {
          step: "ASK_PHONE",

          field: "phone",

          message:
            "That doesn't appear to be a valid phone number. Please enter your phone number again.",
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
