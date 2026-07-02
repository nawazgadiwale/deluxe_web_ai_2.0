import CatalogService from "../catalog/CatalogService.js";

const catalogService = new CatalogService();

export default class OrderRequestValidator {
  async validate(item) {
    const errors = [];

    if (!item) {
      return {
        valid: false,
        errors: ["No active order item."],
      };
    }

    //
    // Product must exist
    //

    if (!item.product) {
      errors.push("Please select a product.");
    }

    let product = null;

    if (item.product) {
      product = await catalogService.findProductByName(item.product);

      if (!product) {
        errors.push("Selected product does not exist.");
      }
    }

    //
    // Category
    //

    if (product) {
      item.mainCategory ??= product.metadata.mainCategory;
      item.subCategory ??= product.metadata.subCategory;
    }

    if (!item.mainCategory) {
      errors.push("Main category is required.");
    }

    //
    // Quantity
    //

    if (
      item.quantity !== null &&
      item.quantity !== undefined &&
      Number(item.quantity) <= 0
    ) {
      errors.push("Quantity must be greater than zero.");
    }

    //
    // Required fields from Catalog
    //

    const requiredFields = product?.metadata?.requiredFields ?? [];

    const missingFields = [];

    for (const field of requiredFields) {
      const value = item.specifications?.[field];

      if (value === undefined || value === null || value === "") {
        missingFields.push(field);
      }
    }

    missingFields.forEach((field) => errors.push(`${field} is required.`));

    return {
      valid: errors.length === 0,

      errors,

      missingFields,

      product,
    };
  }
}
