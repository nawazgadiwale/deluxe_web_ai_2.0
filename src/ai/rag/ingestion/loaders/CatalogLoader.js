import fs from "node:fs/promises";
import path from "node:path";

import { Document } from "@langchain/core/documents";

export default class CatalogLoader {
  constructor(catalogPath) {
    this.catalogPath = catalogPath;
  }

  async load() {
    const file = await fs.readFile(path.resolve(this.catalogPath), "utf8");

    const catalog = JSON.parse(file);

    const documents = [];

    for (const item of catalog.documents ?? []) {
      documents.push(
        new Document({
          pageContent: item.content,

          metadata: {
            id: item.id,

            ...(item.metadata ?? {}),

            source: this.catalogPath,

            category: "productcatalog",

            loader: "CatalogLoader",
          },
        }),
      );
    }

    return documents;
  }
}
