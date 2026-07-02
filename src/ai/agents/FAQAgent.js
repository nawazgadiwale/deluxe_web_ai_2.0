import BaseAgent from "./BaseAgent.js";

import ResponseBuilder from "../../core/responses/Apiresponse.js";
import FAQService from "../../modules/support/SupportService.js";

const responseBuilder =
  new ResponseBuilder();

const faqService =
  new FAQService();

export default class FAQAgent extends BaseAgent {
  async execute(state) {
    const result =
      await faqService.generate(state);

    state.rag = {
      context: result.context,
      documents: result.documents,
    };

    state.response =
      responseBuilder.faq(
        result.answer,
      );

    return state;
  }
}