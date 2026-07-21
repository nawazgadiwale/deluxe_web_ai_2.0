import ProductResolver from "../../catalog/ProductResolver.js";

const resolver = new ProductResolver();

export default class ComparisonQueryBuilder {
  /*
   * =====================================================
   * Build Comparison Query
   * =====================================================
   */

  async build(state) {
    const originalQuestion = (state.userMessage ?? "").trim();

    /*
     * =====================================================
     * Products From UI Action
     * =====================================================
     */

    let products = state.action?.payload?.products ?? [];

    /*
     * =====================================================
     * Resolve Products From Message
     * =====================================================
     */

    if (products.length < 2) {
      const context = await resolver.resolveContext(originalQuestion, state);

      // console.log("Comparison Context");
      // console.dir(context, { depth: null });

      products = context.products ?? [];
    }

    /*
     * =====================================================
     * Recommendation Context
     * =====================================================
     */

    const recommendation = state.recommendationContext ?? {};

    /*
     * =====================================================
     * Return Query
     * =====================================================
     */

    return {
      originalQuestion,
      products,

      customerType: recommendation.customerType,

      businessType: recommendation.businessType,

      businessGoal: recommendation.businessGoal,

      customerRequirements: recommendation.requirements,
    };
  }
}
