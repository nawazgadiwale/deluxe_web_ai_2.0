import ProductResolver from "../../catalog/ProductResolver.js";
import ORDER_ACTIONS from "../helpers/OrderTypes.js";

const productResolver = new ProductResolver();

export default class OrderExtractor {
  async extract(state) {
    const action = await this.extractAction(state);

    if (action) {
      return action;
    }

    const form = this.extractForm(state);

    if (form) {
      return form;
    }

    return this.extractOrder(state);
  }

  /*
   * =====================================================
   * UI Actions
   * =====================================================
   */

  async extractAction(state) {
    // console.log("ACTION RECEIVED:", state.action);

    const id = (state.action?.id ?? "").toUpperCase();

    // console.log("Normalized Action ID:", id);

    if (!id) {
      const message = (state.userMessage ?? "").trim().toLowerCase();

      // console.log("Switch id =", id);

      switch (message) {
        case "review":
        case "review order":
        case "checkout":
          return {
            action: ORDER_ACTIONS.REVIEW_ORDER,
            items: [],
          };

        case "confirm":
        case "confirm order":
        case "place order":
        case "submit":
          return {
            action: ORDER_ACTIONS.CONFIRM_ORDER,
            items: [],
          };

        case "cancel":
        case "cancel order":
          return {
            action: ORDER_ACTIONS.CANCEL_ORDER,
            items: [],
          };

        case "clear":
        case "clear order":
          return {
            action: ORDER_ACTIONS.CLEAR_ORDER,
            items: [],
          };

        default:
          return null;
      }
    }

    switch (id) {
      /*
       * =====================================================
       * Start Order
       * =====================================================
       */

      case "START_ORDER": {
        const productName = state.action?.payload?.product;

        if (!productName) {
          return {
            action: null,
            items: [],
          };
        }

        const product = await productResolver.resolve(productName);

        if (!product) {
          return {
            action: null,
            items: [],
          };
        }

        const metadata = product.metadata ?? {};

        return {
          action: ORDER_ACTIONS.ADD_ITEM,

          items: [
            {
              product: metadata.product,

              mainCategory: metadata.mainCategory,

              subCategory: metadata.subCategory,

              specifications:
                metadata.requiredFields ?? metadata.specifications ?? {},
            },
          ],
        };
      }

      case "ADD_MORE_ITEMS":
      case "ADD_MORE_PRODUCTS":
        return {
          action: ORDER_ACTIONS.ADD_MORE_PRODUCTS,
          items: [],
        };

      case "ADD_RELATED_PRODUCT":
        return {
          action: ORDER_ACTIONS.ADD_RELATED_PRODUCT,
          items: [],
        };

      case "CONTINUE_ORDER":
        return {
          action: ORDER_ACTIONS.CONTINUE_ORDER,
          items: [],
        };
      case "REVIEW":
      case "REVIEW_ORDER":
        return {
          action: ORDER_ACTIONS.REVIEW_ORDER,
          items: [],
        };

      case "CONFIRM":
      case "CONFIRM_ORDER":
        return {
          action: ORDER_ACTIONS.CONFIRM_ORDER,
          items: [],
        };

      case "CANCEL":
      case "CANCEL_ORDER":
        return {
          action: ORDER_ACTIONS.CANCEL_ORDER,
          items: [],
        };

      case "CLEAR":
      case "CLEAR_ORDER":
        return {
          action: ORDER_ACTIONS.CLEAR_ORDER,
          items: [],
        };

      default:
        return null;
    }
  }

  /*
   * =====================================================
   * Form Submission
   * =====================================================
   */

  extractForm(state) {
    const actionId = state.action?.id;

    if (
      !["submit", "SUBMIT_ORDER", ORDER_ACTIONS.SUBMIT_ORDER_FORM].includes(
        actionId,
      )
    ) {
      return null;
    }

    const form = state.action?.payload;

    if (!form || typeof form !== "object") {
      return null;
    }

    const currentProduct =
      state.orderContext?.items?.at(-1)?.product ?? form.product ?? null;

    if (!currentProduct) {
      throw new Error("No active product found for submitted order form.");
    }

    return {
      action: ORDER_ACTIONS.UPDATE_ITEM,
      items: [
        {
          product: currentProduct,
          form,
        },
      ],
    };
  }

  /*
   * =====================================================
   * New Order (Natural Language)
   * =====================================================
   */

  async extractOrder(state) {
    const message = state.userMessage?.trim();

    if (!message) {
      return {
        action: null,
        items: [],
      };
    }

    const normalized = message
      .toLowerCase()
      .replace(/^i want to order\s+/i, "")
      .replace(/^i want\s+/i, "")
      .replace(/^order\s+/i, "")
      .replace(/^buy\s+/i, "")
      .replace(/^purchase\s+/i, "")
      .replace(/^get\s+/i, "")
      .trim();

    const product = await productResolver.resolve(normalized);

    if (!product) {
      return {
        action: null,
        items: [],
      };
    }

    const metadata = product.metadata ?? {};

    return {
      action: ORDER_ACTIONS.ADD_ITEM,

      items: [
        {
          product: metadata.product,

          mainCategory: metadata.mainCategory,

          subCategory: metadata.subCategory,

          specifications:
            metadata.requiredFields ?? metadata.specifications ?? {},
        },
      ],
    };
  }
}
