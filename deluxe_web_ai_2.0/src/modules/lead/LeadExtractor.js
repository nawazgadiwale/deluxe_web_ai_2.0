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
        // Never invoke the LLM on empty input
        if (!message) {
          return {
            name: null,
          };
        }

        // Reject obvious non-name inputs
        if (/^\d+$/.test(message)) {
          return {
            name: null,
          };
        }

        if (message.includes("@")) {
          return {
            name: null,
          };
        }

        // Direct replies like:
        // Nawaz
        // John Smith
        if (/^[A-Za-z\s.'-]{2,60}$/.test(message)) {
          return {
            name: message.trim(),
          };
        }

        // Only use the LLM when really necessary
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

Extract ONLY the person's name.

Rules:

- If no person's name exists, return:
{
  "name":""
}

- Never guess.
- Never infer.
- Never copy examples.
- Never invent a name.
- Ignore phone numbers.
- Ignore email addresses.
- Ignore company names.
- Ignore products.
- Return JSON only.

Examples

Input:
"My name is Alice"

Output:
{
  "name":"Alice"
}

Input:
"I am John Smith"

Output:
{
  "name":"John Smith"
}

Input:
"8310412768"

Output:
{
  "name":""
}

Input:
""

Output:
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
          name: extracted?.name?.trim() || null,
        };
      }

      /*
       * -------------------------------------------------------
       * Mobile
       * -------------------------------------------------------
       */

      case "ASK_PHONE":
      case "phone": {
        const match = message.match(/(\+?\d[\d\s()-]{6,19})/);

        return {
          phone: match ? match[1].trim() : null,
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
        if (!message) {
          return {
            company: null,
          };
        }

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

If no company is mentioned return:

{
  "company":""
}

Never guess.
Never infer.
Return JSON only.
`;

        const extracted = await llmService.invokeStructured({
          schema,
          systemPrompt,
          userMessage: message,
        });

        return {
          company: extracted?.company?.trim() || null,
        };
      }

      default:
        return {};
    }
  }
}
