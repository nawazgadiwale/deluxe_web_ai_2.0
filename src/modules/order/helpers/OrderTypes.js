const ORDER_ACTIONS = Object.freeze({
  /*
   * =====================================================
   * Order
   * =====================================================
   */

  ADD_ITEM: "ADD_ITEM",

  UPDATE_ITEM: "UPDATE_ITEM",

  REMOVE_ITEM: "REMOVE_ITEM",

  REVIEW_ORDER: "REVIEW_ORDER",

  CONFIRM_ORDER: "CONFIRM_ORDER",

  CANCEL_ORDER: "CANCEL_ORDER",

  CLEAR_ORDER: "CLEAR_ORDER",

  SUBMIT_ORDER_FORM: "SUBMIT_ORDER_FORM",

  /*
   * =====================================================
   * Conversation
   * =====================================================
   */

  CONTINUE_ORDER: "CONTINUE_ORDER",

  ADD_RELATED_PRODUCT: "ADD_RELATED_PRODUCT",

  ADD_MORE_PRODUCTS: "ADD_MORE_PRODUCTS",

  /*
   * =====================================================
   * Item Updates
   * =====================================================
   */

  UPDATE_QUANTITY: "UPDATE_QUANTITY",

  UPDATE_ARTWORK: "UPDATE_ARTWORK",

  UPDATE_DESIGN_REQUIREMENTS: "UPDATE_DESIGN_REQUIREMENTS",

  UPDATE_DEADLINE: "UPDATE_DEADLINE",

  UPDATE_SPECIFICATION: "UPDATE_SPECIFICATION",

  UPDATE_NOTES: "UPDATE_NOTES",

  /*
   * =====================================================
   * Customer
   * =====================================================
   */

  UPDATE_CUSTOMER: "UPDATE_CUSTOMER",
});

export default ORDER_ACTIONS;
