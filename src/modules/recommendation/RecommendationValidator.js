import CatalogService from "../catalog/CatalogService.js";

const catalogService = new CatalogService();

export default class RecommendationValidator {
  async validate(llmResponse, catalogMatches = []) {
    /*
     * =====================================================
     * Safe Defaults
     * =====================================================
     */

    llmResponse ??= {};

    /*
     * =====================================================
     * LLM Reasons + Priority
     * =====================================================
     */

    const explanations = new Map();

    for (const item of llmResponse.reasons ?? []) {
      if (!item?.product) continue;

      explanations.set(item.product.toLowerCase(), {
        reason: item.reason,
        priority: Number(item.priority ?? 999),
      });
    }

    /*
     * =====================================================
     * Remove Duplicate Products
     * =====================================================
     */

    const uniqueProducts = new Map();

    for (const match of catalogMatches) {
      const product = match.metadata?.product;

      if (!product) continue;

      const key = product.toLowerCase();

      if (!uniqueProducts.has(key)) {
        uniqueProducts.set(key, match);
      }
    }

    /*
     * =====================================================
     * Build Final Products
     * Catalog remains the Source of Truth
     * =====================================================
     */

    const products = [];

    for (const match of uniqueProducts.values()) {
      const metadata = match.metadata ?? {};

      const productName = metadata.product;

      if (!productName) continue;

      let catalogProduct = match;

      // Fallback only if retrieved document is incomplete
      if (!metadata.mainCategory || !metadata.subCategory || !match.content) {
        catalogProduct =
          (await catalogService.findProductByName(productName)) ?? match;
      }

      const explanation = explanations.get(productName.toLowerCase()) ?? {};

      products.push({
        product: catalogProduct.metadata.product,

        mainCategory: catalogProduct.metadata.mainCategory,

        subCategory: catalogProduct.metadata.subCategory,

        description: catalogProduct.content,

        reason:
          explanation.reason ??
          catalogProduct.content ??
          catalogProduct.metadata.description ??
          "Suitable for the customer's business requirements.",

        priority: explanation.priority ?? 999,

        confidence: 1,

        actions: [
          {
            id: "SHOW_PRODUCT_DETAILS",

            label: "Show More",

            value: "SHOW_PRODUCT_DETAILS",

            payload: {
              product: catalogProduct.metadata.product,
            },
          },

          {
            id: "ORDER_PRODUCT",

            label: "Order",

            value: "ORDER_PRODUCT",

            payload: {
              product: catalogProduct.metadata.product,
            },
          },
        ],
      });
    }

    /*
     * =====================================================
     * Sort by LLM Priority
     * =====================================================
     */

    products.sort((a, b) => a.priority - b.priority);

    /*
     * =====================================================
     * Remove Internal Priority
     * =====================================================
     */

    const finalProducts = products.map(({ priority, ...product }) => product);

    /*
     * =====================================================
     * Recommendation Response
     * =====================================================
     */

    return {
      summary:
        llmResponse.summary ??
        "Here are the most relevant products for your business.",

      followUpQuestion:
        llmResponse.followUpQuestion ??
        "Would you like to know more about any of these products?",

      products: finalProducts,
    };
  }
}
