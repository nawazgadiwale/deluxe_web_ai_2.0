export default class ProductDetailsValidator {
  validate(result) {
    if (!result) {
      return {
        type: "product_details",

        summary: "Sorry, I couldn't find that product.",

        product: null,

        actions: [],
      };
    }

    const metadata = result.metadata ?? {};

    return {
      type: "product_details",

      summary: result.llm,

      product: {
        name: metadata.product,

        category: metadata.mainCategory,

        subCategory: metadata.subCategory,

        description: result.description,

        specifications: metadata.specifications ?? {},

        availableSizes: metadata.availableSizes ?? metadata.sizes ?? [],

        materials: metadata.materials ?? [],

        finishes: metadata.finishes ?? [],

        applications: metadata.useCases ?? [],

        minimumOrder: metadata.minimumOrder ?? null,

        leadTime: metadata.leadTime ?? null,

        artworkRequired: metadata.artworkRequired ?? false,

        templates: metadata.templates ?? [],

        faqs: metadata.faqs ?? [],

        relatedProducts: metadata.relatedProducts ?? [],

        frequentlyBoughtWith: metadata.frequentlyBoughtWith ?? [],
      },

      actions: [
        {
          id: "COMPARE_PRODUCT",
          label: "Compare",

          payload: {
            product: metadata.product,
          },
        },

        {
          id: "REQUEST_QUOTE",
          label: "Request Quote",

          payload: {
            product: metadata.product,
          },
        },

        {
          id: "CONTACT_SALES",
          label: "Talk to Expert",

          payload: {
            product: metadata.product,
          },
        },
      ],
    };
  }
}
