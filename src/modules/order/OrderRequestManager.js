// import crypto from "node:crypto";

// export default class OrderRequestManager {
//   createOrderRequest() {
//     return {
//       orderId: crypto.randomUUID(),

//       status: "DRAFT",

//       customer: {
//         name: null,
//         mobile: null,
//         email: null,
//       },

//       assignedTo: null,

//       items: [],

//       createdAt: new Date(),

//       updatedAt: new Date(),
//     };
//   }

//   createActiveItem(extractedOrder = {}) {
//     return {
//       itemId: crypto.randomUUID(),

//       mainCategory: extractedOrder.mainCategory ?? null,

//       subCategory: extractedOrder.subCategory ?? null,

//       product: extractedOrder.product ?? null,

//       quantity: extractedOrder.quantity ?? null,

//       specifications: extractedOrder.specifications ?? {},

//       artwork: extractedOrder.artwork ?? null,

//       deadline: extractedOrder.deadline ?? null,

//       remarks: extractedOrder.remarks ?? null,

//       salesperson: extractedOrder.salesperson ?? null,

//       status: "COLLECTING",
//     };
//   }

//   mergeActiveItem(activeItem, extractedOrder = {}) {
//     activeItem = this.normalizeItem(activeItem);

//     if (!activeItem) {
//       return this.createActiveItem(extractedOrder);
//     }

//     return {
//       ...activeItem,

//       mainCategory: extractedOrder.mainCategory ?? activeItem.mainCategory,

//       subCategory: extractedOrder.subCategory ?? activeItem.subCategory,

//       product: extractedOrder.product ?? activeItem.product,

//       quantity: extractedOrder.quantity ?? activeItem.quantity,

//       specifications: {
//         ...activeItem.specifications,
//         ...(extractedOrder.specifications ?? {}),
//       },

//       artwork: extractedOrder.artwork ?? activeItem.artwork,

//       deadline: extractedOrder.deadline ?? activeItem.deadline,

//       remarks: extractedOrder.remarks ?? activeItem.remarks,

//       salesperson: extractedOrder.salesperson ?? activeItem.salesperson,
//     };
//   }

//   /*
//    * =====================================================
//    * Item Helpers
//    * =====================================================
//    */

//   findItem(orderRequest, product) {
//     if (!orderRequest || !product) {
//       return null;
//     }

//     return orderRequest.items.find(
//       (item) => item.product?.toLowerCase() === product.toLowerCase(),
//     );
//   }

//   hasProduct(orderRequest, product) {
//     return !!this.findItem(orderRequest, product);
//   }

//   addItem(orderRequest, item) {
//     if (!item) {
//       return orderRequest;
//     }

//     if (!orderRequest) {
//       orderRequest = this.createOrderRequest();
//     }

//     orderRequest.items.push(item);

//     orderRequest.updatedAt = new Date();

//     return orderRequest;
//   }

//   /*
//    * =====================================================
//    * Enterprise Add Item
//    * Prevent duplicate products
//    * Merge quantity/specifications
//    * =====================================================
//    */

//   addOrUpdateItem(orderRequest, item) {
//     if (!item) {
//       return orderRequest;
//     }

//     if (!orderRequest) {
//       orderRequest = this.createOrderRequest();
//     }

//     const existing = this.findItem(orderRequest, item.product);

//     if (existing) {
//       if (item.quantity != null) {
//         existing.quantity =
//           existing.quantity == null
//             ? item.quantity
//             : existing.quantity + item.quantity;
//       }

//       existing.specifications = {
//         ...existing.specifications,
//         ...(item.specifications ?? {}),
//       };

//       existing.artwork = item.artwork ?? existing.artwork;

//       existing.deadline = item.deadline ?? existing.deadline;

//       existing.remarks = item.remarks ?? existing.remarks;

//       existing.updatedAt = new Date();
//     } else {
//       orderRequest.items.push(item);
//     }

//     orderRequest.updatedAt = new Date();

//     return orderRequest;
//   }

//   removeItem(orderRequest, itemId) {
//     if (!orderRequest) {
//       return null;
//     }

