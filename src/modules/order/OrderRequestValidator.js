// import CatalogService from "../catalog/CatalogService.js";

// const catalogService = new CatalogService();

// export default class OrderRequestValidator {
//   async validate(item) {
//     const errors = [];
//     const missingFields = [];

//     if (!item) {
//       return {
//         valid: false,
//         errors: ["No active order item."],
//       };
//     }

//     //
//     // Product must exist
//     //

//     if (!item.product) {
//       errors.push("Please select a product.");
//     }

//     let product = null;

//     if (item.product) {
//       product = await catalogService.findProductByName(item.product);

//       if (!product) {
//         errors.push("Selected product does not exist.");
//       }
//     }

//     //
//     // Category
//     //

//     if (product) {
//       item.mainCategory ??= product.metadata.mainCategory;
//       item.subCategory ??= product.metadata.subCategory;
//     }

//     if (!item.mainCategory) {
//       errors.push("Main category is required.");
//     }

//     /*
//      * =====================================================
//      * Quantity
//      * =====================================================
//      */

//     if (item.quantity == null || item.quantity === undefined || item.quantity === "") {
//       missingFields.push("quantity");
//       errors.push("Quantity is required.");
//     } else if (Number(item.quantity) <= 0) {
//       errors.push("Quantity must be greater than zero.");
//     }

//     /*
//      * =====================================================
//      * Delivery Date
//      * =====================================================
//      */

//     if (!item.deadline || item.deadline === undefined || item.deadline === "") {
//       missingFields.push("deadline");
//       errors.push("Delivery date is required.");
//     }
//     //
//     // Required fields from Catalog
//     //

//     const requiredFields = product?.metadata?.requiredFields ?? [];

//     for (const field of requiredFields) {
//   const value = item.specifications?.[field];

//   if (value === undefined || value === null || value === "") {
//     missingFields.push(field);
//     errors.push(`${field} is required.`);
//   }
// }

//     return {
//       valid: errors.length === 0,

//       errors,

//       missingFields,
//       nextField: missingFields.length > 0 ? missingFields[0] : null,

//       product,
//     };
//   }
// }

import CatalogService from "../catalog/CatalogService.js";

const catalogService = new CatalogService();

export default class OrderRequestValidator {
  async validate(item) {
    const validation = {
      valid: true,
      errors: [],
      missingFields: [],
      nextField: null,
      product: null,
    };

    if (!item) {
      validation.valid = false;
      validation.errors.push("No active order item.");

      return validation;
    }

    const product = await this.validateProduct(item, validation);

    this.validateQuantity(item, validation);

    this.validateDeadline(item, validation);

    this.validateSpecifications(item, product, validation);

    validation.valid = validation.errors.length === 0;

    validation.nextField = validation.missingFields[0] ?? null;

    validation.product = product;

    return validation;
  }

  /*
   * =====================================================
   * Product
   * =====================================================
   */

  async validateProduct(item, validation) {
    if (!item.product) {
      validation.errors.push("Please select a product.");
      return null;
    }

    const product = await catalogService.findProductByName(item.product);

    if (!product) {
      validation.errors.push("Selected product does not exist.");

      return null;
    }

    item.mainCategory ??= product.metadata.mainCategory;

    item.subCategory ??= product.metadata.subCategory;

    if (!item.mainCategory) {
      validation.errors.push("Main category is required.");
    }

    return product;
  }
  /*
   * =====================================================
   * Quantity
   * =====================================================
   */

  validateQuantity(item, validation) {
    if (this.isEmpty(item.quantity)) {
      validation.missingFields.push("quantity");
      validation.errors.push("Quantity is required.");
      return;
    }

    const quantity = Number(item.quantity);

    if (Number.isNaN(quantity) || quantity <= 0) {
      validation.errors.push("Quantity must be greater than zero.");
    }
  }

  /*
   * =====================================================
   * Deadline
   * =====================================================
   */

  validateDeadline(item, validation) {
    if (this.isEmpty(item.deadline)) {
      validation.missingFields.push("deadline");
      validation.errors.push("Delivery date is required.");
    }
  }

  /*
   * =====================================================
   * Catalog Specifications
   * =====================================================
   */

  validateSpecifications(item, product, validation) {
    if (!product) {
      return;
    }

    const requiredFields = product.metadata?.requiredFields ?? [];

    for (const field of requiredFields) {
      if (this.isEmpty(item.specifications?.[field])) {
        validation.missingFields.push(field);

        validation.errors.push(`${field} is required.`);
      }
    }
  }

  /*
   * =====================================================
   * Helpers
   * =====================================================
   */

  isEmpty(value) {
    return value === undefined || value === null || value === "";
  }
}
