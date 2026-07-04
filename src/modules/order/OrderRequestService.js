import OrderRequestManager from "./OrderRequestManager.js";
import OrderRequestValidator from "./OrderRequestValidator.js";

const manager = new OrderRequestManager();
const validator = new OrderRequestValidator();

export default class OrderRequestService {
  async process(state) {
    let { orderRequest, activeItem, message, action } =
      this.restoreOrderState(state);

    /*
     * ===================================================
     * STEP 1 : Waiting For Next Item Decision
     * ===================================================
     */

    if (state.currentStep === "NEXT_ITEM") {
      return this.handleNextItemStep({
        state,
        orderRequest,
        activeItem,
        message,
        action,
      });
    }

    console.log("================================");
    console.log("ORDER REVIEW");
    console.log("Message :", message);
    console.log("Action  :", state.action);
    console.log("Resolved:", action);
    console.log("================================");

    /*
     * ===================================================
     * STEP 2 : Review Order
     * ===================================================
     */

    if (state.currentStep === "ORDER_REVIEW") {
      return this.handleReviewStep({
        state,
        orderRequest,
        activeItem,
        message,
        action,
      });
    }

    /*
     * ===================================================
     * STEP 3 : Customer Details
     * ===================================================
     */

    if (state.currentStep === "CUSTOMER_DETAILS") {
      return this.handleCustomerStep({
        state,
        orderRequest,
        activeItem,
      });
    }

    /*
     * ===================================================
     * STEP 4 : Product Collection
     * ===================================================
     */

    return this.handleProductCollection({
      state,
      orderRequest,
      activeItem,
    });
  }
  /*
   * ===================================================
   * Restore Working State
   * ===================================================
   */

  restoreOrderState(state) {
    const orderRequest = state.orderRequest ?? manager.createOrderRequest();

    const activeItem =
      state.activeOrderItem ?? orderRequest.activeOrderItem ?? null;

    return {
      orderRequest,

      activeItem,

      message: (state.userMessage ?? "").trim(),

      action: this.getAction(state),
    };
  }
  /*
   * ===================================================
   * STEP : ORDER REVIEW
   * ===================================================
   */

  handleReviewStep({ orderRequest, action, message }) {
    /*
     * ---------------------------------------
     * Confirm Order
     * ---------------------------------------
     */

    if (action === "CONFIRM_ORDER" || this.wantsConfirm(message)) {
      manager.updateStatus(orderRequest, "DRAFT");

      return this.buildState({
        status: "COLLECTING_CUSTOMER",

        orderRequest,

        activeOrderItem: null,

        awaitingDecision: false,

        currentStep: "CUSTOMER_DETAILS",

        response: {
          step: "CUSTOMER_DETAILS",

          message: "Perfect! Before I submit your order, I need a few details.",

          missingFields: ["name", "mobile", "email"],
        },
      });
    }

    /*
     * ---------------------------------------
     * Modify Order
     * ---------------------------------------
     */

    const wantsModify =
      action === "MODIFY_ORDER" ||
      [
        "modify",
        "change",
        "remove",
        "delete",
        "replace",
        "update",
        "edit",
        "quantity",
        "qty",
        "increase",
        "decrease",
        "cancel item",
      ].some((word) => message.toLowerCase().includes(word));

    if (wantsModify) {
      manager.updateStatus(orderRequest, "DRAFT");

      return this.buildState({
        status: "COLLECTING_ITEMS",

        orderRequest,

        activeOrderItem: null,

        awaitingDecision: false,

        currentStep: "COLLECT_PRODUCT",

        response: {
          step: "COLLECT_PRODUCT",

          message: "Sure! Tell me what you'd like to add, remove or modify.",
        },
      });
    }

    /*
     * ---------------------------------------
     * Invalid Reply
     * ---------------------------------------
     */

    return this.buildState({
      status: "ORDER_REVIEW",

      orderRequest,

      activeOrderItem: null,

      awaitingDecision: true,

      currentStep: "ORDER_REVIEW",

      response: {
        step: "ORDER_REVIEW",

        message: "Please review your order before continuing.",

        items: orderRequest.items,

        actions: this.getReviewActions(),
      },
    });
  }
  /*
   * ===================================================
   * STEP : CUSTOMER DETAILS
   * ===================================================
   */

