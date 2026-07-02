import { ChatOllama } from "@langchain/ollama";
import BaseProvider from "./BaseProvider.js";

export default class OllamaProvider extends BaseProvider {
  createModel(options = {}) {
    return new ChatOllama({
      model: options.model ?? "phi3:mini",

      temperature: options.temperature ?? 0.1,

      topP: options.topP ?? 0.9,
    });
  }

  async invoke({ systemPrompt, userMessage, ...options }) {
    const model = this.createModel(options);

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
    const model = this.createModel(options);

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
    const model = this.createModel(options);

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
