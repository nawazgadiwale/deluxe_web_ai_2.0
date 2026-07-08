import fs from "node:fs/promises";
import path from "node:path";
import Fuse from "fuse.js";

export default class CatalogService {
  catalog = [];

  productFuse = null;

  initialized = false;

  /*
   * =====================================================
   * Load Catalog
   * =====================================================
   */

  async load() {
    if (this.initialized) {
      return;
    }

    const file = await fs.readFile(
      path.resolve(
        process.cwd(),
        "src",
        "data",
        "productcatalog",
        "catalog.json",
      ),
      "utf8",
    );

    const json = JSON.parse(file);

    this.catalog = json.documents ?? [];
    console.log("Catalog Size:", this.catalog.length);

    console.log("First Product:", this.catalog[0]?.metadata?.product);

    this.buildIndexes();

    this.initialized = true;
  }

  /*
   * =====================================================
   * Fuse Index
   * =====================================================
   */

  buildIndexes() {
    this.productFuse = new Fuse(this.catalog, {
      includeScore: true,
      shouldSort: true,
      ignoreLocation: true,
      threshold: 0.5,
      minMatchCharLength: 2,

      keys: [
        {
          name: "metadata.product",
          weight: 0.45,
        },
        {
          name: "metadata.synonyms",
          weight: 0.2,
        },
        {
          name: "metadata.keywords",
          weight: 0.15,
        },
        {
          name: "metadata.tags",
          weight: 0.1,
        },
        {
          name: "metadata.businessTypes",
          weight: 0.05,
        },
        {
          name: "metadata.industries",
          weight: 0.03,
        },
        {
          name: "content",
          weight: 0.02,
        },
      ],
    });
  }

  /*
   * =====================================================
   * Normalize
   * =====================================================
   */

  normalize(value = "") {
    return value
      .toLowerCase()
      .replace(/&/g, "and")
      .replace(/[-_/]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  /*
   * =====================================================
   * Exact Product
   *
   * Used ONLY by UI buttons.
   * Never performs fuzzy search.
   * =====================================================
   */
  async getProductByAction(productName) {
    await this.load();

    if (!productName) {
      return null;
    }

    const search = this.normalize(productName);

    for (const product of this.catalog) {
      const metadata = product.metadata ?? {};

      const title = this.normalize(metadata.product ?? "");

      if (title === search) {
        return product;
      }

      if (title.includes(search) || search.includes(title)) {
        return product;
      }

      if (
        (metadata.synonyms ?? []).some(
          (item) => this.normalize(item) === search,
        )
      ) {
        return product;
      }
    }

    return null;
  }

  /*
   * =====================================================
   * Exact Lookup
   * =====================================================
   */

  async findExactProduct(productName) {
    return this.getProductByAction(productName);
  }

  /*
   * =====================================================
   * Natural Language Lookup
   *
   * User typed:
   *  visiting card
   *  business cards
   *  roll up banner
   *
   * =====================================================
   */

  async findProductByName(query) {
    await this.load();

    if (!query?.trim()) {
      return null;
    }

    /*
     * Exact first
     */

    const exact = await this.getProductByAction(query);

    if (exact) {
      return exact;
    }

    /*
     * Fuzzy Search
     */

    const results = this.productFuse.search(query);

    if (!results.length) {
      return null;
    }

    /*
     * Ignore weak matches
     */

    if (results[0].score > 0.22) {
      return null;
    }

    return results[0].item;
  }

  /*
   * =====================================================
   * Recommendation Search
   * =====================================================
   */

  async searchProducts(query, limit = 5) {
    await this.load();

    if (!query?.trim()) {
      return [];
    }

    query = this.normalize(query);

    query = query
      .replace(/\bi need\b/g, "")
      .replace(/\bi want\b/g, "")
      .replace(/\bshow me\b/g, "")
      .replace(/\bgive me\b/g, "")
      .replace(/\blooking for\b/g, "")
      .replace(/\bplease\b/g, "")
      .trim();

    const results = this.productFuse.search(query);

    console.log("Search:", query);
    console.log(results.slice(0, 5));

    return results
      .filter((r) => r.score <= 0.55)
      .sort((a, b) => a.score - b.score)
      .slice(0, limit)
      .map((r) => ({
        ...r.item,

        metadata: {
          ...r.item.metadata,
          score: 1 - r.score,
        },
      }));
  }

  /*
   * =====================================================
   * Related Products
   * =====================================================
   */

  async getRelatedProducts(productName) {
    const product = await this.getProductByAction(productName);

    if (!product) {
      return [];
    }

    return product.metadata.relatedProducts ?? [];
  }

  /*
   * =====================================================
   * Frequently Bought Together
   * =====================================================
   */

  async getFrequentlyBoughtWith(productName) {
    const product = await this.getProductByAction(productName);

    if (!product) {
      return [];
    }

    return product.metadata.frequentlyBoughtWith ?? [];
  }

  /*
   * =====================================================
   * Helpers
   * =====================================================
   */

  async getProduct(name) {
    return this.findProductByName(name);
  }

  async productExists(name) {
    return (await this.findProductByName(name)) !== null;
  }

  async getAllProducts() {
    await this.load();

    return this.catalog;
  }

  async getProductDescription(name) {
    const product = await this.findProductByName(name);

    return product?.content ?? "";
  }

  async getProductMetadata(name) {
    const product = await this.findProductByName(name);

    return product?.metadata ?? {};
  }

  async getRequiredFields(name) {
    const product = await this.findProductByName(name);

    return product?.metadata?.requiredFields ?? [];
  }

  async getSpecifications(name) {
    const product = await this.findProductByName(name);

    return product?.metadata?.specifications ?? {};
  }
}
