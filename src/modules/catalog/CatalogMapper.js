import CatalogService from "./CatalogService.js";

const catalogService = new CatalogService();

export default class CatalogMapper {
  /*
   * =====================================================
   * Product Details
   * =====================================================
   */

  async findProduct(text) {
    return catalogService.findProductByName(text);
  }

  /*
   * =====================================================
   * Recommendations
   * =====================================================
   */

  async searchProducts(text, limit = 5) {
    const products = await catalogService.searchProducts(text, limit);

    return products.map((product) => ({
      product: product.metadata.product,

      mainCategory: product.metadata.mainCategory,

      subCategory: product.metadata.subCategory,

      description: product.content,

      metadata: product.metadata,
    }));
  }

  /*
   * =====================================================
   * Resolve User Selection
   * =====================================================
   */

  async resolveSelection(selection) {
    if (!selection?.product) {
      return null;
    }

    return catalogService.findProductByName(selection.product);
  }
}
