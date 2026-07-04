// import RecommendationEngine from "./RecommendationEngine.js";
// import RecommendationValidator from "./RecommendationValidator.js";
// import CatalogService from "../catalog/CatalogService.js";

// const catalogService = new CatalogService();

// const engine = new RecommendationEngine();
// const validator = new RecommendationValidator();

// export default class RecommendationService {
//   async generate(state) {
//     //   Decide Mode

//     // RecommendationService

//     const product = await catalogService.findProductByName(state.userMessage);

//     const mode =
//       state.capability === "product_details" || product
//         ? "PRODUCT_DETAILS"
//         : "RECOMMENDATION";

//     //   Generate Recommendation

//     const result = await engine.generate(state, mode);

//     //  Validate

//     const recommendation = await validator.validate(
//       result.llm,
//       result.catalogMatches,
//       mode,
//     );

//     return {
//       context: result.context,
//       documents: result.documents,
//       catalogMatches: result.catalogMatches,
//       recommendation,
//     };
//   }
// }

//  updated clean and without duplicated taks


import RecommendationEngine from "./RecommendationEngine.js";
import RecommendationValidator from "./RecommendationValidator.js";

const engine = new RecommendationEngine();
const validator = new RecommendationValidator();

export default class RecommendationService {
  async generate(state) {
    /*
     * =====================================================
     * Engine decides everything
     * =====================================================
     */

    const result = await engine.generate(state);

    /*
     * =====================================================
     * Validate
     * =====================================================
     */

    const recommendation = await validator.validate({
      llm: result.llm,
      products: result.catalogMatches,
      mode: result.mode,
    });

    return {
      mode: result.mode,
      context: result.context,
      documents: result.documents,
      recommendation,
    };
  }
}
