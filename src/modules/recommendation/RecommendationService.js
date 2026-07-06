import RecommendationEngine from "./RecommendationEngine.js";
import RecommendationValidator from "./RecommendationValidator.js";

const engine = new RecommendationEngine();
const validator = new RecommendationValidator();

export default class RecommendationService {
  async generate(state) {
    /*
     * =====================================================
     * Generate Recommendation
     * =====================================================
     */

    const result = await engine.generate(state);

    /*
     * =====================================================
     * Validate Recommendation
     * =====================================================
     */

    const recommendation = await validator.validate({
      llm: result.llm,
      products: result.catalogMatches,
      mode: result.mode,
    });

    /*
     * =====================================================
     * Return
     * =====================================================
     */

    return {
      mode: result.mode,
      context: result.context,
      documents: result.documents,
      recommendation,
    };
  }
}
