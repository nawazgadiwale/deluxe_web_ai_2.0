import RecommendationEngine from "./RecommendationEngine.js";
import RecommendationValidator from "./RecommendationValidator.js";

const engine = new RecommendationEngine();
const validator = new RecommendationValidator();

export default class RecommendationService {
  async generate(state) {
    const result = await engine.generate(state);

    // console.log("ENGINE");
    // console.dir(result, { depth: null });

    const recommendation = await validator.validate({
      llm: result.llm,
      products: result.catalogMatches,
    });

    // console.log("VALIDATOR");
    // console.dir(recommendation, { depth: null });

    return {
      recommendation,
      context: result.context ?? "",
      documents: result.documents ?? [],
    };
  }
}
