export default class ComparisonValidator {
  validate(result) {
    if (!result) {
      return {
        type: "comparison",

        summary: "Please select at least two products to compare.",

        products: [],

        actions: [],
      };
    }

    return {
      type: "comparison",

      summary: result.llm,

      products: result.products.map((item) => ({
        name: item.metadata.product,

        category: item.metadata.mainCategory,

        subCategory: item.metadata.subCategory,

        description: item.content ?? item.pageContent ?? "",

        specifications: item.metadata.specifications ?? {},

        materials: item.metadata.materials ?? [],

        finishes: item.metadata.finishes ?? [],

        sizes: item.metadata.availableSizes ?? item.metadata.sizes ?? [],

        minimumOrder: item.metadata.minimumOrder,

        leadTime: item.metadata.leadTime,

        artworkRequired: item.metadata.artworkRequired ?? false,
      })),

      actions: [
        {
          id: "REQUEST_QUOTE",

          label: "Request Quote",

          payload: {
            products: result.products.map((p) => p.metadata.product),
          },
        },

        {
          id: "CONTACT_SALES",

          label: "Talk to Expert",

          payload: {
            products: result.products.map((p) => p.metadata.product),
          },
        },
      ],
    };
  }
}
