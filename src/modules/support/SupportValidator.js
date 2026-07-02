export default class SupportValidator {
  validate(result = {}) {
    return {
      answer: result.answer ?? "",

      references: Array.isArray(result.references) ? result.references : [],

      followUpQuestion: result.followUpQuestion ?? "",
    };
  }
}
