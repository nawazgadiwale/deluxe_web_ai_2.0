const COMMON_FIELDS = [
  "quantity",
  "artworkStatus",
  "artworkFile",
  "designRequirements",
  "deadline",
  "notes",
  "name",
  "company",
  "phone",
  "email",
];

export default class OrderManager {
  /*
   * =====================================================
   * Create Order
   * =====================================================
   */

  createOrder() {
    return {
      status: "COLLECTING",

      customer: {
        name: null,
        company: null,
        phone: null,
        email: null,
      },

      items: [],

      totalItems: 0,

      totalQuantity: 0,

      notes: null,

      leadId: null,

      createdAt: new Date(),

      updatedAt: new Date(),
    };
  }

  // generating order number
  generateOrderNumber(order) {
    if (order.orderNumber) {
      return;
    }

    const now = new Date();

    const date =
      now.getFullYear().toString() +
      String(now.getMonth() + 1).padStart(2, "0") +
      String(now.getDate()).padStart(2, "0");

    const random = Math.floor(1000 + Math.random() * 9000);

    order.orderNumber = `ORD-${date}-${random}`;
  }

  /*
   * =====================================================
   * Add Product
   * =====================================================
   */

  addItem(order, item) {
    if (!order) {
      order = this.createOrder();
    }

    const existing = this.getItem(order, item.product);

    if (existing) {
      return existing;
    }

    const orderItem = {
      product: item.product,

      mainCategory: item.mainCategory,

      subCategory: item.subCategory,

      specifications: {},

      quantity: null,

      artworkStatus: null,

      artworkFile: null,

      designRequirements: null,

      deadline: null,

      notes: null,

      createdAt: new Date(),

      updatedAt: new Date(),
    };

    order.items.push(orderItem);

    order.status = "COLLECTING";

    this.updateTotals(order);

    order.updatedAt = new Date();

    return orderItem;
  }

  /*
   * =====================================================
   * Update Quantity
   * =====================================================
   */

  updateQuantity(order, product, quantity) {
    const item = this.getItem(order, product);

    if (!item) {
      return;
    }

    item.quantity = Number(quantity);

    item.updatedAt = new Date();

    this.updateTotals(order);
  }

  /*
   * =====================================================
   * Artwork
   * =====================================================
   */

  updateArtwork(order, product, artworkStatus) {
    const item = this.getItem(order, product);

    if (!item) {
      return;
    }

    item.artworkStatus = artworkStatus;

    item.updatedAt = new Date();
  }

  /*
   * =====================================================
   * Design Requirements
   * =====================================================
   */

  updateDesignRequirements(order, product, requirements) {
    const item = this.getItem(order, product);

    if (!item) {
      return;
    }

    item.designRequirements = requirements;

    item.updatedAt = new Date();
  }

  /*
   * =====================================================
   * Deadline
   * =====================================================
   */

  updateDeadline(order, product, deadline) {
    const item = this.getItem(order, product);

    if (!item) {
      return;
    }

    item.deadline = deadline;

    item.updatedAt = new Date();
  }

  /*
   * =====================================================
   * Specification
   * =====================================================
   */

  updateSpecification(order, product, field, value) {
    const item = this.getItem(order, product);

    if (!item) {
      return;
    }

    item.specifications[field] = value;

    item.updatedAt = new Date();
  }

  /*
   * =====================================================
   * Notes
   * =====================================================
   */

  updateNotes(order, product, notes) {
    const item = this.getItem(order, product);

    if (!item) {
      return;
    }

    item.notes = notes;

    item.updatedAt = new Date();
  }

  /*
   * =====================================================
   * Customer
   * =====================================================
   */

  updateCustomer(order, customer = {}) {
    Object.entries(customer).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        order.customer[key] = value;
      }
    });

    order.updatedAt = new Date();
  }

  /*
   * =====================================================
   * Review
   * =====================================================
   */

  review(order) {
    order.status = "REVIEW";
    order.updatedAt = new Date();
  }

  /*
   * =====================================================
   * Confirm
   * =====================================================
   */

  confirm(order) {
    order.status = "CONFIRMED";
    order.updatedAt = new Date();
  }

  /*
   * =====================================================
   * Cancel
   * =====================================================
   */

  cancel(order) {
    order.status = "CANCELLED";
    order.updatedAt = new Date();
  }

  /*
   * =====================================================
   * Remove Product
   * =====================================================
   */

  removeItem(order, product) {
    order.items = order.items.filter(
      (item) => item.product.toLowerCase() !== product.toLowerCase(),
    );

    this.updateTotals(order);

    order.updatedAt = new Date();
  }

  /*
   * =====================================================
   * Helpers
   * =====================================================
   */

  getItem(order, product) {
    return (
      order.items.find(
        (item) => item.product.toLowerCase() === product.toLowerCase(),
      ) ?? null
    );
  }

  isEmpty(order) {
    return order.items.length === 0;
  }

  updateTotals(order) {
    order.totalItems = order.items.length;

    order.totalQuantity = order.items.reduce(
      (sum, item) => sum + (item.quantity ?? 0),
      0,
    );
  }

  clear(order) {
    order.customer = {
      name: null,
      company: null,
      phone: null,
      email: null,
    };

    order.notes = null;

    order.leadId = null;

    order.items = [];

    order.totalItems = 0;

    order.totalQuantity = 0;

    order.status = "COLLECTING";

    order.updatedAt = new Date();
  }

  /*
   * =====================================================
   * Update From Form
   * =====================================================
   */
  updateFromForm(order, product, form = {}) {
    if (!order || !product || !form) {
      return;
    }

    /*
     * Quantity
     */
    if (form.quantity != null) {
      this.updateQuantity(order, product, form.quantity);
    }

    /*
     * Artwork
     */
    if (form.artworkStatus != null) {
      this.updateArtwork(order, product, form.artworkStatus);
    }

    /*
     * Artwork File
     */
    if (form.artworkFile !== undefined) {
      const item = this.getItem(order, product);

      if (item) {
        item.artworkFile = form.artworkFile;
        item.updatedAt = new Date();
      }
    }

    /*
     * Design Requirements
     */
    if (form.designRequirements != null) {
      this.updateDesignRequirements(order, product, form.designRequirements);
    }

    /*
     * Deadline
     */
    if (form.deadline != null) {
      this.updateDeadline(order, product, form.deadline);
    }

    /*
     * Notes
     */
    if (form.notes != null) {
      this.updateNotes(order, product, form.notes);
    }

    /*
     * Customer
     */
    this.updateCustomer(order, {
      name: form.name,
      company: form.company,
      phone: form.phone,
      email: form.email,
    });

    /*
     * Dynamic Specifications
     */
    Object.entries(form).forEach(([key, value]) => {
      if (COMMON_FIELDS.includes(key)) {
        return;
      }

      this.updateSpecification(order, product, key, value);
    });

    order.updatedAt = new Date();

    // console.log("========== ORDER AFTER UPDATE ==========");
    // console.dir(order.items, { depth: null });
    // console.log("========================================");
  }
}
