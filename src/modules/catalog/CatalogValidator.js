import ValidationError from "../../core/errors/ValidationError.js";
import CatalogService from "./CatalogService.js";

const catalogService = new CatalogService();

export default class CatalogValidator {
  async validateProductSelection(data) {
    const product =
    await catalogService.findProductByName(data.product);

    if (!product) {
      throw new ValidationError("Selected product does not exist");
    }

    return product;
  }

  async validateSpecifications(product, selectedOptions) {
    const required = product.requiredFields || [];

    const missing = required.filter((field) => !selectedOptions[field]);

    if (missing.length) {
      throw new ValidationError(`Missing fields: ${missing.join(", ")}`);
    }

    return true;
  }

  async validateOrder(order) {
    const product = await this.validateProductSelection(order);

    await this.validateSpecifications(product, order.options);

    return {
      ...order,

      productDetails: product,
    };
  }
}
