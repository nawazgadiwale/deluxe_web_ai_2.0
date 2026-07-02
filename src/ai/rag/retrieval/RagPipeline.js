import QueryNormalizer from "./preprocessors/QueryNormalizer.js";
import ConversationEnricher from "./preprocessors/ConversationEnricher.js";
import FilterBuilder from "./builders/FilterBuilder.js";
import ContextBuilder from "./builders/ContextBuilder.js";

import SemanticRetriever from "./retrievers/SemanticRetriever.js";

import VectorStoreService from "../VectorStoreService.js";

const queryNormalizer = new QueryNormalizer();

const conversationEnricher = new ConversationEnricher();

const filterBuilder = new FilterBuilder();

const contextBuilder = new ContextBuilder();

// Use singleton FAISS instance
const vectorStoreService = VectorStoreService.getInstance();

const retriever = new SemanticRetriever(vectorStoreService);

export default class RAGPipeline {
  async retrieve({ query, conversation = {}, options = {} }) {
    // Normalize Query
    const normalizedQuery = queryNormalizer.normalize(query);

    // Enrich using conversation history
    const enriched = conversationEnricher.enrich(normalizedQuery, conversation);

    // Build metadata filters
    const filters = filterBuilder.build(enriched);

    // Semantic Retrieval (BM25 Disabled)
    const documents = await retriever.retrieve(enriched.enrichedQuery, {
      k: options.topK ?? 20,
      filter: filters,
    });

    // Build context for LLM
    const context = contextBuilder.build(documents);

    return {
      originalQuery: query,

      normalizedQuery,

      enrichedQuery: enriched,

      filters,

      documents,

      context,
    };
  }
}