  handleCustomerStep({ state, orderRequest }) {
    const customer = {
      ...orderRequest.customer,
      ...(state.extractedOrder?.customer ?? {}),
    };

    manager.updateCustomer(orderRequest, customer);

    if (manager.needsCustomerDetails(orderRequest)) {
      const missingFields = manager.getMissingCustomerFields(orderRequest);

      const nextField = manager.getNextCustomerField(orderRequest);

      return this.buildState({
        status: "COLLECTING_CUSTOMER",

        orderRequest,

        activeOrderItem: null,

        awaitingDecision: false,

        currentStep: "CUSTOMER_DETAILS",

        response: {
          step: "CUSTOMER_DETAILS",

          message: "I still need a few details before submitting your order.",

          missingFields,

          nextField,
        },
      });
    }

    /*
     * ---------------------------------------
     * Assign Salesperson
     * ---------------------------------------
     */

    manager.assignSalesPersonByCategory(orderRequest);

    manager.updateStatus(orderRequest, "SUBMITTED");

    return this.buildState({
      status: "COMPLETED",

      orderRequest,

      activeOrderItem: null,

      awaitingDecision: false,

      currentStep: null,

      response: {
        step: "ORDER_COMPLETED",

        message: `Thank you for choosing Deluxe Printing. Your order has been submitted successfully. One of our ${
          orderRequest.assignedTo?.name ?? "Sales"
        } experts will contact you shortly.`,

        customer: orderRequest.customer,

        assignedTo: orderRequest.assignedTo,

        items: orderRequest.items,
      },
    });
  }

  /*
   * ===================================================
   * STEP : PRODUCT COLLECTION
   * ===================================================
   */

  async handleProductCollection({ state, orderRequest, activeItem }) {
    if (!state.extractedOrder) {
      return this.buildState({
        status: "COLLECTING_ITEMS",
        orderRequest,
        activeOrderItem: activeItem,
        awaitingDecision: false,
        currentStep: state.currentStep,
        response: {
          step: state.currentStep,
          message: this.buildQuestion(state.currentStep?.toLowerCase()),
        },
      });
    }
    console.log("================================");
    console.log("Current Step:", state.currentStep);

    console.log("State Active Item");
    console.dir(state.activeOrderItem, {
      depth: null,
    });

    console.log("Extracted");
    console.dir(state.extractedOrder, {
      depth: null,
    });

    console.log("================================");

    /*
     * ---------------------------------------
     * Merge Extracted Data
     * ---------------------------------------
     */

    activeItem = manager.mergeActiveItem(activeItem, state.extractedOrder);

    console.log("Merged Item");

    console.dir(activeItem, {
      depth: null,
    });

    /*
     * ---------------------------------------
     * Validate Item
     * ---------------------------------------
     */

    const validation = await validator.validate(activeItem);

    if (!validation.valid) {
      const nextField = manager.getNextMissingField(validation);

      const normalized = manager.normalizeItem(activeItem);

      return this.buildState({
        status: "COLLECTING_ITEMS",

        orderRequest,

        activeOrderItem: normalized,

        awaitingDecision: false,

        currentStep: nextField ? nextField.toUpperCase() : null,

        response: {
          step: nextField ? nextField.toUpperCase() : null,

          message: this.buildQuestion(nextField),

          missingField: nextField,
        },
      });
    }

    /*
     * ---------------------------------------
     * Complete Item
     * ---------------------------------------
     */

    const completedItem = manager.completeItem(activeItem);

    orderRequest = manager.addOrUpdateItem(orderRequest, completedItem);

    manager.updateStatus(orderRequest, "DRAFT");

    orderRequest.activeOrderItem = null;

    return this.buildState({
      status: "WAITING_FOR_NEXT_ITEM",

      orderRequest,

      activeOrderItem: null,

      awaitingDecision: true,

      currentStep: "NEXT_ITEM",

      response: {
        step: "NEXT_ITEM",

        message: `${completedItem.product} has been added successfully.`,

        items: manager.buildSummary(orderRequest),

        actions: this.getNextItemActions(),
      },
    });
  }
  getNextItemActions() {
    return [
      {
        id: "ADD_ANOTHER_PRODUCT",
        label: "Add Another Product",
        value: "ADD_ANOTHER_PRODUCT",
      },
      {
        id: "REVIEW_ORDER",
        label: "Review Order",
        value: "REVIEW_ORDER",
      },
    ];
  }
  getReviewActions() {
    return [
      {
        id: "CONFIRM_ORDER",
        label: "Confirm Order",
        value: "CONFIRM_ORDER",
      },
      {
        id: "MODIFY_ORDER",
        label: "Modify Order",
        value: "MODIFY_ORDER",
      },
    ];
  }
  buildState({
    status,
    orderRequest,
    activeOrderItem = null,
    awaitingDecision = false,
    currentStep = null,
    response = {},
  }) {
    if (orderRequest) {
      orderRequest.activeOrderItem = activeOrderItem;
    }

    return {
      status,

      orderRequest,

      activeOrderItem,

      awaitingDecision,

      currentStep,

      response,
    };
  }

