import crypto from "node:crypto";

export default class LeadManager {
  createLead() {
    return {
      leadId: crypto.randomUUID(),

      type: null,

      status: "DRAFT",

      customer: {
        name: null,
        mobile: null,
        email: null,
        company: null,
      },

      notes: null,

      assignedTo: null,

      createdAt: new Date(),

      updatedAt: new Date(),
    };
  }

  updateCustomer(lead, customer = {}) {
    if (!lead) {
      lead = this.createLead();
    }

    lead.customer = {
      ...lead.customer,
      ...customer,
    };

    lead.updatedAt = new Date();

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
    const customer = lead.customer ?? {};

    if (!customer.name) {
      return {
        step: "ASK_NAME",

        field: "name",

        message:
          "I'd be happy to connect you with one of our printing experts.\n\nMay I know your name?",
      };
    }

    if (!customer.mobile) {
      return {
        step: "ASK_MOBILE",

        field: "mobile",

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

  isMobileValid(mobile) {
    if (!mobile) {
      return false;
    }

    return /^[+\d\s()-]{7,20}$/.test(mobile.trim());
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
      this.isMobileValid(customer.mobile) &&
      this.isEmailValid(customer.email)
    );
  }
}
