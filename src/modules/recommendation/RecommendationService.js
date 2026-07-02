import RecommendationEngine from "./RecommendationEngine.js";
import RecommendationValidator from "./RecommendationValidator.js";

const engine = new RecommendationEngine();
const validator = new RecommendationValidator();

export default class RecommendationService {
  async generate(state) {
    /*
     * =====================================================
     * Retrieve Products + Generate Explanations
     * =====================================================
     */

    const result = await engine.generate(state);

    /*
     * =====================================================
     * Build Final Recommendation
     * Catalog remains the source of truth.
     * =====================================================
     */

    const recommendation = await validator.validate(
      result.llm,
      result.catalogMatches,
    );

    /*
     * =====================================================
     * Return
     * =====================================================
     */

    return {
      context: result.context,

      documents: result.documents,

      catalogMatches: result.catalogMatches,

      recommendation,
    };
  }
}
