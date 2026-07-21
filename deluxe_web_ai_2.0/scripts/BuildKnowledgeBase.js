import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

import DocumentLoader from "../src/ai/loaders/DocumentLoader.js";
import WebsiteLoader from "../src/ai/loaders/WebsiteLoader.js";
import CatalogLoader from "../src/ai/loaders/CatalogLoader.js";

import VectorStoreService from "../src/ai/rag/VectorStoreService.js";

const documentLoader = new DocumentLoader();

const websiteLoader = new WebsiteLoader("./src/data/companywebsite/pages.txt");

const catalogLoader = new CatalogLoader(
  "./src/data/productcatalog/catalog.json",
);

const vectorStoreService = new VectorStoreService();

async function buildKnowledgeBase() {
  console.log("Loading local documents...");

  const documents = await documentLoader.loadDirectory("./src/data");

  console.log(`Loaded ${documents.length} local documents`);

  console.log("Loading website pages...");

  const websiteDocuments = await websiteLoader.load();

  console.log(`Loaded ${websiteDocuments.length} website documents`);

  console.log("Loading product catalog...");

  const catalogDocuments = await catalogLoader.load();

  console.log(`Loaded ${catalogDocuments.length} catalog documents`);

  const allDocuments = [...documents, ...websiteDocuments, ...catalogDocuments];

  console.log(`Total raw documents: ${allDocuments.length}`);

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 800,
    chunkOverlap: 100,
  });

  const chunks = await splitter.splitDocuments(allDocuments);

  console.log(`Generated ${chunks.length} chunks`);

  await vectorStoreService.create(chunks);

  await vectorStoreService.save("./src/vectorstore");

  console.log("--------------------------------");
  console.log("Knowledge Base Built Successfully");
  console.log(`Documents : ${allDocuments.length}`);
  console.log(`Chunks    : ${chunks.length}`);
  console.log("--------------------------------");
}

buildKnowledgeBase().catch(console.error);
