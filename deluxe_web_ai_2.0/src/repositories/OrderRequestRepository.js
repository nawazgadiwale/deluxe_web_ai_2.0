import OrderModel from "../models/OrderRequest.js";

export default class OrderRepository {
  /*
   * =====================================================
   * Create
   * =====================================================
   */

  async create(order = {}) {
    return OrderModel.create(order);
  }

  /*
   * =====================================================
   * Save
   * =====================================================
   */

  async save(order) {
    if (!order) {
      return null;
    }

    order.updatedAt = new Date();

    return order.save();
  }

  /*
   * =====================================================
   * Find By Id
   * =====================================================
   */

  async findById(orderId) {
    if (!orderId) {
      return null;
    }

    return OrderModel.findById(orderId);
  }

  /*
   * =====================================================
   * Find By Order Number
   * =====================================================
   */

  async findByOrderNumber(orderNumber) {
    if (!orderNumber) {
      return null;
    }

    return OrderModel.findOne({
      orderNumber,
    });
  }

  /*
   * =====================================================
   * Active Order For Session
   * =====================================================
   */

  async findActiveBySession(sessionId) {
    if (!sessionId) {
      return null;
    }

    const order = await OrderModel.findOne({
      sessionId,
      status: {
        $nin: ["CONFIRMED", "CANCELLED", "DELETED"],
      },
    }).sort({
      createdAt: -1,
    });

    // console.log("========== LOADED ORDER ==========");
    // console.dir(order?.items, { depth: null });
    // console.log("==================================");

    return order;
  }

  /*
   * =====================================================
   * Conversation Order
   * =====================================================
   */

  async findByConversationId(conversationId) {
    if (!conversationId) {
      return null;
    }

    return OrderModel.findOne({
      conversationId,
    }).sort({
      createdAt: -1,
    });
  }

  /*
   * =====================================================
   * Lead Order
   * =====================================================
   */

  async findByLeadId(leadId) {
    if (!leadId) {
      return null;
    }

    return OrderModel.findOne({
      leadId,
    });
  }

  /*
   * =====================================================
   * Order History
   * =====================================================
   */

  async findHistory(sessionId) {
    if (!sessionId) {
      return [];
    }

    return OrderModel.find({
      sessionId,
    }).sort({
      createdAt: -1,
    });
  }

  /*
   * =====================================================
   * Pending Sales Orders
   * =====================================================
   */

  async findPendingOrders() {
    return OrderModel.find({
      status: "CONFIRMED",
      leadId: {
        $exists: true,
      },
    }).sort({
      createdAt: -1,
    });
  }

  /*
   * =====================================================
   * Update
   * =====================================================
   */

  async update(orderId, updates = {}) {
    if (!orderId) {
      return null;
    }

    return OrderModel.findByIdAndUpdate(
      orderId,
      {
        $set: {
          ...updates,
          updatedAt: new Date(),
        },
      },
      {
        new: true,
      },
    );
  }

  /*
   * =====================================================
   * Attach Lead
   * =====================================================
   */

  async attachLead(orderId, leadId) {
    if (!orderId || !leadId) {
      return null;
    }

    return OrderModel.findByIdAndUpdate(
      orderId,
      {
        $set: {
          leadId,
          updatedAt: new Date(),
        },
      },
      {
        new: true,
      },
    );
  }

  /*
   * =====================================================
   * Update Customer
   * =====================================================
   */

  async updateCustomer(orderId, customer = {}) {
    if (!orderId) {
      return null;
    }

    return OrderModel.findByIdAndUpdate(
      orderId,
      {
        $set: {
          customer,
          updatedAt: new Date(),
        },
      },
      {
        new: true,
      },
    );
  }

  /*
   * =====================================================
   * Update Status
   * =====================================================
   */

  async updateStatus(orderId, status) {
    if (!orderId) {
      return null;
    }

    return OrderModel.findByIdAndUpdate(
      orderId,
      {
        $set: {
          status,
          updatedAt: new Date(),
        },
      },
      {
        new: true,
      },
    );
  }

  /*
   * =====================================================
   * Soft Delete
   * =====================================================
   */

  async delete(orderId) {
    if (!orderId) {
      return null;
    }

    return OrderModel.findByIdAndUpdate(
      orderId,
      {
        $set: {
          status: "DELETED",
          updatedAt: new Date(),
        },
      },
      {
        new: true,
      },
    );
  }

  async saveDraft(sessionId, conversationId, order) {
    // console.log("========== SAVING ORDER ==========");
    // console.dir(order.items, { depth: null });
    // console.log("==================================");
    return OrderModel.findOneAndUpdate(
      {
        sessionId,
      },
      {
        $set: {
          status: order.status,

          customer: order.customer,

          items: order.items,

          totalItems: order.totalItems,

          totalQuantity: order.totalQuantity,

          notes: order.notes,

          leadId: order.leadId,

          orderNumber: order.orderNumber,

          updatedAt: new Date(),
        },

        $setOnInsert: {
          sessionId,
          conversationId,
          createdAt: new Date(),
        },
      },
      {
        upsert: true,
        returnDocument: "after",
      },
    );
  }
}
