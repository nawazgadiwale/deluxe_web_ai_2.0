export default class ResponseBuilder {
  /*
   * =====================================================
   * Base Response
   * =====================================================
   */

  success({
    type = "text",
    message = null,
    data = {},
    actions = [],
    metadata = {},
  } = {}) {
    return {
      success: true,
      type,
      message,
      data,
      actions,
      metadata,
    };
  }

  /*
   * =====================================================
   * Recommendation
   * =====================================================
   */

  recommendation(data, metadata = {}) {
    return this.success({
      type: "recommendation",
      data,
      actions: data?.actions ?? [],
      metadata,
    });
  }

  /*
   * =====================================================
   * Product Details
   * (same renderer as recommendation)
   * =====================================================
   */

  productDetails(data, metadata = {}) {
    return this.success({
      type: "recommendation",
      data,
      actions: data?.actions ?? [],
      metadata,
    });
  }

  /*
   * =====================================================
   * Order
   * =====================================================
   */

  order(data, metadata = {}) {
    return this.success({
      type: "order",
      data,
      actions: data?.actions ?? [],
      metadata,
    });
  }

  /*
  *comparison 
  */
  comparison(data) {
    return {
      type: "comparison",

      summary: data.summary,

      comparison: data.comparison,

      products: data.products,

      actions: data.actions ?? [],
    };
  }

  /*
   * =====================================================
   * Lead
   * =====================================================
   */

  lead(data, metadata = {}) {
    return this.success({
      type: "lead",
      data,
      actions: data?.actions ?? [],
      metadata,
    });
  }

  /*
   * =====================================================
   * FAQ
   * =====================================================
   */

  faq(data, metadata = {}) {
    return this.success({
      type: "faq",
      data,
      actions: data?.actions ?? [],
      metadata,
    });
  }

  /*
   * =====================================================
   * Support
   * =====================================================
   */

  support(data, metadata = {}) {
    return this.success({
      type: "support",
      data,
      actions: data?.actions ?? [],
      metadata,
    });
  }

  /*
   * =====================================================
   * Quotation
   * =====================================================
   */

  quotation(data, metadata = {}) {
    return this.success({
      type: "quotation",
      data,
      actions: data?.actions ?? [],
      metadata,
    });
  }

  /*
   * =====================================================
   * Text
   * =====================================================
   */

  text(message, actions = [], metadata = {}) {
    return this.success({
      type: "text",
      message,
      actions,
      metadata,
    });
  }

  /*
   * =====================================================
   * Error
   * =====================================================
   */

  error(message, metadata = {}) {
    return {
      success: false,
      type: "error",
      message,
      data: {},
      actions: [],
      metadata,
    };
  }
}
