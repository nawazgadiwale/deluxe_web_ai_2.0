import BaseAgent from "./BaseAgent.js";

import ResponseBuilder from "../../core/responses/Apiresponse.js";
import LeadService from "../../modules/lead/LeadService.js";

const responseBuilder = new ResponseBuilder();
const leadService = new LeadService();

export default class LeadAgent extends BaseAgent {
  async execute(state) {
    console.log("LeadAgent Executed");

    const result = await leadService.process(state);
    state.leadRequest = result.leadRequest;

    state.workflow = "LEAD";

    state.currentStep = result.currentStep ?? result.response?.step ?? null;

    state.awaitingDecision = result.awaitingDecision ?? false;

    if (result.status === "COMPLETED") {
      state.workflow = null;
      state.currentStep = null;
    }

    if (state.leadRequest?.customer) {
      state.customer = {
        ...(state.customer ?? {}),
        ...state.leadRequest.customer,
      };
    }

    state.persistence.leadRequest.dirty = true;
    state.persistence.leadRequest.updatedAt = new Date();

    state.persistence.customer.dirty = true;
    state.persistence.customer.updatedAt = new Date();

    state.persistence.conversation.dirty = true;
    state.persistence.conversation.updatedAt = new Date();

    state.response = responseBuilder.contact(result.response);

    return state;
  }
}
