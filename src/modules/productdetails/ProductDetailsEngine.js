import LLMService from "../../ai/llm/LLMService.js";
import ProductDetailsPrompt from "../../ai/llm/prompts/ProductDetailsPrompt.js";
import ProductDetailsContextBuilder from "./builders/ProductDetailsContextBuilder.js";
import ProductResolver from "../catalog/ProductResolver.js";

const llmService = new LLMService();
const productResolver = new ProductResolver();
const contextBuilder = new ProductDetailsContextBuilder();

export default class ProductDetailsEngine {
  async generate(state) {
    let product = null;

    /*
     * =====================================================
     * Resolve Product
     * =====================================================
     */

    if (state.action?.payload?.product) {
      product = await productResolver.resolve(state.action.payload.product);
    }

    if (!product && state.userMessage) {
      product = await productResolver.resolve(state.userMessage);
    }

    if (!product && state.routing?.products?.length) {
      product = await productResolver.resolve(state.routing.products[0]);
    }

    if (!product) {
      return null;
    }

    const metadata = product.metadata ?? {};

    /*
     * =====================================================
     * Build Context
     * =====================================================
     */

    const catalogContext = contextBuilder.build(product);

    /*
     * =====================================================
     * Generate AI Overview
     * =====================================================
     */

    const overview = await llmService.invoke({
      systemPrompt: ProductDetailsPrompt({
        product: metadata.product,
        catalogContext,
      }),
      userMessage: metadata.product,
      temperature: 0.2,
    });

    /*
     * =====================================================
     * Return
     * =====================================================
     */

    return {
      overview,

      metadata,

      description: product.content ?? product.pageContent ?? "",
    };
  }
}
