import CatalogMapper from "../catalog/CatalogMapper.js";

const catalogMapper = new CatalogMapper();

export default class DiscoveryEngine {
  async generate(state) {
    console.log("Query:", state.userMessage);

    const products = await catalogMapper.searchProducts(state.userMessage, 10);

    console.log(products);

    return {
      products,
    };
  }
}
