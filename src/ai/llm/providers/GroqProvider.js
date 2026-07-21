import { ChatGroq } from "@langchain/groq";
import { jsonrepair } from "jsonrepair";

import BaseProvider from "./BaseProvider.js";

export default class GroqProvider extends BaseProvider {
  constructor() {
    super();
    this.models = new Map();
  }

  getModel(options = {}) {
    const config = {
      apiKey: process.env.GROQ_API_KEY,

      // apiKey: process.env.LLAMA_API_KEY,

      model: options.model ?? process.env.GROQ_MODEL ?? "llama-3.1-8b-instant",

      // model: // options.model ?? process.env.LLAMA_MODEL ?? "llama-3.3-70b-versatile",

      temperature: options.temperature ?? 0,

      maxTokens: options.maxTokens ?? 600,

      topP: options.topP ?? 0.8,
    };

    const key = JSON.stringify(config);

    if (!this.models.has(key)) {
      this.models.set(key, new ChatGroq(config));
    }

    console.log("================================");
    console.log("Using Model:", config.model);
    console.log("================================");
    return this.models.get(key);
  }

  /*
   * =====================================================
   * Normal Text
   * =====================================================
   */

  async invoke({ systemPrompt, userMessage, ...options }) {
    const model = this.getModel(options);

    const response = await model.invoke([
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: userMessage,
      },
    ]);

    return this.sanitizeResponse(response.content);
  }

  /*
   * =====================================================
   * Structured Output (JSON Mode)
   * =====================================================
   */

  async invokeStructured({ schema, systemPrompt, userMessage, ...options }) {
    const model = this.getModel(options);

    const schemaPrompt = `

Return ONLY valid JSON.

The JSON MUST strictly follow this JSON Schema.

${JSON.stringify(schema, null, 2)}

Rules

- Return JSON only.
- Do not use markdown.
- Do not use code fences.
- Do not explain anything.
- Do not output any text before or after the JSON.
`;

    const response = await model.invoke([
      {
        role: "system",
        content: `${systemPrompt}\n${schemaPrompt}`,
      },
      {
        role: "user",
        content: userMessage,
      },
    ]);

    let text = response.content;

    if (Array.isArray(text)) {
      text = text.map((part) => part.text ?? "").join("");
    }

    text = String(text);

    /*
     * =====================================================
     * Remove Markdown
     * =====================================================
     */

    text = text
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    /*
     * =====================================================
     * Remove Think Tags
     * =====================================================
     */

    text = text.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();

    /*
     * =====================================================
     * Extract JSON
     * =====================================================
     */

    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");

    if (start === -1 || end === -1) {
      throw new Error(`Groq returned invalid JSON.\n\n${text}`);
    }

    let json = text.slice(start, end + 1);

    /*
     * =====================================================
     * Repair JSON
     * =====================================================
     */

    try {
      json = jsonrepair(json);
    } catch (err) {
      console.error("JSON Repair Error");
      console.error(json);

      throw err;
    }

    /*
     * =====================================================
     * Parse
     * =====================================================
     */

    return JSON.parse(json);
  }

  /*
   * =====================================================
   * Streaming
   * =====================================================
   */

  async stream({ systemPrompt, userMessage, ...options }) {
    const model = this.getModel(options);

    return model.stream([
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: userMessage,
      },
    ]);
  }
}
