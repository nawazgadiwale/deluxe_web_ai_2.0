import CatalogService from "./CatalogService.js";

const catalog = new CatalogService();

export default class CatalogMapper {
  async findProduct(text) {
    return catalog.getTopMatches(text, 5);
  }

  async recommendProducts(text) {
    const matches = await catalog.getTopMatches(text, 5);

    return matches.map((item) => ({
      product: item.metadata.product,
      mainCategory: item.metadata.mainCategory,
      subCategory: item.metadata.subCategory,
      description: item.content,
    }));
  }

  async resolveSelection(data) {
    const matches = await this.findProduct(data.product);

    return matches[0] ?? null;
  }
}