//     orderRequest.items = orderRequest.items.filter(
//       (item) => item.itemId !== itemId,
//     );

//     orderRequest.updatedAt = new Date();

//     return orderRequest;
//   }

//   updateItem(orderRequest, itemId, updates = {}) {
//     if (!orderRequest) {
//       return null;
//     }

//     const item = orderRequest.items.find((item) => item.itemId === itemId);

//     if (!item) {
//       return orderRequest;
//     }

//     Object.assign(item, updates);

//     orderRequest.updatedAt = new Date();

//     return orderRequest;
//   }

//   clearActiveItem() {
//     return null;
//   }

//   completeItem(item) {
//     if (!item) {
//       return null;
//     }
//     const normalized = this.normalizeItem(item);

//     normalized.status = "PENDING";

//     return normalized;
//   }

//   /*
//    * =====================================================
//    * Customer
//    * =====================================================
//    */

//   updateCustomer(orderRequest, customer = {}) {
//     if (!orderRequest) {
//       orderRequest = this.createOrderRequest();
//     }

//     orderRequest.customer = {
//       ...orderRequest.customer,

//       ...customer,
//     };

//     orderRequest.updatedAt = new Date();

//     return orderRequest;
//   }

//   /*
//    * =====================================================
//    * Status
//    * =====================================================
//    */

//   updateStatus(orderRequest, status) {
//     if (!orderRequest) {
//       return null;
//     }

//     orderRequest.status = status;

//     orderRequest.updatedAt = new Date();

//     return orderRequest;
//   }

//   /*
//    * =====================================================
//    * Sales Assignment
//    * =====================================================
//    */

//   assignSalesPerson(orderRequest, assignedTo) {
//     if (!orderRequest) {
//       return null;
//     }

//     orderRequest.assignedTo = assignedTo;

//     orderRequest.updatedAt = new Date();

//     return orderRequest;
//   }

//   hasMultipleCategories(orderRequest) {
//     if (!orderRequest) {
//       return false;
//     }

//     const categories = new Set(
//       orderRequest.items.map((item) => item.mainCategory),
//     );

//     return categories.size > 1;
//   }

//   getMainCategories(orderRequest) {
//     if (!orderRequest) {
//       return [];
//     }

//     return [...new Set(orderRequest.items.map((i) => i.mainCategory))];
//   }

//   assignSalesPersonByCategory(orderRequest) {
//     if (!orderRequest) {
//       return null;
//     }

//     const categories = this.getMainCategories(orderRequest);

//     if (categories.length > 1) {
//       orderRequest.assignedTo = {
//         role: "ADMIN",
//         name: "Admin",
//       };

//       return orderRequest;
//     }

//     const mapping = {
//       "Print & Marketing": {
//         role: "PRINT_TEAM",
//         name: "Print Sales",
//       },

//       Signage: {
//         role: "SIGNAGE_TEAM",
//         name: "Signage Sales",
//       },

//       Uniforms: {
//         role: "UNIFORM_TEAM",
//         name: "Uniform Sales",
//       },

//       Gifts: {
//         role: "GIFTS_TEAM",
//         name: "Corporate Gifts Sales",
//       },
//     };

//     orderRequest.assignedTo = mapping[categories[0]] ?? {
//       role: "ADMIN",
//       name: "Admin",
//     };

//     return orderRequest;
//   }

//   /*
//    * =====================================================
//    * Summary Helpers
//    * =====================================================
//    */

//   hasItems(orderRequest) {
//     return (orderRequest?.items?.length ?? 0) > 0;
//   }

//   getTotalItems(orderRequest) {
//     if (!orderRequest) {
//       return 0;
//     }

//     return orderRequest.items.reduce(
//       (total, item) => total + (item.quantity ?? 1),
//       0,
//     );
//   }

//   buildSummary(orderRequest) {
//     if (!orderRequest) {
//       return [];
//     }

//     return orderRequest.items.map((item) => ({
//       itemId: item.itemId,

//       product: item.product,

//       mainCategory: item.mainCategory,

//       subCategory: item.subCategory,

//       quantity: item.quantity,

//       status: item.status,
//     }));
//   }
//   getCurrentItem(orderRequest, activeItem) {
//     return activeItem;
//   }

