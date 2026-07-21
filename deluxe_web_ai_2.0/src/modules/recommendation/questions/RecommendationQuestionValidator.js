export default class RecommendationQuestionValidator {
  validate(result = {}) {
    /*
     * =====================================================
     * Invalid Result
     * =====================================================
     */

    if (!result || typeof result !== "object") {
      return {
        ready: false,
        response: null,
      };
    }

    /*
     * =====================================================
     * Question Required
     * =====================================================
     */

    if (result.ready === false) {
      return {
        ready: false,
        response: result.response ?? null,
      };
    }

    /*
     * =====================================================
     * Recommendation Can Continue
     * =====================================================
     */

    return {
      ready: true,
      response: null,
    };
  }
}
