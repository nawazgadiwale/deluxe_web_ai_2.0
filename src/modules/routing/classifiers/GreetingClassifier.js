export default class GreetingClassifier {
  classify(state) {
    const message = (state.userMessage ?? "").trim().toLowerCase();

    if (!message) {
      return null;
    }

    const greetings = [
      "hi",
      "hello",
      "hey",
      "good morning",
      "good afternoon",
      "good evening",
      "greetings",
    ];

    const matched = greetings.some(
      (greeting) => message === greeting || message.startsWith(`${greeting} `),
    );

    if (!matched) {
      return null;
    }

    return {
      capability: "greeting",
      confidence: 1,
      source: "RULE",
    };
  }
}
