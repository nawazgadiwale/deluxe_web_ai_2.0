import CatalogService from "./CatalogService.js";
import RAGPipeline from "../../ai/rag/retrieval/RagPipeline.js";
import { RECOMMENDATION_PATTERNS } from "../routing/utils/RoutingConstants.js";

const catalogService = new CatalogService();
const ragPipeline = new RAGPipeline();

export default class ProductResolver {
  /*
   * =====================================================
   * Resolve Single Product
   * =====================================================
   */

  async resolve(query, options = {}) {
    await catalogService.load();

    if (!query?.trim()) {
      return null;
    }

    /*
     * Exact Match
     */

    let product = await catalogService.getProductByAction(query);

    if (product) {
      return product;
    }

    /*
     * Fuzzy Match
     */

    product = await catalogService.findProductByName(query);

    if (product) {
      return product;
    }

    /*
     * Semantic Search
     */

    const retrieval = await ragPipeline.retrieve({
      query,
      options: {
        topK: options.topK ?? 3,
      },
    });

    for (const document of retrieval.documents ?? []) {
      const metadata = document.metadata ?? {};

      if (!metadata.product) {
        continue;
      }

      const resolved = await catalogService.getProductByAction(
        metadata.product,
      );

      if (resolved) {
        return resolved;
      }
    }

    return null;
  }

  /*
   * =====================================================
   * Resolve Multiple Products
   * =====================================================
   */

  async resolveMany(products = []) {
    const resolved = [];

    for (const name of products) {
      const product = await this.resolve(name);

      if (product) {
        resolved.push(product);
      }
    }

    return resolved;
  }

  /*
   * =====================================================
   * Extract Product Names
   * =====================================================
   */

  async extract(message) {
    return catalogService.extractProducts(message);
  }

  /*
   * =====================================================
   * Product Exists
   * =====================================================
   */

  async exists(name) {
    return (await this.resolve(name)) !== null;
  }

  /*
   * =====================================================
   * Resolve Catalog Context
   *
   * Used only by Routing
   * =====================================================
   */

  async resolveContext(message, state = {}) {
    await catalogService.load();

    const context = {
      intent: "none", // none | recommendation | product
      products: [],
      categories: [],
      subCategories: [],
      metadata: [],
    };

    if (!message?.trim()) {
      return context;
    }

    const normalized = message.toLowerCase();

    /*
     * =====================================================
     * Extract Products First
     * =====================================================
     */

    let productNames = await catalogService.extractProducts(message);

    /*
     * =====================================================
     * Recommendation Conversation
     * =====================================================
     */

    if (
      !productNames.length &&
      state?.recommendationContext?.products?.length
    ) {
      productNames = state.recommendationContext.products
        .map((p) => p.metadata?.product ?? p.name)
        .filter(Boolean);
    }

    /*
     * =====================================================
     * Semantic Product Search
     * =====================================================
     */

    const collectingRecommendation =
      state?.workflow === "RECOMMENDATION" && state?.awaitingDecision === true;

    if (!productNames.length && !collectingRecommendation) {
      const retrieval = await ragPipeline.retrieve({
        query: message,
        options: {
          topK: 3,
        },
      });

      for (const document of retrieval.documents ?? []) {
        if (typeof document.score === "number" && document.score > 0.95) {
          continue;
        }

        const metadata = document.metadata ?? {};

        if (metadata.product) {
          productNames.push(metadata.product);
        }
      }
    }

    /*
     * =====================================================
     * Remove Duplicates
     * =====================================================
     */

    productNames = [...new Set(productNames)];

    /*
     * =====================================================
     * Products Take Priority
     * =====================================================
     */

    if (productNames.length) {
      context.intent = "product";

      const products = await this.resolveMany(productNames);

      for (const product of products) {
        const metadata = product.metadata ?? {};

        if (metadata.product) {
          context.products.push(metadata.product);
        }

        if (metadata.mainCategory) {
          context.categories.push(metadata.mainCategory);
        }

        if (metadata.subCategory) {
          context.subCategories.push(metadata.subCategory);
        }

        context.metadata.push(metadata);
      }

      context.products = [...new Set(context.products)];
      context.categories = [...new Set(context.categories)];
      context.subCategories = [...new Set(context.subCategories)];

      return context;
    }

    /*
     * =====================================================
     * Recommendation Intent
     *
     * Only when NO products were found.
     * =====================================================
     */

    if (RECOMMENDATION_PATTERNS.some((pattern) => pattern.test(normalized))) {
      context.intent = "recommendation";
    }

    return context;
  }
}