//   getNextMissingField(validation) {
//     return validation.missingFields?.[0] ?? null;
//   }

//   /*
//    * =====================================================
//    * Customer Helpers
//    * =====================================================
//    */

//   needsCustomerDetails(orderRequest) {
//     const customer = orderRequest?.customer ?? {};

//     return !customer.name || !customer.mobile || !customer.email;
//   }

//   getNextCustomerField(orderRequest) {
//     const customer = orderRequest?.customer ?? {};

//     if (!customer.name) return "name";

//     if (!customer.mobile) return "mobile";

//     if (!customer.email) return "email";

//     return null;
//   }

//   isCustomerComplete(orderRequest) {
//     return !this.needsCustomerDetails(orderRequest);
//   }
//   hasPendingItem(activeItem) {
//     return activeItem != null;
//   }
//   isOrderEmpty(orderRequest) {
//     return (orderRequest?.items?.length ?? 0) === 0;
//   }

//   normalizeItem(item) {
//     if (!item) return null;

//     let specifications = {};

//     if (item.specifications instanceof Map) {
//       specifications = Object.fromEntries(item.specifications);
//     } else if (
//       item.specifications &&
//       typeof item.specifications.toObject === "function"
//     ) {
//       specifications = item.specifications.toObject();
//     } else if (item.specifications) {
//       specifications = JSON.parse(JSON.stringify(item.specifications));
//     }

//     return {
//       itemId: item.itemId,
//       mainCategory: item.mainCategory,
//       subCategory: item.subCategory,
//       product: item.product,
//       quantity: item.quantity,
//       specifications,
//       artwork: item.artwork,
//       deadline: item.deadline,
//       remarks: item.remarks,
//       salesperson: item.salesperson,
//       status: item.status,
//     };
//   }
// }

import crypto from "node:crypto";

export default class OrderRequestManager {
  /*
   * =====================================================
   * Internal Helpers
   * =====================================================
   */

  ensureOrderRequest(orderRequest) {
    return orderRequest ?? this.createOrderRequest();
  }

  /*
   * =====================================================
   * Order Creation
   * =====================================================
   */

  createOrderRequest() {
    return {
      orderId: crypto.randomUUID(),

      status: "DRAFT",

      customer: {
        name: null,
        mobile: null,
        email: null,
      },

      assignedTo: null,

      items: [],

      createdAt: new Date(),

      updatedAt: new Date(),
    };
  }

  createActiveItem(extractedOrder) {
    extractedOrder ??= {};

    return {
      itemId: crypto.randomUUID(),

      mainCategory: extractedOrder.mainCategory ?? null,

      subCategory: extractedOrder.subCategory ?? null,

      product: extractedOrder.product ?? null,

      quantity: extractedOrder.quantity ?? null,

      specifications: extractedOrder.specifications ?? {},

      artwork: extractedOrder.artwork ?? null,

      deadline: extractedOrder.deadline ?? null,

      remarks: extractedOrder.remarks ?? null,

      salesperson: extractedOrder.salesperson ?? null,

      status: "COLLECTING",
    };
  }

  /*
   * =====================================================
   * Active Item Management
   * =====================================================
   */
  mergeActiveItem(activeItem, extractedOrder) {
    extractedOrder ??= {};

    if (!activeItem) {
      return this.createActiveItem(extractedOrder);
    }

    const current = this.normalizeItem(activeItem);

    return {
      ...current,

      mainCategory: extractedOrder.mainCategory ?? current.mainCategory,

      subCategory: extractedOrder.subCategory ?? current.subCategory,

      product: extractedOrder.product ?? current.product,

      quantity: extractedOrder.quantity ?? current.quantity,

      specifications: {
        ...current.specifications,
        ...(extractedOrder.specifications ?? {}),
      },

      artwork: extractedOrder.artwork ?? current.artwork,

      deadline: extractedOrder.deadline ?? current.deadline,

      remarks: extractedOrder.remarks ?? current.remarks,

      salesperson: extractedOrder.salesperson ?? current.salesperson,
    };
  }
  completeItem(item) {
    if (!item) {
      return null;
    }

    const normalized = this.normalizeItem(item);

    normalized.status = "PENDING";

    return normalized;
  }