  /*
   * ===================================================
   * STEP : NEXT ITEM
   * ===================================================
   */

  handleNextItemStep({ orderRequest, action, message }) {
    /*
     * ---------------------------------------
     * Add Another Product
     * ---------------------------------------
     */

    if (action === "ADD_ANOTHER_PRODUCT" || this.isAffirmative(message)) {
      manager.updateStatus(orderRequest, "DRAFT");

      return this.buildState({
        status: "COLLECTING_ITEMS",

        orderRequest,

        activeOrderItem: null,

        awaitingDecision: false,

        currentStep: "COLLECT_PRODUCT",

        response: {
          step: "COLLECT_PRODUCT",

          message: "Sure! Which product would you like to add next?",
        },
      });
    }

    /*
     * ---------------------------------------
     * Review Order
     * ---------------------------------------
     */

    if (action === "REVIEW_ORDER" || this.wantsReview(message)) {
      return this.buildState({
        status: "ORDER_REVIEW",

        orderRequest,

        activeOrderItem: null,

        awaitingDecision: true,

        currentStep: "ORDER_REVIEW",

        response: {
          step: "ORDER_REVIEW",

          message: "Please review your order.",

          items: orderRequest.items,

          actions: this.getReviewActions(),
        },
      });
    }

    /*
     * ---------------------------------------
     * Invalid Reply
     * ---------------------------------------
     */

    return this.buildState({
      status: "WAITING_FOR_ACTION",

      orderRequest,

      activeOrderItem: null,

      awaitingDecision: true,

      currentStep: "NEXT_ITEM",

      response: {
        message: "Please choose to add another product or review your order.",

        actions: this.getNextItemActions(),
      },
    });
  }
  matches(message = "", keywords = []) {
    message = message.trim().toLowerCase();

    return keywords.some(
      (keyword) =>
        message === keyword ||
        message.startsWith(keyword) ||
        message.includes(keyword),
    );
  }
  isAffirmative(message) {
    return this.matches(message, [
      "yes",
      "yeah",
      "yep",
      "sure",
      "ok",
      "another",
      "add another",
      "one more",
    ]);
  }

  wantsReview(message) {
    return this.matches(message, [
      "review",
      "review order",
      "show order",
      "view order",
      "checkout",
      "finish",
      "done",
      "that's all",
      "thats all",
      "no",
      "no thanks",
    ]);
  }

  wantsConfirm(message) {
    return this.matches(message, [
      "confirm",
      "submit",
      "place order",
      "looks good",
      "all good",
      "proceed",
      "yes",
      "yep",
      "sure",
      "ok",
    ]);
  }

  getAction(state) {
    return state.action?.id ?? state.action?.value ?? null;
  }

  /*
   * ===================================================
   * Question Builder
   * ===================================================
   */

  buildQuestion(field) {
    const questions = {
      quantity: "How many units would you like to order?",

      deadline: "When do you need the order delivered?",

      artwork: "Do you already have the artwork ready?",

      size: "What size do you need?",

      material: "Which material would you prefer?",

      finish: "Which finish would you like?",

      color: "Which color do you need?",

      pages: "How many pages do you need?",

      gsm: "What GSM would you like?",

      printingSides: "Should it be single-sided or double-sided?",
    };

    return questions[field] ?? `Please provide ${field}.`;
  }
}
