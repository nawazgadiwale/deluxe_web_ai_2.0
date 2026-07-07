import { ChatGroq } from "@langchain/groq";
import BaseProvider from "./BaseProvider.js";

export default class GroqProvider extends BaseProvider {
  constructor() {
    super();
    this.models = new Map();
  }

  getModel(options = {}) {
    const config = {
      apiKey: process.env.GROQ_API_KEY,

      model: options.model ?? process.env.GROQ_MODEL ?? "qwen/qwen3-32b",

      temperature: options.temperature ?? 0,

      maxTokens: options.maxTokens ?? 350,

      topP: options.topP ?? 0.8,
    };

    const key = JSON.stringify(config);

    if (!this.models.has(key)) {
      this.models.set(key, new ChatGroq(config));
    }

    return this.models.get(key);
  }

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

    return response.content;
  }

  async invokeStructured({ schema, systemPrompt, userMessage, ...options }) {
    const model = this.getModel(options);

    const structuredModel = model.withStructuredOutput(schema);

    return structuredModel.invoke([
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