  /*
   * =====================================================
   * Item Lookup
   * =====================================================
   */

  findItem(orderRequest, product) {
    if (!orderRequest || !product) {
      return null;
    }

    return orderRequest.items.find(
      (item) => item.product?.toLowerCase() === product.toLowerCase(),
    );
  }

  /*
   * =====================================================
   * Item Management
   * =====================================================
   */

  addOrUpdateItem(orderRequest, item) {
    if (!item) {
      return this.ensureOrderRequest(orderRequest);
    }

    orderRequest = this.ensureOrderRequest(orderRequest);

    const existing = this.findItem(orderRequest, item.product);

    if (existing) {
      if (item.quantity != null) {
        existing.quantity =
          existing.quantity == null
            ? item.quantity
            : existing.quantity + item.quantity;
      }

      existing.specifications = {
        ...existing.specifications,
        ...(item.specifications ?? {}),
      };

      existing.artwork = item.artwork ?? existing.artwork;

      existing.deadline = item.deadline ?? existing.deadline;

      existing.remarks = item.remarks ?? existing.remarks;

      existing.salesperson = item.salesperson ?? existing.salesperson;

      existing.updatedAt = new Date();
    } else {
      orderRequest.items.push(this.normalizeItem(item));
    }

    orderRequest.updatedAt = new Date();

    return orderRequest;
  }

  removeItem(orderRequest, itemId) {
    if (!orderRequest || !itemId) {
      return orderRequest;
    }

    orderRequest.items = orderRequest.items.filter(
      (item) => item.itemId !== itemId,
    );

    orderRequest.updatedAt = new Date();

    return orderRequest;
  }

  updateItem(orderRequest, itemId, updates = {}) {
    if (!orderRequest || !itemId) {
      return orderRequest;
    }

    const item = orderRequest.items.find((item) => item.itemId === itemId);

    if (!item) {
      return orderRequest;
    }

    Object.assign(item, updates);

    orderRequest.updatedAt = new Date();

    return orderRequest;
  }

  /*
   * =====================================================
   * Customer Management
   * =====================================================
   */

  updateCustomer(orderRequest, customer = {}) {
    orderRequest = this.ensureOrderRequest(orderRequest);

    orderRequest.customer = {
      ...orderRequest.customer,
      ...customer,
    };

    orderRequest.updatedAt = new Date();

    return orderRequest;
  }

  needsCustomerDetails(orderRequest) {
    const customer = orderRequest?.customer ?? {};

    return !customer.name || !customer.mobile || !customer.email;
  }

  getNextCustomerField(orderRequest) {
    const customer = orderRequest?.customer ?? {};

    if (!this.isNameValid(customer.name)) {
      return "name";
    }

    if (!this.isMobileValid(customer.mobile)) {
      return "mobile";
    }

    if (!this.isEmailValid(customer.email)) {
      return "email";
    }

    return null;
  }

  getMissingCustomerFields(orderRequest) {
    const customer = orderRequest?.customer ?? {};

    const missing = [];

    if (!this.isNameValid(customer.name)) {
      missing.push("name");
    }

    if (!this.isMobileValid(customer.mobile)) {
      missing.push("mobile");
    }

    if (!this.isEmailValid(customer.email)) {
      missing.push("email");
    }

    return missing;
  }

  isCustomerComplete(orderRequest) {
    const customer = orderRequest?.customer ?? {};

    return (
      this.isNameValid(customer.name) &&
      this.isMobileValid(customer.mobile) &&
      this.isEmailValid(customer.email)
    );
  }

  /*
   * =====================================================
   * Status Management
   * =====================================================
   */

  updateStatus(orderRequest, status) {
    if (!orderRequest) {
      return null;
    }

    orderRequest.status = status;

    orderRequest.updatedAt = new Date();

    return orderRequest;
  }

  /*
   * =====================================================
   * Sales Assignment
   * =====================================================
   */

