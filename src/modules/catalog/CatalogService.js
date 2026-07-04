// import fs from "node:fs/promises";
// import path from "node:path";
// import Fuse from "fuse.js";
// export default class CatalogService {
//   catalog = [];

//   productFuse = null;

//   initialized = false;

//   async load() {
//     if (this.initialized) {
//       return;
//     }

//     const file = await fs.readFile(
//       path.resolve(
//         process.cwd(),
//         "src",
//         "data",
//         "productcatalog",
//         "catalog.json",
//       ),
//       "utf8",
//     );

//     const json = JSON.parse(file);

//     this.catalog = json.documents ?? [];

//     this.buildIndexes();

//     this.initialized = true;
//   }

//   // new build index for rich content

//   buildIndexes() {
//     const searchableProducts = this.catalog.map((document) => {
//       const metadata = document.metadata ?? {};

//       return {
//         ...document,

//         searchableText: [
//           // Core identity
//           metadata.product,
//           metadata.mainCategory,
//           metadata.subCategory,

//           // Description
//           document.content,

//           // Search metadata
//           ...(metadata.keywords ?? []),
//           ...(metadata.synonyms ?? []),
//           ...(metadata.tags ?? []),

//           // Business intelligence
//           ...(metadata.industries ?? []),
//           ...(metadata.businessTypes ?? []),
//           ...(metadata.useCases ?? []),
//           ...(metadata.customerGoals ?? []),

//           // Cross-selling
//           ...(metadata.relatedProducts ?? []),
//           ...(metadata.frequentlyBoughtWith ?? []),
//         ]
//           .filter(Boolean)
//           .join(" "),
//       };
//     });

//     this.productFuse = new Fuse(searchableProducts, {
//       includeScore: true,

//       shouldSort: true,

//       ignoreLocation: true,

//       threshold: 0.35,

//       minMatchCharLength: 2,

//       keys: [
//         {
//           name: "metadata.product",
//           weight: 0.35,
//         },

//         {
//           name: "metadata.keywords",
//           weight: 0.18,
//         },

//         {
//           name: "metadata.synonyms",
//           weight: 0.12,
//         },

//         {
//           name: "metadata.businessTypes",
//           weight: 0.1,
//         },

//         {
//           name: "metadata.industries",
//           weight: 0.08,
//         },

//         {
//           name: "metadata.customerGoals",
//           weight: 0.07,
//         },

//         {
//           name: "metadata.useCases",
//           weight: 0.05,
//         },

//         {
//           name: "metadata.relatedProducts",
//           weight: 0.03,
//         },

//         {
//           name: "metadata.frequentlyBoughtWith",
//           weight: 0.02,
//         },

//         {
//           name: "content",
//           weight: 0.15,
//         },

//         {
//           name: "searchableText",
//           weight: 0.05,
//         },
//       ],
//     });
//   }
//   async searchProducts(query, limit = 5) {
//     await this.load();

//     if (!query?.trim()) {
//       return [];
//     }

//     return this.productFuse
//       .search(query)
//       .filter((result) => result.score <= 0.45)
//       .sort((a, b) => a.score - b.score)
//       .slice(0, limit)
//       .map((result) => ({
//         ...result.item,

//         metadata: {
//           ...result.item.metadata,

//           score: 1 - result.score,
//         },
//       }));
//   }

//   async findProductByName(name) {
//     await this.load();

//     if (!name) {
//       return null;
//     }

//     const result = this.productFuse.search(name);

//     if (!result.length) {
//       return null;
//     }

//     if (result[0].score > 0.35) {
//       return null;
//     }

//     return result[0].item;
//   }

//   async productExists(name) {
//     return (await this.findProductByName(name)) !== null;
//   }

//   async getRequiredFields(name) {
//     const product = await this.findProductByName(name);

//     return product?.metadata?.requiredFields ?? [];
//   }

//   async getSpecifications(name) {
//     const product = await this.findProductByName(name);

//     return product?.metadata?.specifications ?? {};
//   }

//   async getProduct(name) {
//     return this.findProductByName(name);
//   }

//   async getAllProducts() {
//     await this.load();

//     return this.catalog;
//   }

//   async getProductDescription(name) {
//     const product = await this.findProductByName(name);

//     return product?.content ?? "";
//   }

//   async getProductMetadata(name) {
//     const product = await this.findProductByName(name);

//     return product?.metadata ?? {};
//   }

//   //  new helper methods
//   findProductsByBusinessType(type) {
//     if (!type) return [];

//     const search = type.toLowerCase();

//     return this.catalog.filter((item) =>
//       (item.metadata?.businessTypes ?? []).some(
//         (value) => value.toLowerCase() === search,
//       ),
//     );
//   }

//   findProductsByIndustry(industry) {
//     if (!industry) return [];

//     const search = industry.toLowerCase();

//     return this.catalog.filter((item) =>
//       (item.metadata?.industries ?? []).some(
//         (value) => value.toLowerCase() === search,
//       ),
//     );
//   }

//   findRelatedProducts(productName) {
//     const product = this.catalog.find(
//       (item) =>
//         item.metadata?.product?.toLowerCase() === productName?.toLowerCase(),
//     );

//     return product?.metadata?.relatedProducts ?? [];
//   }

//   findFrequentlyBoughtWith(productName) {
//     const product = this.catalog.find(
//       (item) =>
//         item.metadata?.product?.toLowerCase() === productName?.toLowerCase(),
//     );

//     return product?.metadata?.frequentlyBoughtWith ?? [];
//   }
// }

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

    this.buildIndexes();

    this.initialized = true;
  }

  /*
   * =====================================================
   * Build Fuse Index
   * =====================================================
   */

  buildIndexes() {
    this.productFuse = new Fuse(this.catalog, {
      includeScore: true,

      shouldSort: true,

      ignoreLocation: true,

      threshold: 0.35,

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
          name: "content",
          weight: 0.1,
        },
      ],
    });
  }

  /*
   * =====================================================
   * Exact Product Lookup
   * =====================================================
   */

  async findExactProduct(name) {
    await this.load();

    if (!name) {
      return null;
    }

    const search = name.trim().toLowerCase();

    return (
      this.catalog.find(
        (item) => item.metadata?.product?.toLowerCase() === search,
      ) ?? null
    );
  }

  /*
   * =====================================================
   * Product Lookup
   * Exact -> Fuse
   * =====================================================
   */

  async findProductByName(name) {
    await this.load();

    const exact = await this.findExactProduct(name);

    if (exact) {
      return exact;
    }

    const results = this.productFuse.search(name);

    if (!results.length) {
      return null;
    }

    if (results[0].score > 0.3) {
      return null;
    }

    return results[0].item;
  }

  /*
   * =====================================================
   * Product Search
   * Used for Recommendations
   * =====================================================
   */

  async searchProducts(query, limit = 5) {
    await this.load();

    if (!query?.trim()) {
      return [];
    }

    return this.productFuse
      .search(query)
      .filter((r) => r.score <= 0.45)
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
   * Helpers
   * =====================================================
   */

  async productExists(name) {
    return (await this.findProductByName(name)) !== null;
  }

  async getProduct(name) {
    return this.findProductByName(name);
  }

  async getAllProducts() {
    await this.load();

    return this.catalog;
  }

  async findExactProduct(name) {
    await this.load();

    if (!name?.trim()) {
      return null;
    }

    const search = name.trim().toLowerCase();

    return (
      this.catalog.find(
        (item) => item.metadata?.product?.toLowerCase() === search,
      ) ?? null
    );
  }
}
