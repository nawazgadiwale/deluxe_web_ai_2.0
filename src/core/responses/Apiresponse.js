export default class ResponseBuilder {
  success({
    type = "text",
    message = null,
    data = null,
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

  recommendation(recommendation, metadata = {}) {
    return this.success({
      type: "recommendation",
      data: recommendation,
      actions: recommendation.actions ?? [],
      metadata,
    });
  }

  order(order, metadata = {}) {
    return this.success({
      type: "order",
      data: order,
      actions: order.actions ?? [],
      metadata,
    });
  }

  contact(contact, metadata = {}) {
    return this.success({
      type: "contact",
      data: contact,
      actions: contact.actions ?? [],
      metadata,
    });
  }

  support(response, metadata = {}) {
    return this.success({
      type: "support",
      data: response,
      actions: response.actions ?? [],
      metadata,
    });
  }

  faq(response, metadata = {}) {
    return this.success({
      type: "faq",
      data: response,
      actions: response.actions ?? [],
      metadata,
    });
  }

  quotation(quotation, metadata = {}) {
    return this.success({
      type: "quotation",
      data: quotation,
      actions: quotation.actions ?? [],
      metadata,
    });
  }

  text(message, actions = [], metadata = {}) {
    return this.success({
      type: "text",
      message,
      actions,
      metadata,
    });
  }
}
