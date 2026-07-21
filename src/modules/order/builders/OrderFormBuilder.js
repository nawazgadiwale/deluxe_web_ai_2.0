import OrderFormService from "./OrderFormService.js";
import CatalogService from "../../catalog/CatalogService.js";

const formService = new OrderFormService();
const catalogService = new CatalogService();

export default class OrderFormBuilder {
  /*
   * =====================================================
   * Build
   * =====================================================
   */

  async build(orderItem) {
    if (!orderItem?.product) {
      return null;
    }

    const product = await catalogService.getProduct(orderItem.product);

    if (!product) {
      return null;
    }

    const metadata = product.metadata ?? {};

    return {
      success: true,

      type: "order_form",

      title: metadata.product,

      product: {
        product: metadata.product,
        mainCategory: metadata.mainCategory,
        subCategory: metadata.subCategory,
      },

      sections: formService.build(product),

      actions: this.buildActions(),
    };
  }

  /*
   * =====================================================
   * Actions
   * =====================================================
   */

  buildActions() {
    return [
      {
        id: "submit",
        type: "submit",
        label: "Submit Order",
      },
      {
        id: "cancel",
        type: "cancel",
        label: "Cancel",
      },
    ];
  }
}
