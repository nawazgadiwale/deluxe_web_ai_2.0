import CatalogService from "../catalog/CatalogService.js";

const catalogService = new CatalogService();

export default class OrderExtractor {
  async extract(state) {
    const extractedOrder = {
      product: null,
      mainCategory: null,
      subCategory: null,
      quantity: null,
      specifications: {},
      artwork: null,
      deadline: null,
      remarks: null,
    };

    const message = (state.userMessage ?? "").trim();

    /*
     * =====================================================
     * 1. Check current recommendations first
     * =====================================================
     */

    const recommendations = state.recommendation?.products ?? [];

    const recommendation = recommendations.find((item) =>
      message.toLowerCase().includes(item.product.toLowerCase()),
    );

    if (recommendation) {
      extractedOrder.product = recommendation.product;
      extractedOrder.mainCategory = recommendation.mainCategory;
      extractedOrder.subCategory = recommendation.subCategory;
    }

    /*
     * =====================================================
     * 2. Search entire catalog using Fuse
     * =====================================================
     */

    if (!extractedOrder.product) {
      const matches = await catalogService.searchProducts(message, 1);

      if (matches.length) {
        const product = matches[0];

        extractedOrder.product = product.metadata.product;
        extractedOrder.mainCategory = product.metadata.mainCategory;
        extractedOrder.subCategory = product.metadata.subCategory;
      }
    }

    /*
     * =====================================================
     * 3. Quantity
     * =====================================================
     */

    const quantity = message.match(/\b\d+\b/);

    if (quantity) {
      extractedOrder.quantity = Number(quantity[0]);
    }

    return extractedOrder;
  }
}
