import CatalogService from "../catalog/CatalogService.js";
import ComparisonContextBuilder from "./builders/ComparisonContextBuilder.js";
import ComparisonPrompt from "../../ai/llm/prompts/ComparisonPrompt.js";
import LLMService from "../../ai/llm/LLMService.js";

const catalogService = new CatalogService();
const contextBuilder = new ComparisonContextBuilder();
const llmService = new LLMService();

export default class ComparisonEngine {
  async generate(state) {
    /*
     * =====================================================
     * Products to Compare
     * =====================================================
     */

    const productNames = state.action?.payload?.products ?? [];

    if (productNames.length < 2) {
      return null;
    }

    /*
     * =====================================================
     * Catalog Lookup
     * =====================================================
     */

    const catalogProducts = [];

    for (const name of productNames) {
      const product = await catalogService.findProductByName(name);

      if (product) {
        catalogProducts.push(product);
      }
    }

    if (catalogProducts.length < 2) {
      return null;
    }

    /*
     * =====================================================
     * Build LLM Context
     * =====================================================
     */

    const catalogContext = contextBuilder.build(catalogProducts);

    /*
     * =====================================================
     * LLM Comparison
     * =====================================================
     */

    const llm = await llmService.invoke({
      systemPrompt: ComparisonPrompt({
        catalogContext,
      }),
      userMessage: productNames.join(" vs "),
      temperature: 0.3,
    });
    
    // console.log(llm)
    /*
     * =====================================================
     * Return
     * =====================================================
     */

    return {
      products: catalogProducts,
      llm,
    };
  }
}
