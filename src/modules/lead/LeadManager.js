import crypto from "node:crypto";
import LEAD_MESSAGES from "./IntentTypes/LeadMessages.js";
import LEAD_TYPES from "./IntentTypes/LeadTypes.js";

export default class LeadManager {
  createLead() {
    return {
      leadId: crypto.randomUUID(),

      type: null,

      status: "DRAFT",

      customer: {
        name: null,
        phone: null,
        email: null,
        company: null,
      },

      order: null,

      notes: null,

      assignedTo: null,

      source: "AI_ASSISTANT",

      createdAt: new Date(),

      updatedAt: new Date(),
    };
  }
  getLeadIntroduction(type) {
    return (
      LEAD_MESSAGES[type]?.introduction ??
      LEAD_MESSAGES[LEAD_TYPES.GENERAL_ENQUIRY].introduction
    );
  }

  updateCustomer(lead, customer = {}) {
    console.log("Before:", lead?.customer);
    console.log("Incoming:", customer);

    if (!lead) {
      lead = this.createLead();
    }

    lead.customer = {
      ...lead.customer,
      ...customer,
    };
    lead.updatedAt = new Date();

    console.log("After:", lead.customer);

    return lead;
  }
  updateNotes(lead, notes) {
    if (!lead) {
      return null;
    }

    lead.notes = notes;

    lead.updatedAt = new Date();

    return lead;
  }

  updateType(lead, type) {
    if (!lead) {
      return null;
    }

    lead.type = type;

    lead.updatedAt = new Date();

    return lead;
  }

  assignSalesPerson(lead, assignedTo) {
    if (!lead) {
      return null;
    }

    lead.assignedTo = assignedTo;

    lead.status = "ASSIGNED";

    lead.updatedAt = new Date();

    return lead;
  }

  updateStatus(lead, status) {
    if (!lead) {
      return null;
    }

    lead.status = status;

    lead.updatedAt = new Date();

    return lead;
  }
  /*
   * ---------------------------------------------------------
   * Conversation Flow
   * ---------------------------------------------------------
   */

  getNextQuestion(lead) {
    console.log("Lead Customer:", lead.customer);
    const customer = lead.customer ?? {};

    if (!customer.name) {
      return {
        step: "ASK_NAME",

        field: "name",

        message: `${this.getLeadIntroduction(
          lead.type,
        )}\n\nMay I know your name?`,
      };
    }

    if (!customer.phone) {
      return {
        step: "ASK_PHONE",

        field: "phone",

        message: `Thank you ${customer.name}.\n\nMay I have your phone number?`,
      };
    }

    if (!customer.email) {
      return {
        step: "ASK_EMAIL",

        field: "email",

        message: "Great! Finally, could you please share your email address?",
      };
    }

    return {
      step: "LEAD_COMPLETED",

      field: null,

      message: null,
    };
  }
  /*
   * ---------------------------------------------------------
   * Validation Helpers
   * ---------------------------------------------------------
   */

  isEmailValid(email) {
    if (!email) {
      return false;
    }

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  }

  isPhoneValid(phone) {
    if (!phone) {
      return false;
    }

    return /^[+\d\s()-]{7,20}$/.test(phone.trim());
  }
  isNameValid(name) {
    if (!name) {
      return false;
    }

    const value = name.trim();

    if (value.length < 2) {
      return false;
    }

    if (/^\d+$/.test(value)) {
      return false;
    }

    if (/@/.test(value)) {
      return false;
    }

    return true;
  }

  isCompanyValid(company) {
    if (!company) {
      return false;
    }

    return company.trim().length >= 2;
  }
  /*
   * ---------------------------------------------------------
   * Completion Check
   * ---------------------------------------------------------
   */
  isCustomerComplete(lead) {
    const customer = lead.customer ?? {};

    return (
      this.isNameValid(customer.name) &&
      this.isPhoneValid(customer.phone) &&
      this.isEmailValid(customer.email)
    );
  }
}
