import fs from "node:fs/promises";
import path from "node:path";

import PDFDocumentLoader from "./PDFDocumentLoader.js";
import TextDocumentLoader from "./TextDocumentLoader.js";
import MarkdownDocumentLoader from "./MarkdownDocumentLoader.js";
import WordDocumentLoader from "./WordDocumentLoader.js";

export default class DocumentLoader {
  async loadDirectory(directory, rootDirectory = directory) {
    const documents = [];

    const files = await fs.readdir(directory);

    for (const file of files) {
      const filePath = path.join(directory, file);

      const stats = await fs.stat(filePath);

      if (stats.isDirectory()) {
        const nestedDocuments = await this.loadDirectory(
          filePath,
          rootDirectory,
        );

        documents.push(...nestedDocuments);

        continue;
      }

      const extension = path.extname(file).toLowerCase();

      let loader = null;

      switch (extension) {
        case ".txt":
          loader = new TextDocumentLoader(filePath);
          break;

        case ".md":
          loader = new MarkdownDocumentLoader(filePath);
          break;

        case ".pdf":
          loader = new PDFDocumentLoader(filePath);
          break;

        case ".docx":
          loader = new WordDocumentLoader(filePath);
          break;

        default:
          continue;
      }

      const loaded = await loader.load();

      const relativePath = path.relative(rootDirectory, filePath);

      const category = relativePath.split(path.sep)[0];

      loaded.forEach((document) => {
        document.metadata = {
          ...(document.metadata ?? {}),

          source: filePath,

          relativePath,

          category,

          filename: path.basename(file),

          extension,

          directory: path.dirname(relativePath),

          loader: loader.constructor.name,
        };
      });

      documents.push(...loaded);
    }

    return documents;
  }
}
