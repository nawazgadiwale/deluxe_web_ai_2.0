export default class RecommendationValidator {
  async validate({ llm = {}, products = [] }) {
    /*
     * =====================================================
     * Build LLM Reason Map
     * =====================================================
     */

    const reasonMap = new Map();

    for (const item of llm.reasons ?? []) {
      if (!item?.product) continue;

      reasonMap.set(item.product.trim().toLowerCase(), item.reason);
    }

    /*
     * =====================================================
     * Build Response Products
     * =====================================================
     */

    const responseProducts = products.map((item) => {
      const metadata = item.metadata ?? {};

      const productName = metadata.product ?? "";

      const summary =
        metadata.shortDescription ??
        metadata.description ??
        (item.pageContent ?? item.content ?? "")
          .replace(/\s+/g, " ")
          .trim()
          .slice(0, 180);

      return {
        product: productName,

        summary,

        reason:
          reasonMap.get(productName.trim().toLowerCase()) ??
          this.buildCatalogReason(metadata),

        relatedProducts: metadata.relatedProducts ?? [],

        frequentlyBoughtWith: metadata.frequentlyBoughtWith ?? [],

        score: metadata.finalScore ?? metadata.hybridScore ?? metadata.score,

        retrievalMethods: metadata.retrievalMethods ?? [],

        actions: [
          {
            id: "SHOW_PRODUCT_DETAILS",

            label: "View details",

            payload: {
              product: productName,

              mainCategory: metadata.mainCategory,

              subCategory: metadata.subCategory,
            },
          },
        ],
      };
    });

    /*
     * =====================================================
     * Final Response
     * =====================================================
     */

    return {
      type: "recommendation",

      summary:
        llm.summary ??
        "Here are the products that best match your requirements.",

      followUpQuestion:
        llm.followUpQuestion ??
        "Would you like more details about any product?",

      products: responseProducts,
    };
  }

  /*
   * =====================================================
   * Catalog Fallback Reason
   * =====================================================
   */

  buildCatalogReason(metadata = {}) {
    const business = metadata.businessTypes?.slice(0, 2).join(", ");

    const goal = metadata.customerGoals?.slice(0, 2).join(", ");

    const useCase = metadata.useCases?.slice(0, 2).join(", ");

    const industries = metadata.industries?.slice(0, 2).join(", ");

    if (business && goal) {
      return `Ideal for ${business} businesses looking to ${goal.toLowerCase()}.`;
    }

    if (industries && goal) {
      return `Recommended for ${industries} businesses focused on ${goal.toLowerCase()}.`;
    }

    if (goal) {
      return `Helps achieve ${goal.toLowerCase()}.`;
    }

    if (useCase) {
      return `Best suited for ${useCase.toLowerCase()}.`;
    }

    return "Recommended based on your requirements.";
  }
}
