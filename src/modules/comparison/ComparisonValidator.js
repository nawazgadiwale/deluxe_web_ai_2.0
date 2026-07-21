import { jsonrepair } from "jsonrepair";

export default class ComparisonValidator {
  validate(result) {
    /*
     * =====================================================
     * No Comparison
     * =====================================================
     */

    if (!result) {
      return {
        type: "comparison",

        summary: "Please select at least two products to compare.",

        comparison: [],

        recommendation: "",

        followUpQuestion: "",

        products: [],

        actions: [],
      };
    }

    /*
     * =====================================================
     * Parse LLM Output
     * =====================================================
     */

    let llm = result.llm;

    try {
      if (typeof llm === "string") {
        llm = JSON.parse(jsonrepair(llm));
      }
    } catch {
      llm = {};
    }

    /*
     * =====================================================
     * Normalize Comparison Rows
     * =====================================================
     */

    const comparison = Array.isArray(llm.comparison)
      ? llm.comparison.map((item) => ({
          attribute: item.attribute ?? "",

          product1: item.product1 ?? "",

          product2: item.product2 ?? "",
        }))
      : [];

    /*
     * =====================================================
     * Normalize Products
     * =====================================================
     */

    const products = (result.products ?? []).map((product) => ({
      name: product.metadata?.product ?? "",

      category: product.metadata?.mainCategory ?? "",

      subCategory: product.metadata?.subCategory ?? "",

      description: product.content ?? "",

      businessTypes: product.metadata?.businessTypes ?? [],

      industries: product.metadata?.industries ?? [],

      customerGoals: product.metadata?.customerGoals ?? [],

      applications: product.metadata?.useCases ?? [],

      relatedProducts: product.metadata?.relatedProducts ?? [],
    }));

    /*
     * =====================================================
     * Response
     * =====================================================
     */

    return {
      type: "comparison",

      summary:
        llm.summary ?? "Here's a comparison between the selected products.",

      comparison,

      recommendation: llm.recommendation ?? "",

      followUpQuestion: llm.followUpQuestion ?? "",

      products,

      actions: [
        {
          id: "REQUEST_QUOTE",

          label: "Request Quote",

          payload: {
            products: products.map((p) => p.name),
          },
        },

        ...products.map((product) => ({
          id: "START_ORDER",

          label: `Order ${product.name}`,

          payload: {
            product: product.name,
          },
        })),

        {
          id: "CONTACT_SALES",

          label: "Talk to Expert",

          payload: {
            products: products.map((p) => p.name),
          },
        },
      ],
    };
  }
}
