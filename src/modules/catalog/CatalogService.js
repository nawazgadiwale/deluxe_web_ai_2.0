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
//       path.resolve(process.cwd(), "src/data/productcatalog/catalog.json"),
//       "utf8",
//     );

//     const json = JSON.parse(file);

//     this.catalog = json.documents ?? [];

//     this.productFuse = new Fuse(this.catalog, {
//       includeScore: true,
//       threshold: 0.35,
//       ignoreLocation: true,
//       keys: [
//         "metadata.product",
//         "metadata.mainCategory",
//         "metadata.subCategory",
//         "content",
//       ],
//     });

//     this.initialized = true;
//   }

//   async searchProducts(query, limit = 5) {
//     await this.load();

//     return this.productFuse
//       .search(query)
//       .slice(0, limit)
//       .map((x) => x.item);
//   }

//   async findProductByName(name) {
//     await this.load();

//     const result = this.productFuse.search(name);

//     return result.length ? result[0].item : null;
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

//   async getTopMatches(query, limit = 5) {
//     return this.searchProducts(query, limit);
//   }
// }

import fs from "node:fs/promises";
import path from "node:path";
import Fuse from "fuse.js";

export default class CatalogService {
  catalog = [];

  productFuse = null;

  initialized = false;

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

  buildIndexes() {
    const searchableProducts = this.catalog.map((document) => {
      const metadata = document.metadata ?? {};

      return {
        ...document,

        searchableText: [
          metadata.product,
          metadata.mainCategory,
          metadata.subCategory,
          document.content,
          ...(metadata.tags ?? []),
          ...(metadata.industries ?? []),
          ...(metadata.keywords ?? []),
        ]
          .filter(Boolean)
          .join(" "),
      };
    });

    this.productFuse = new Fuse(searchableProducts, {
      includeScore: true,

      threshold: 0.4,

      ignoreLocation: true,

      shouldSort: true,

      keys: [
        {
          name: "metadata.product",
          weight: 0.45,
        },
        {
          name: "metadata.mainCategory",
          weight: 0.15,
        },
        {
          name: "metadata.subCategory",
          weight: 0.15,
        },
        {
          name: "content",
          weight: 0.2,
        },
        {
          name: "searchableText",
          weight: 0.05,
        },
      ],
    });
  }

  async searchProducts(query, limit = 5) {
    await this.load();

    if (!query) {
      return [];
    }

    return this.productFuse
      .search(query)
      .filter((result) => result.score <= 0.45)
      .slice(0, limit)
      .map((result) => ({
        ...result.item,
        score: result.score,
      }));
  }

  async getTopMatches(query, limit = 5) {
    return this.searchProducts(query, limit);
  }

  async findProductByName(name) {
    await this.load();

    if (!name) {
      return null;
    }

    const result = this.productFuse.search(name);

    if (!result.length) {
      return null;
    }

    if (result[0].score > 0.35) {
      return null;
    }

    return result[0].item;
  }

  async productExists(name) {
    return (await this.findProductByName(name)) !== null;
  }

  async getRequiredFields(name) {
    const product = await this.findProductByName(name);

    return product?.metadata?.requiredFields ?? [];
  }

  async getSpecifications(name) {
    const product = await this.findProductByName(name);

    return product?.metadata?.specifications ?? {};
  }

  async getProduct(name) {
    return this.findProductByName(name);
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
}
