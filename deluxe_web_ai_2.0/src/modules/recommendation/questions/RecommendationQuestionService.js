import RecommendationQuestionEngine from "./RecommendationQuestionEngine.js";
import RecommendationQuestionValidator from "./RecommendationQuestionValidator.js";

const engine = new RecommendationQuestionEngine();
const validator = new RecommendationQuestionValidator();

export default class RecommendationQuestionService {
  async execute(state) {
    const result = await engine.execute(state);
    return validator.validate(result);
  }
}