  assignSalesPerson(orderRequest, assignedTo) {
    if (!orderRequest) {
      return null;
    }

    orderRequest.assignedTo = assignedTo;
    orderRequest.updatedAt = new Date();

    return orderRequest;
  }

  assignSalesPersonByCategory(orderRequest) {
    if (!orderRequest) {
      return null;
    }

    const categories = this.getMainCategories(orderRequest);

    if (categories.length > 1) {
      return this.assignSalesPerson(orderRequest, {
        role: "ADMIN",
        name: "Admin",
      });
    }

    const mapping = {
      "Print & Marketing": {
        role: "PRINT_TEAM",
        name: "Print Sales",
      },

      Signage: {
        role: "SIGNAGE_TEAM",
        name: "Signage Sales",
      },

      Uniforms: {
        role: "UNIFORM_TEAM",
        name: "Uniform Sales",
      },

      Gifts: {
        role: "GIFTS_TEAM",
        name: "Corporate Gifts Sales",
      },
    };

    return this.assignSalesPerson(
      orderRequest,
      mapping[categories[0]] ?? {
        role: "ADMIN",
        name: "Admin",
      },
    );
  }

  /*
   * =====================================================
   * Order Summary
   * =====================================================
   */

  hasItems(orderRequest) {
    return (orderRequest?.items?.length ?? 0) > 0;
  }

  isOrderEmpty(orderRequest) {
    return !this.hasItems(orderRequest);
  }

  getTotalItems(orderRequest) {
    if (!orderRequest) {
      return 0;
    }

    return orderRequest.items.reduce(
      (total, item) => total + (item.quantity ?? 1),
      0,
    );
  }

  buildSummary(orderRequest) {
    if (!orderRequest) {
      return [];
    }

    return orderRequest.items.map((item) => ({
      itemId: item.itemId,

      product: item.product,

      mainCategory: item.mainCategory,

      subCategory: item.subCategory,

      quantity: item.quantity,

      status: item.status,
    }));
  }

  /*
   * =====================================================
   * Category Helpers
   * =====================================================
   */

  hasMultipleCategories(orderRequest) {
    if (!orderRequest) {
      return false;
    }

    return this.getMainCategories(orderRequest).length > 1;
  }

  getMainCategories(orderRequest) {
    if (!orderRequest) {
      return [];
    }

    return [
      ...new Set(
        orderRequest.items.map((item) => item.mainCategory).filter(Boolean),
      ),
    ];
  }

  /*
   * =====================================================
   * Validation Helpers
   * =====================================================
   */

  getNextMissingField(validation) {
    return validation?.missingFields?.[0] ?? null;
  }

  hasPendingItem(activeItem) {
    return activeItem != null;
  }
  /*
   * =====================================================
   * Utilities
   * =====================================================
   */

  normalizeItem(item) {
    if (!item) {
      return null;
    }

    let specifications = {};

    if (item.specifications instanceof Map) {
      specifications = Object.fromEntries(item.specifications);
    } else if (
      item.specifications &&
      typeof item.specifications.toObject === "function"
    ) {
      specifications = item.specifications.toObject();
    } else if (item.specifications && typeof item.specifications === "object") {
      specifications = JSON.parse(JSON.stringify(item.specifications));
    }

    return {
      itemId: item.itemId,

      mainCategory: item.mainCategory,

      subCategory: item.subCategory,

      product: item.product,

      quantity: item.quantity,

      specifications,

      artwork: item.artwork,

      deadline: item.deadline,

      remarks: item.remarks,

      salesperson: item.salesperson,

      status: item.status,
    };
  }
  isNameValid(name) {
    if (!name) {
      return false;
    }

    const value = name.trim();

    if (value.length < 2) {
      return false;
    }

    if (/^\d+$/.test(value)) {
      return false;
    }

    if (/@/.test(value)) {
      return false;
    }

    return true;
  }
  isMobileValid(mobile) {
    if (!mobile) {
      return false;
    }

    return /^[+\d\s()-]{7,20}$/.test(mobile.trim());
  }
  isEmailValid(email) {
    if (!email) {
      return false;
    }

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  }
  needsCustomerDetails(orderRequest) {
    return !this.isCustomerComplete(orderRequest);
  }
}
