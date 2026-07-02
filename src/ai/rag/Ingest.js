import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { Document } from "@langchain/core/documents";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

import VectorStoreService from "./VectorStoreService.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_PATH = path.resolve(__dirname, "../../data");
const VECTOR_STORE_PATH = path.resolve(__dirname, "../../vectorstore");

const vectorStoreService = VectorStoreService.getInstance();

async function loadDocuments(folder) {
  const documents = [];

  async function walk(directory) {
    const entries = await fs.readdir(directory, {
      withFileTypes: true,
    });

    for (const entry of entries) {
      const fullPath = path.join(directory, entry.name);

      if (entry.isDirectory()) {
        await walk(fullPath);
        continue;
      }

      const extension = path.extname(entry.name).toLowerCase();

      // ---------------- TXT ----------------

      if (extension === ".txt") {
        const text = await fs.readFile(fullPath, "utf8");

        documents.push(
          new Document({
            pageContent: text,
            metadata: {
              source: path.relative(DATA_PATH, fullPath),
              type: "text",
            },
          }),
        );

        continue;
      }

      // ---------------- JSON ----------------

      if (extension === ".json") {
        const json = JSON.parse(await fs.readFile(fullPath, "utf8"));

        if (!Array.isArray(json.documents)) {
          continue;
        }

        for (const item of json.documents) {
          documents.push(
            new Document({
              pageContent: item.content,
              metadata: {
                source: path.relative(DATA_PATH, fullPath),
                id: item.id,
                ...item.metadata,
              },
            }),
          );
        }

        continue;
      }
    }
  }

  await walk(folder);

  return documents;
}

async function ingest() {
  console.log("--------------------------------");
  console.log("Loading knowledge base...");
  console.log("--------------------------------");

  const rawDocuments = await loadDocuments(DATA_PATH);

  console.log(`Loaded ${rawDocuments.length} documents`);

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 800,
    chunkOverlap: 100,
  });

  const chunks = await splitter.splitDocuments(rawDocuments);

  console.log(`Generated ${chunks.length} chunks`);

  // Build FAISS index
  await vectorStoreService.create(chunks);

  // Save FAISS index
  await vectorStoreService.save(VECTOR_STORE_PATH);

  console.log("--------------------------------");
  console.log("FAISS index created successfully");
  console.log(`Documents : ${rawDocuments.length}`);
  console.log(`Chunks    : ${chunks.length}`);
  console.log(`Saved To  : ${VECTOR_STORE_PATH}`);
  console.log("--------------------------------");
}

ingest().catch((error) => {
  console.error("Knowledge Base Build Failed");
  console.error(error);
  process.exit(1);
});
