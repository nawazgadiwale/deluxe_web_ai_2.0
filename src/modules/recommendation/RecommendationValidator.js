// // updated
// import CatalogService from "../catalog/CatalogService.js";

// const catalogService = new CatalogService();

// export default class RecommendationValidator {
//   async validate(llmResponse, catalogMatches = []) {
//     llmResponse ??= {};

//     // /* Build LLM Explanation Map
//     const explanations = new Map();

//     for (const item of llmResponse.reasons ?? []) {
//       if (!item?.product) continue;

//       explanations.set(item.product.toLowerCase(), {
//         reason: item.reason,
//         priority: Number(item.priority ?? 999),
//       });
//     }

//     // /* Remove Duplicate Products
//     const uniqueProducts = new Map();

//     for (const match of catalogMatches) {
//       const product = match.metadata?.product;

//       if (!product) continue;

//       const key = product.toLowerCase();

//       if (!uniqueProducts.has(key)) {
//         uniqueProducts.set(key, match);
//       }
//     }

//     // /* Build Response
//     const products = [];

//     for (const match of uniqueProducts.values()) {
//       const metadata = match.metadata ?? {};

//       const productName = metadata.product;

//       if (!productName) continue;

//       let catalogProduct = match;

//       // Fallback if retrieval returned partial metadata
//       if (!catalogProduct.metadata.relatedProducts) {
//         catalogProduct =
//           (await catalogService.findProductByName(productName)) ?? match;
//       }

//       const explanation = explanations.get(productName.toLowerCase()) ?? {};

//       products.push({
//         product: catalogProduct.metadata.product,

//         reason:
//           explanation.reason ?? "Suitable for your business requirements.",

//         relatedProducts: catalogProduct.metadata.relatedProducts ?? [],

//         frequentlyBoughtWith:
//           catalogProduct.metadata.frequentlyBoughtWith ?? [],

//         actions: [
//           {
//             id: "SHOW_PRODUCT_DETAILS",

//             label: "Show More",

//             value: "SHOW_PRODUCT_DETAILS",

//             payload: {
//               product: catalogProduct.metadata.product,
//             },
//           },
//           {
//             id: "ORDER_PRODUCT",

//             label: "Order",

//             value: "ORDER_PRODUCT",

//             payload: {
//               product: catalogProduct.metadata.product,
//             },
//           },
//         ],

//         priority: explanation.priority ?? 999,
//       });
//     }

//     // /* Sort by LLM Priority
//     products.sort((a, b) => a.priority - b.priority);

//     // /* Remove Internal Priority
//     const finalProducts = products.map(({ priority, ...product }) => product);

//     // /* Response
//     return {
//       summary:
//         llmResponse.summary ??
//         "Here are the most relevant products for your business.",

//       followUpQuestion:
//         llmResponse.followUpQuestion ??
//         "Would you like to know more about any of these products?",

//       products: finalProducts,
//     };
//   }
// }

// updated without duplicate products
export default class RecommendationValidator {
  async validate({ llm = {}, products = [], mode = "RECOMMENDATION" }) {
    /*
     * =====================================================
     * PRODUCT DETAILS
     * =====================================================
     */

    if (mode === "PRODUCT_DETAILS") {
      const item = products[0];

      if (!item) {
        return {
          summary: "Product not found.",
          followUpQuestion: "",
          products: [],
        };
      }

      const metadata = item.metadata ?? {};

      return {
        summary: llm.summary,

        followUpQuestion:
          llm.followUpQuestion ?? "Would you like to order this product?",

        products: [
          {
            product: metadata.product,

            reason: llm.summary,

            relatedProducts: metadata.relatedProducts ?? [],

            frequentlyBoughtWith: metadata.frequentlyBoughtWith ?? [],

            actions: [
              {
                id: "ORDER_PRODUCT",
                label: "Order",
                value: "ORDER_PRODUCT",
                payload: {
                  product: metadata.product,
                },
              },
            ],
          },
        ],
      };
    }

    /*
     * =====================================================
     * LLM Reasons
     * =====================================================
     */

    const reasonMap = new Map();

    for (const item of llm.reasons ?? []) {
      if (!item?.product) continue;

      reasonMap.set(item.product.toLowerCase(), item.reason);
    }

    /*
     * =====================================================
     * Build Products
     * =====================================================
     */
    const responseProducts = products.map((item, index) => {
      const metadata = item.metadata ?? {};

      const llmReason = reasonMap.get(metadata.product?.toLowerCase());

      return {
        product: metadata.product,

        // Needed by OrderExtractor
        mainCategory: metadata.mainCategory,
        subCategory: metadata.subCategory,

        // Useful for Product Details
        description: item.content,

        reason: llmReason ?? this.buildCatalogReason(metadata),

        relatedProducts: metadata.relatedProducts ?? [],

        frequentlyBoughtWith: metadata.frequentlyBoughtWith ?? [],

        actions: [
          {
            id: "SHOW_PRODUCT_DETAILS",
            label: "Show More",
            value: "SHOW_PRODUCT_DETAILS",
            payload: {
              product: metadata.product,
            },
          },
          {
            id: "ORDER_PRODUCT",
            label: "Order",
            value: "ORDER_PRODUCT",
            payload: {
              product: metadata.product,
            },
          },
        ],

        priority: index + 1,
      };
    });

    return {
      summary: llm.summary ?? "Here are the recommended products.",

      followUpQuestion:
        llm.followUpQuestion ??
        "Would you like to know more about any of these products?",

      products: responseProducts.map(({ priority, ...product }) => product),
    };
  }

  /*
   * =====================================================
   * Catalog Fallback Reason
   * =====================================================
   */

  buildCatalogReason(metadata = {}) {
    const business = metadata.businessTypes?.slice(0, 2).join(", ");

    const goal = metadata.customerGoals?.slice(0, 2).join(", ");

    const useCase = metadata.useCases?.[0];

    if (business && goal) {
      return `Ideal for ${business} businesses to support ${goal.toLowerCase()}.`;
    }

    if (business) {
      return `Suitable for ${business} businesses.`;
    }

    if (goal) {
      return `Helps improve ${goal.toLowerCase()}.`;
    }

    if (useCase) {
      return `Recommended for ${useCase.toLowerCase()}.`;
    }

    return "Suitable for your business requirements.";
  }
}
