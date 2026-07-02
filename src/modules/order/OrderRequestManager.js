import crypto from "node:crypto";

export default class OrderRequestManager {
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

  createActiveItem(extractedOrder = {}) {
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

  mergeActiveItem(activeItem, extractedOrder = {}) {
    if (!activeItem) {
      return this.createActiveItem(extractedOrder);
    }

    return {
      ...activeItem,

      mainCategory: extractedOrder.mainCategory ?? activeItem.mainCategory,

      subCategory: extractedOrder.subCategory ?? activeItem.subCategory,

      product: extractedOrder.product ?? activeItem.product,

      quantity: extractedOrder.quantity ?? activeItem.quantity,

      specifications: {
        ...activeItem.specifications,
        ...(extractedOrder.specifications ?? {}),
      },

      artwork: extractedOrder.artwork ?? activeItem.artwork,

      deadline: extractedOrder.deadline ?? activeItem.deadline,

      remarks: extractedOrder.remarks ?? activeItem.remarks,

      salesperson: extractedOrder.salesperson ?? activeItem.salesperson,
    };
  }

  /*
   * =====================================================
   * Item Helpers
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

  hasProduct(orderRequest, product) {
    return !!this.findItem(orderRequest, product);
  }

  addItem(orderRequest, item) {
    if (!item) {
      return orderRequest;
    }

    if (!orderRequest) {
      orderRequest = this.createOrderRequest();
    }

    orderRequest.items.push(item);

    orderRequest.updatedAt = new Date();

    return orderRequest;
  }

  /*
   * =====================================================
   * Enterprise Add Item
   * Prevent duplicate products
   * Merge quantity/specifications
   * =====================================================
   */

  addOrUpdateItem(orderRequest, item) {
    if (!item) {
      return orderRequest;
    }

    if (!orderRequest) {
      orderRequest = this.createOrderRequest();
    }

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

      existing.updatedAt = new Date();
    } else {
      orderRequest.items.push(item);
    }

    orderRequest.updatedAt = new Date();

    return orderRequest;
  }

  removeItem(orderRequest, itemId) {
    if (!orderRequest) {
      return null;
    }

    orderRequest.items = orderRequest.items.filter(
      (item) => item.itemId !== itemId,
    );

    orderRequest.updatedAt = new Date();

    return orderRequest;
  }

  updateItem(orderRequest, itemId, updates = {}) {
    if (!orderRequest) {
      return null;
    }

    const item = orderRequest.items.find((item) => item.itemId === itemId);

    if (!item) {
      return orderRequest;
    }

    Object.assign(item, updates);

    orderRequest.updatedAt = new Date();

    return orderRequest;
  }

  clearActiveItem() {
    return null;
  }

  completeItem(item) {
    if (!item) {
      return null;
    }

    return {
      ...item,

      status: "PENDING",
    };
  }

  /*
   * =====================================================
   * Customer
   * =====================================================
   */

  updateCustomer(orderRequest, customer = {}) {
    if (!orderRequest) {
      orderRequest = this.createOrderRequest();
    }

    orderRequest.customer = {
      ...orderRequest.customer,

      ...customer,
    };

    orderRequest.updatedAt = new Date();

    return orderRequest;
  }

  /*
   * =====================================================
   * Status
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

  hasMultipleCategories(orderRequest) {
    if (!orderRequest) {
      return false;
    }

    const categories = new Set(
      orderRequest.items.map((item) => item.mainCategory),
    );

    return categories.size > 1;
  }

  getMainCategories(orderRequest) {
    if (!orderRequest) {
      return [];
    }

    return [...new Set(orderRequest.items.map((i) => i.mainCategory))];
  }

  assignSalesPersonByCategory(orderRequest) {
    if (!orderRequest) {
      return null;
    }

    const categories = this.getMainCategories(orderRequest);

    if (categories.length > 1) {
      orderRequest.assignedTo = {
        role: "ADMIN",
        name: "Admin",
      };

      return orderRequest;
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

    orderRequest.assignedTo = mapping[categories[0]] ?? {
      role: "ADMIN",
      name: "Admin",
    };

    return orderRequest;
  }

  /*
   * =====================================================
   * Summary Helpers
   * =====================================================
   */

  hasItems(orderRequest) {
    return (orderRequest?.items?.length ?? 0) > 0;
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
}
