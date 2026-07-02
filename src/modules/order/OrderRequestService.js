import OrderRequestManager from "./OrderRequestManager.js";
import OrderRequestValidator from "./OrderRequestValidator.js";

const manager = new OrderRequestManager();
const validator = new OrderRequestValidator();

export default class OrderRequestService {
  async process(state) {
    let orderRequest = state.orderRequest ?? manager.createOrderRequest();

    /*
     * ===================================================
     * STEP 1 : Waiting for NEXT ITEM decision
     * ===================================================
     */

    if (state.awaitingDecision && state.currentStep === "NEXT_ITEM") {
      const answer = (state.userMessage ?? "").trim().toLowerCase();

      const continueWords = [
        "yes",
        "yeah",
        "y",
        "sure",
        "ok",
        "okay",
        "also",
        "another",
        "add",
      ];

      const wantsAnother = continueWords.some(
        (word) => answer === word || answer.startsWith(`${word} `),
      );

      if (wantsAnother) {
        manager.updateStatus(orderRequest, "DRAFT");

        // Reset so the extractor creates a new product
        state.activeOrderItem = null;

        return {
          status: "COLLECTING_ITEMS",

          orderRequest,

          activeOrderItem: null,

          awaitingDecision: false,

          currentStep: null,

          response: {
            step: "COLLECT_PRODUCT_DETAILS",

            message: "Sure! Tell me the next product you'd like to add.",
          },
        };
      }

      /*
       * User finished adding products
       */

      manager.updateStatus(orderRequest, "DRAFT");

      return {
        status: "ORDER_REVIEW",

        orderRequest,

        activeOrderItem: null,

        awaitingDecision: true,

        currentStep: "ORDER_CONFIRMATION",

        response: {
          step: "ORDER_REVIEW",

          message: "Please review your order.",

          items: orderRequest.items,

          question: "Would you like to confirm this order or make any changes?",
        },
      };
    }

    /*
     * ===================================================
     * STEP 2 : Waiting for ORDER confirmation
     * ===================================================
     */

    if (state.awaitingDecision && state.currentStep === "ORDER_CONFIRMATION") {
      const answer = (state.userMessage ?? "").trim().toLowerCase();

      if (["yes", "confirm", "confirmed", "looks good"].includes(answer)) {
        manager.updateStatus(orderRequest, "DRAFT");
        return {
          status: "COLLECTING_CUSTOMER",

          orderRequest,

          activeOrderItem: null,

          awaitingDecision: false,

          currentStep: "CUSTOMER_DETAILS",

          response: {
            step: "CUSTOMER_DETAILS",

            message:
              "Perfect. Before I submit your order, please provide your Name, Mobile Number and Email Address.",
          },
        };
      }

      manager.updateStatus(orderRequest, "COLLECTING_ITEMS");

      return {
        status: "COLLECTING_ITEMS",

        orderRequest,

        activeOrderItem: null,

        awaitingDecision: false,

        currentStep: null,

        response: {
          message: "Sure. Tell me what you would like to modify or add.",
        },
      };
    }

    /*
     * ===================================================
     * STEP 3 : Customer Details
     * ===================================================
     */

    if (state.currentStep === "CUSTOMER_DETAILS") {
      const customer = {
        ...orderRequest.customer,
        ...(state.extractedOrder?.customer ?? {}),
      };

      manager.updateCustomer(orderRequest, customer);

      const missing = [];

      if (!customer.name) missing.push("name");

      if (!customer.mobile) missing.push("mobile");

      if (!customer.email) missing.push("email");

      if (missing.length) {
        return {
          status: "COLLECTING_CUSTOMER",

          orderRequest,

          activeOrderItem: null,

          awaitingDecision: false,

          currentStep: "CUSTOMER_DETAILS",

          response: {
            step: "CUSTOMER_DETAILS",

            message: "I still need a few details before submitting your order.",

            missingFields: missing,
          },
        };
      }
      //
      // Assign salesperson
      //

      manager.assignSalesPersonByCategory(orderRequest);

      // Customer has confirmed.
      // Order is officially submitted.

      manager.updateStatus(orderRequest, "SUBMITTED");

      return {
        status: "COMPLETED",

        orderRequest,

        activeOrderItem: null,

        awaitingDecision: false,

        currentStep: null,

        response: {
          step: "ORDER_COMPLETED",

          message: `Thank you for choosing Deluxe Printing. Your order details have been submitted successfully. One of our ${orderRequest.assignedTo?.name ?? "Sales"} experts will contact you shortly to discuss your requirements and assist you with the next steps.`,

          customer: orderRequest.customer,

          assignedTo: orderRequest.assignedTo,

          items: orderRequest.items,
        },
      };
    }

    /*
     * ===================================================
     * STEP 4 : Product Collection
     * ===================================================
     */

    let activeItem = manager.mergeActiveItem(
      state.activeOrderItem,
      state.extractedOrder,
    );

    const validation = await validator.validate(activeItem);

    if (!validation.valid) {
      return {
        status: "COLLECTING_ITEMS",

        orderRequest,

        activeOrderItem: activeItem,

        awaitingDecision: false,

        currentStep: null,

        response: {
          step: "COLLECT_PRODUCT_DETAILS",

          message:
            "I need a little more information before adding this product.",

          missingFields: validation.missingFields,

          errors: validation.errors,
        },
      };
    }

    activeItem = manager.completeItem(activeItem);

    orderRequest = manager.addOrUpdateItem(orderRequest, activeItem);
    manager.updateStatus(orderRequest, "DRAFT");
    return {
      status: "WAITING_FOR_NEXT_ITEM",

      orderRequest,

      activeOrderItem: null,

      awaitingDecision: true,

      currentStep: "NEXT_ITEM",

      response: {
        step: "NEXT_ITEM",

        message: `${activeItem.product} has been added successfully.`,

        question: "Would you like to order another product?",

        items: orderRequest.items,
      },
    };
  }
}
