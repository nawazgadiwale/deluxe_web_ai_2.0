import CatalogService from "../catalog/CatalogService.js";

const catalogService = new CatalogService();

export default class OrderValidator {
  /*
   * =====================================================
   * Validate Complete Order
   * =====================================================
   */

  async validate(order) {
    const validation = {
      valid: true,
      items: [],
      customer: null,
      errors: [],
    };

    if (!order?.items?.length) {
      validation.valid = false;
      validation.errors.push("Order does not contain any products.");
      return validation;
    }

    for (const item of order.items) {
      const result = await this.validateItem(item);

      validation.items.push(result);

      if (!result.valid) {
        validation.valid = false;
      }
    }

    validation.customer = this.validateCustomer(order.customer);

    if (!validation.customer.valid) {
      validation.valid = false;
    }

    return validation;
  }

  /*
   * =====================================================
   * Validate Customer
   * =====================================================
   */

  validateCustomer(customer = {}) {
    const validation = {
      valid: true,
      missingFields: [],
    };

    if (!customer.name?.trim()) {
      validation.missingFields.push("name");
    }

    if (!customer.phone?.trim()) {
      validation.missingFields.push("phone");
    }

    if (!customer.email?.trim()) {
      validation.missingFields.push("email");
    }

    validation.valid = validation.missingFields.length === 0;

    return validation;
  }

  /*
   * =====================================================
   * Validate Product
   * =====================================================
   */

  async validateItem(item) {
    const validation = {
      product: item.product,
      mainCategory: item.mainCategory ?? null,
      subCategory: item.subCategory ?? null,
      valid: true,
      missingFields: [],
      errors: [],
    };

    const product = await catalogService.findProductByName(item.product);

    if (!product) {
      validation.valid = false;
      validation.errors.push("Product not found.");
      return validation;
    }

    item.mainCategory ??= product.metadata?.mainCategory ?? null;
    item.subCategory ??= product.metadata?.subCategory ?? null;

    validation.mainCategory = item.mainCategory;
    validation.subCategory = item.subCategory;

    /*
     * =====================================================
     * Quantity
     * =====================================================
     */

    if (
      item.quantity == null ||
      Number.isNaN(Number(item.quantity)) ||
      Number(item.quantity) <= 0
    ) {
      validation.missingFields.push("quantity");
    }

    /*
     * =====================================================
     * Artwork
     * =====================================================
     */

    const artworkOptions = ["READY", "PENDING", "NEED_DESIGN"];

    if (!artworkOptions.includes(item.artworkStatus)) {
      validation.missingFields.push("artworkStatus");
    }

    /*
     * =====================================================
     * Design Requirements
     * =====================================================
     */

    if (
      item.artworkStatus === "NEED_DESIGN" &&
      !item.designRequirements?.trim()
    ) {
      validation.missingFields.push("designRequirements");
    }

    /*
     * =====================================================
     * Deadline
     * =====================================================
     */

    if (!item.deadline) {
      validation.missingFields.push("deadline");
    }

    /*
     * =====================================================
     * Dynamic Specifications
     * =====================================================
     */

    const fields =
      product.metadata?.requiredFields ??
      product.metadata?.specifications ??
      [];

    for (const specification of fields) {
      const field =
        typeof specification === "string"
          ? {
              name: specification,
              type: "text",
              required: true,
            }
          : specification;

      if (field.required === false) {
        continue;
      }

      const value = item.specifications?.[field.name];

      switch (field.type) {
        case "boolean":
        case "checkbox": {
          if (value === undefined || value === null) {
            validation.missingFields.push(field.name);
          }
          break;
        }

        case "number": {
          if (value === undefined || value === null || value === "") {
            validation.missingFields.push(field.name);
            break;
          }

          const number = Number(value);

          if (Number.isNaN(number)) {
            validation.errors.push(`${field.name} must be a valid number.`);
            break;
          }

          if (field.min != null && number < field.min) {
            validation.errors.push(
              `${field.name} must be at least ${field.min}.`,
            );
          }

          if (field.max != null && number > field.max) {
            validation.errors.push(`${field.name} cannot exceed ${field.max}.`);
          }

          break;
        }

        case "multiselect": {
          if (!Array.isArray(value) || value.length === 0) {
            validation.missingFields.push(field.name);
          }
          break;
        }

        default: {
          if (value === undefined || value === null || value === "") {
            validation.missingFields.push(field.name);
          }
        }
      }
    }

    /*
     * =====================================================
     * Complete
     * =====================================================
     */

    validation.valid =
      validation.missingFields.length === 0 && validation.errors.length === 0;

    return validation;
  }
}
