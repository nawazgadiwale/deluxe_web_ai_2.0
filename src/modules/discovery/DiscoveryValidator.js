export default class DiscoveryValidator {
  validate(result = {}) {
    const products = result.products ?? [];

    console.log(products)

    return {
      summary:
        products.length > 0
          ? `I found ${products.length} matching products.`
          : "I couldn't find any matching products.",

      followUpQuestion:
        products.length > 0 ? "Select a product to view more details." : "",

      products: products.map((item) => ({
        product: item.product,

        mainCategory: item.mainCategory,

        subCategory: item.subCategory,

        description: item.description ?? "",

        relatedProducts: item.metadata?.relatedProducts ?? [],

        frequentlyBoughtWith: item.metadata?.frequentlyBoughtWith ?? [],

        actions: [
          {
            id: "SHOW_PRODUCT_DETAILS",
            label: "View details",
            payload: {
              product: item.product,
            },
          },
        ],
      })),
    };
  }
}
