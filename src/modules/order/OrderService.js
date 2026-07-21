import OrderExtractor from "./extractors/OrderExtractor.js";
import OrderManager from "./OrderManager.js";
import OrderReviewBuilder from "./OrderReviewBuilder.js";
import ORDER_ACTIONS from "./helpers/OrderTypes.js";
import OrderFormBuilder from "./builders/OrderFormBuilder.js";
import OrderValidator from "./OrderValidator.js";

const formBuilder = new OrderFormBuilder();

const validator = new OrderValidator();

const extractor = new OrderExtractor();

const manager = new OrderManager();

const reviewBuilder = new OrderReviewBuilder();

export default class OrderService {
  async execute(state) {
    /*
     * =====================================================
     * Active Order
     * =====================================================
     */

    let order = state.orderContext;

    if (!order) {
      order = manager.createOrder();
    }

    /*
     * =====================================================
     * Extract
     * =====================================================
     */

    const result = await extractor.extract(state);
    // console.log(result);

    // console.log("========== ORDER EXTRACTION ==========");
    // console.log(result);
    // console.log("======================================");

    /*
     * =====================================================
     * Execute Action
     * =====================================================
     */

    switch (result.action) {
      /*
       * -----------------------------------------------------
       * Add Product
       * -----------------------------------------------------
       */

      case ORDER_ACTIONS.ADD_ITEM: {
        const forms = [];

        for (const item of result.items ?? []) {
          const orderItem = manager.addItem(order, item);

          forms.push(await formBuilder.build(orderItem));
        }
        order.status = "COLLECTING";

        return {
          order,

          response: {
            success: true,

            type: "order_form",

            message: "Please complete the order details.",

            data: {
              forms,
            },

            actions: [],

            metadata: {},
          },
        };
      }

      /*
       * -----------------------------------------------------
       * Update Item
       * -----------------------------------------------------
       */

      case ORDER_ACTIONS.UPDATE_ITEM: {
        for (const item of result.items ?? []) {
          manager.updateFromForm(
            order,

            item.product,

            item.form,
          );
        }

        const validation = await validator.validate(order);

        // console.log("========== VALIDATION ==========");
        // console.dir(validation, { depth: null });
        // console.log("================================");

        if (!validation.valid) {
          return {
            order,

            response: {
              success: false,

              type: "order_validation",

              message:
                "Some required information is missing. Please complete the highlighted fields.",

              data: validation,

              actions: [],

              metadata: {},
            },
          };
        }

        manager.review(order);

        const review = reviewBuilder.build(order, {
          action: ORDER_ACTIONS.REVIEW_ORDER,
        });

        return {
          order,

          response: {
            success: true,

            type: "order",

            message: review.summary,

            data: review,

            actions: review.actions ?? [],

            metadata: {},
          },
        };
      }

      /*
       * -----------------------------------------------------
       * Continue Order
       * -----------------------------------------------------
       */

      case ORDER_ACTIONS.CONTINUE_ORDER: {
        return {
          order,
          response: {
            success: true,
            type: "text",
            message: "Let's continue with your order.",
            data: {},
            actions: [],
            metadata: {},
          },
        };
      }

      /*
       * -----------------------------------------------------
       * Add More Products
       * -----------------------------------------------------
       */

      case ORDER_ACTIONS.ADD_MORE_PRODUCTS: {
        return {
          order,
          response: {
            success: true,
            type: "text",
            message: "Sure! Which product would you like to add next?",
            data: {},
            actions: [],
            metadata: {},
          },
        };
      }

      /*
       * -----------------------------------------------------
       * Remove Item
       * -----------------------------------------------------
       */

      case ORDER_ACTIONS.REMOVE_ITEM: {
        for (const item of result.items ?? []) {
          manager.removeItem(order, item.product);
        }

        const review = reviewBuilder.build(order, {
          action: ORDER_ACTIONS.REMOVE_ITEM,
        });

        return {
          order,
          response: {
            success: true,
            type: "order",
            message: review.summary,
            data: review,
            actions: review.actions ?? [],
            metadata: {},
          },
        };
      }

      /*
       * -----------------------------------------------------
       * Review
       * -----------------------------------------------------
       */

      case ORDER_ACTIONS.REVIEW_ORDER: {
        manager.review(order);

        const review = reviewBuilder.build(order, {
          action: ORDER_ACTIONS.REVIEW_ORDER,
        });

        return {
          order,

          response: {
            success: true,

            type: "order",

            message: review.summary,

            data: review,

            actions: review.actions,

            metadata: {},
          },
        };
      }

      /*
       * -----------------------------------------------------
       * Confirm
       * -----------------------------------------------------
       */
      case ORDER_ACTIONS.CONFIRM_ORDER: {
        manager.generateOrderNumber(order);

        manager.confirm(order);

        state.leadRequest ??= {
          type: "ORDER_REQUEST",
          status: "COLLECTING_CUSTOMER",
          source: "AI_ASSISTANT",
          customer: {},
        };

        state.leadRequest.status = "COLLECTING_CUSTOMER";

        state.leadRequest.order = {
          orderNumber: order.orderNumber,
          items: order.items,
          totalItems: order.totalItems,
          totalQuantity: order.totalQuantity,
        };

        state.leadRequest.customer = {
          ...state.leadRequest.customer,
          ...order.customer,
        };

        state.persistence.leadRequest = {
          dirty: true,
          updatedAt: new Date(),
        };

        const review = reviewBuilder.build(order, {
          action: ORDER_ACTIONS.CONFIRM_ORDER,
        });

        return {
          order,
          response: {
            success: true,
            type: "order_completed",
            message: review.summary,
            data: review,
            actions: [],
            metadata: {},
          },
        };
      }

      /*
       * -----------------------------------------------------
       * Cancel
       * -----------------------------------------------------
       */

      case ORDER_ACTIONS.CANCEL_ORDER: {
        manager.cancel(order);

        const review = reviewBuilder.build(order, {
          action: ORDER_ACTIONS.CANCEL_ORDER,
        });

        return {
          order,
          response: {
            success: true,
            type: "order",
            message: review.summary,
            data: review,
            actions: [],
            metadata: {},
          },
        };
      }

      /*
       * -----------------------------------------------------
       * Clear
       * -----------------------------------------------------
       */

      case ORDER_ACTIONS.CLEAR_ORDER: {
        manager.clear(order);

        return {
          order,
          response: {
            success: true,
            type: "text",
            message: "Your order has been cleared.",
            data: {},
            actions: [],
            metadata: {},
          },
        };
      }

      default:
        return {
          order,
          response: {
            success: false,
            type: "error",
            message: "Unable to process the order request.",
            data: {},
            actions: [],
            metadata: {},
          },
        };
    }
  }
}
