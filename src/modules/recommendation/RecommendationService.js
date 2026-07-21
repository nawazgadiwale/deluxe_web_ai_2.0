import RecommendationEngine from "./RecommendationEngine.js";
import RecommendationValidator from "./RecommendationValidator.js";

const engine = new RecommendationEngine();
const validator = new RecommendationValidator();

export default class RecommendationService {
  async execute(state) {
    const conversation = engine.isConversation(state);

    const result = await engine.execute(state);

    if (conversation) {
      return {
        type: "conversation",

        recommendation: {
          summary: result.llm.summary,
          products: state.recommendationContext.catalogProducts ?? [],
          followUpQuestion: result.llm.followUpQuestion,
          reasons: [],
        },

        catalogProducts: result.catalogMatches ?? [],

        context: result.context ?? "",
        documents: result.documents ?? [],
      };
    }

    const recommendation = await validator.validate({
      llm: result.llm,
      products: result.catalogMatches,
    });

    return {
      type: "recommendation",

      recommendation,

      catalogProducts: result.catalogMatches ?? [],

      context: result.context ?? "",
      documents: result.documents ?? [],
    };
  }

  async generate(state) {
    return this.execute(state);
  }
}
