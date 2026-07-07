import LLMService from "../../ai/llm/LLMService.js";
import RAGPipeline from "../../ai/rag/retrieval/RagPipeline.js";
import CatalogService from "../catalog/CatalogService.js";
import ProductDetailsPrompt from "../../ai/llm/prompts/ProductDetailsPrompt.js";

import ProductDetailsContextBuilder from "./builders/ProductDetailsContextBuilder.js";

const llmService = new LLMService();
const ragPipeline = new RAGPipeline();
const catalogService = new CatalogService();

const contextBuilder = new ProductDetailsContextBuilder();

export default class ProductDetailsEngine {
  async generate(state) {
    /*
     * =====================================================
     * Product
     * =====================================================
     */

    const productName =
      state.action?.payload?.product ??
      state.selectedProduct ??
      state.userMessage;

    if (!productName) {
      throw new Error("Product name not found.");
    }

    /*
     * =====================================================
     * Catalog Lookup
     * =====================================================
     */

    const product = await catalogService.getProductByAction(productName);

    if (!product) {
      return null;
    }

    const metadata = product.metadata ?? {};

    /*
     * =====================================================
     * Retrieve Related Documents
     * =====================================================
     */

    const retrieval = await ragPipeline.retrieve({
      query: metadata.product,
      conversation: state,
      options: {
        topK: 10,
      },
    });

    /*
     * =====================================================
     * Build Catalog Context
     * =====================================================
     */

    const catalogContext = contextBuilder.build(product);

    /*
     * =====================================================
     * LLM
     * =====================================================
     */

    const llm = await llmService.invoke({
      systemPrompt: ProductDetailsPrompt({
        product: metadata.product,
        catalogContext,
      }),

      userMessage: metadata.product,

      temperature: 0.3,
    });

    /*
     * =====================================================
     * Return
     * =====================================================
     */

    return {
      metadata,

      description: product.content ?? product.pageContent ?? "",

      documents: retrieval.documents,

      context: retrieval.context,

      llm,
    };
  }
}
