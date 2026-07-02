import vectorStore from "../../VectorStore.js";

export default class SemanticRetriever {
  async retrieve(query, options = {}) {

    console.log("Retriever loaded:", vectorStore.isLoaded());

    const retriever = vectorStore.asRetriever({
      k: options.k ?? 10,
      filter: options.filter,
    });

    const documents = await retriever.invoke(query);

    return documents.map((document) => ({
      ...document,
      metadata: {
        ...document.metadata,
        retrievalMethod: "semantic",
      },
    }));
  }
}