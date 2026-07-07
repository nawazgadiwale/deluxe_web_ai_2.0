export default class DiscoveryValidator {
  validate(result = {}) {
    return {
      summary:
        result.products.length > 0
          ? `I found ${result.products.length} matching products.`
          : "I couldn't find any matching products.",

      followUpQuestion:
        result.products.length > 0
          ? "Select a product to view more details."
          : "",

      products: result.products.map((item) => ({
        product: item.product,

        mainCategory: item.mainCategory,

        subCategory: item.subCategory,

        description: item.description,

        relatedProducts: item.metadata.relatedProducts ?? [],

        frequentlyBoughtWith: item.metadata.frequentlyBoughtWith ?? [],

        actions: [
          {
            id: "SHOW_PRODUCT_DETAILS",
            label: "Show More",
            payload: {
              product: item.product,
            },
          },
        ],
      })),
    };
  }
}
