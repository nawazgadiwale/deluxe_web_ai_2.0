import LLMService from "../../ai/llm/LLMService.js";

const llmService = new LLMService();

export default class LeadExtractor {
  async extract(state) {
    const message = (state.userMessage ?? "").trim();

    const step = state.currentStep ?? state.pendingAction ?? "ASK_NAME";

    switch (step) {
      /*
       * -------------------------------------------------------
       * Name
       * -------------------------------------------------------
       */

      case "ASK_NAME":
      case "name": {
        const schema = {
          type: "object",

          properties: {
            name: {
              type: "string",
            },
          },

          required: ["name"],
        };

        const systemPrompt = `
You are an information extraction engine.

Your ONLY task is extracting the PERSON'S NAME.

Rules

- Extract only the person's name.
- Ignore phone numbers.
- Ignore email addresses.
- Ignore company names.
- Ignore products.
- Ignore everything else.
- Never guess.
- Never infer.
- Return JSON only.

Examples

"Nawaz"

{
"name":"Nawaz"
}

"My name is Nawaz"

{
"name":"Nawaz"
}

"I am John Smith"

{
"name":"John Smith"
}

"8310412768"

{
"name":""
}

"john@gmail.com"

{
"name":""
}
`;

        const extracted = await llmService.invokeStructured({
          schema,
          systemPrompt,
          userMessage: message,
        });

        return {
          name: extracted.name?.trim() || null,
        };
      }

      /*
       * -------------------------------------------------------
       * Mobile
       * -------------------------------------------------------
       */

      case "ASK_MOBILE":
      case "mobile": {
        const match = message.match(/(\+?\d[\d\s()-]{6,19})/);

        return {
          mobile: match ? match[1].trim() : null,
        };
      }

      /*
       * -------------------------------------------------------
       * Email
       * -------------------------------------------------------
       */

      case "ASK_EMAIL":
      case "email": {
        const match = message.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);

        return {
          email: match ? match[0].trim() : null,
        };
      }

      /*
       * -------------------------------------------------------
       * Company
       * -------------------------------------------------------
       */

      case "ASK_COMPANY":
      case "company": {
        const schema = {
          type: "object",

          properties: {
            company: {
              type: "string",
            },
          },

          required: ["company"],
        };

        const systemPrompt = `
Extract ONLY the company name.

Never guess.

Never infer.

Ignore names.

Ignore phone numbers.

Ignore emails.

Return JSON only.

Example

"I work at Microsoft"

{
"company":"Microsoft"
}
`;

        const extracted = await llmService.invokeStructured({
          schema,
          systemPrompt,
          userMessage: message,
        });

        return {
          company: extracted.company?.trim() || null,
        };
      }

      /*
       * -------------------------------------------------------
       * Default
       * -------------------------------------------------------
       */

      default:
        return {};
    }
  }
}
