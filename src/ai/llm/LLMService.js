import OllamaProvider from "./providers/OllamaProvider.js";

const provider = new OllamaProvider();

export default class LLMService {
  async invoke(options) {
    return provider.invoke(options);
  }

  async invokeStructured(options) {
    return provider.invokeStructured(options);
  }

  async stream(options) {
    return provider.stream(options);
  }
  
}
