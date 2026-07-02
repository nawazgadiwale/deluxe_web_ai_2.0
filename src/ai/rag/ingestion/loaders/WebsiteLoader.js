import fs from "node:fs/promises";
import path from "node:path";

import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";

export default class WebsiteLoader {
  constructor(pagesFile) {
    this.pagesFile = pagesFile;
  }

  async load() {
    const file = await fs.readFile(path.resolve(this.pagesFile), "utf8");

    const urls = file
      .split("\n")
      .map((url) => url.trim())
      .filter(Boolean)
      .filter((url) => !url.startsWith("#"));

    const documents = [];

    const pages = await Promise.allSettled(
      urls.map(async (url) => {
        const loader = new CheerioWebBaseLoader(url);

        const docs = await loader.load();

        docs.forEach((document) => {
          document.metadata = {
            ...(document.metadata ?? {}),

            source: url,

            url,

            category: "companywebsite",

            loader: "WebsiteLoader",
          };
        });

        return docs;
      }),
    );

    for (const page of pages) {
      if (page.status === "fulfilled") {
        documents.push(...page.value);
      } else {
        console.warn("Failed to scrape:", page.reason);
      }
    }

    return documents;
  }
}
