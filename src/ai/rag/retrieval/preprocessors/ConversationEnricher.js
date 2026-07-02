export default class ConversationEnricher {
  enrich(query = {}, conversation = {}) {
    const {
      extractedOrder = {},
      selectedProduct = null,
      selectedCategory = null,
      selectedSubCategory = null,
      recentMessages = [],
    } = conversation;

    // Safe defaults
    const entities = query.entities ?? {};
    const filters = query.filters ?? {};

    const enrichedEntities = {
      ...entities,

      mainCategory:
        extractedOrder.mainCategory ??
        selectedCategory ??
        null,

      subCategory:
        extractedOrder.subCategory ??
        selectedSubCategory ??
        null,

      product:
        extractedOrder.product ??
        selectedProduct ??
        null,

      quantity:
        entities.quantity ??
        extractedOrder.quantity ??
        null,

      finish:
        extractedOrder.finish ??
        null,

      material:
        extractedOrder.material ??
        null,

      size:
        extractedOrder.size ??
        null,

      gsm:
        extractedOrder.gsm ??
        null,

      lamination:
        extractedOrder.lamination ??
        null,
    };

    const history = recentMessages
      .slice(-5)
      .map((message) => message.content)
      .join(" ");

    const enrichedQuery = [
      enrichedEntities.mainCategory,
      enrichedEntities.subCategory,
      enrichedEntities.product,
      query.normalizedQuery ?? query.query ?? "",
      history,
    ]
      .filter(Boolean)
      .join(" ");

    return {
      ...query,

      enrichedQuery,

      entities: enrichedEntities,

      filters: {
        ...filters,

        mainCategory: enrichedEntities.mainCategory,

        subCategory: enrichedEntities.subCategory,

        product: enrichedEntities.product,
      },
    };
  }
}