import ORDER_ACTIONS from "./helpers/OrderTypes.js";

export default class OrderReviewBuilder {
  build(order, result = {}) {
    switch (result.action) {
      case ORDER_ACTIONS.ADD_ITEM:
        return this.itemAdded(order);

      case ORDER_ACTIONS.UPDATE_ITEM:
        return this.itemUpdated(order);

      case ORDER_ACTIONS.REMOVE_ITEM:
        return this.itemRemoved(order, result.messages);

      case ORDER_ACTIONS.REVIEW_ORDER:
        return this.review(order);

      case ORDER_ACTIONS.CONFIRM_ORDER:
        return this.confirmed(order);

      case ORDER_ACTIONS.CANCEL_ORDER:
        return this.cancelled(order);

      default:
        return this.buildResponse(order, {
          summary: "How can I help you with your order?",
        });
    }
  }

  itemAdded(order) {
    const item = order.items.at(-1);

    return this.buildResponse(order, {
      summary: `"${item.product}" has been added to your order.`,
    });
  }

  itemUpdated(order) {
    return this.buildResponse(order, {
      summary: "Your order has been updated.",
    });
  }

  itemRemoved(order, messages = []) {
    return this.buildResponse(order, {
      summary:
        messages.length > 0
          ? messages.join("\n")
          : "Item removed from your order.",
    });
  }

  review(order) {
    const items = order.items.map((item, index) => ({
      srNo: index + 1,
      product: item.product,
      mainCategory: item.mainCategory,
      subCategory: item.subCategory,
      quantity: item.quantity,
      artworkStatus: item.artworkStatus,
      deadline: item.deadline,
      specifications: item.specifications,
      notes: item.notes,
    }));

    return this.buildResponse(order, {
      summary: "Please review your order before confirming.",

      items,

      totals: {
        totalItems: order.totalItems,
        totalQuantity: order.totalQuantity,
      },

      actions: [
        {
          id: ORDER_ACTIONS.ADD_MORE_PRODUCTS,
          label: "Add More Products",
        },
        {
          id: ORDER_ACTIONS.CONFIRM_ORDER,
          label: "Confirm Order",
        },
        {
          id: ORDER_ACTIONS.CANCEL_ORDER,
          label: "Cancel Order",
        },
      ],
    });
  }

  confirmed(order) {
    return this.buildResponse(order, {
      summary: "Your order has been confirmed successfully.",

      metadata: {
        orderNumber: order.orderNumber,
        status: order.status,
      },
    });
  }

  cancelled(order) {
    return this.buildResponse(order, {
      summary: "Your order has been cancelled.",
    });
  }

  buildResponse(order, data = {}) {
    return {
      summary: data.summary,

      items: data.items ?? order.items,

      customer: order.customer,

      totals: data.totals ?? {
        totalItems: order.totalItems,
        totalQuantity: order.totalQuantity,
      },

      recommendations: data.recommendations ?? [],

      actions: data.actions ?? [],

      metadata: data.metadata ?? {},
    };
  }
}
