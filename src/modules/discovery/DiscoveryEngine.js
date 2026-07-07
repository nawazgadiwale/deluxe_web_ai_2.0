import CatalogMapper from "../catalog/CatalogMapper.js";

const catalogMapper = new CatalogMapper();

export default class DiscoveryEngine {
  async generate(state) {
    const products = await catalogMapper.recommendProducts(
      state.userMessage,
      10,
    );

    return {
      products,
    };
  }
}
