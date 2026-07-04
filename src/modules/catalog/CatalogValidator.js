import ValidationError from "../../core/errors/ValidationError.js";
import CatalogService from "./CatalogService.js";

const catalogService = new CatalogService();

export default class CatalogValidator {
  /*
   * =====================================================
   * Product Validation
   * =====================================================
   */

  async validateProductSelection(selection) {
    const product = await catalogService.findProductByName(selection?.product);

    if (!product) {
      throw new ValidationError("Selected product does not exist.");
    }

    return product;
  }

  /*
   * =====================================================
   * Specifications Validation
   * =====================================================
   */

  validateSpecifications(product, specifications = {}) {
    const requiredFields = product.metadata?.requiredFields ?? [];

    const missingFields = requiredFields.filter((field) => {
      const value = specifications[field];

      return value === undefined || value === null || value === "";
    });

    if (missingFields.length) {
      throw new ValidationError(
        `Missing required fields: ${missingFields.join(", ")}`,
      );
    }

    return true;
  }

  /*
   * =====================================================
   * Order Validation
   * =====================================================
   */

  async validateOrder(order) {
    const product = await this.validateProductSelection(order);

    this.validateSpecifications(product, order.specifications ?? {});

    return {
      ...order,

      product,
    };
  }
}
