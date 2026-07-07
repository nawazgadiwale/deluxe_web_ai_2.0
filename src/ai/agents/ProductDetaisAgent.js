import ProductDetailsService from "../../modules/productdetails/ProductDetailsService.js";

const service = new ProductDetailsService();

export default class ProductDetailsAgent {
  async execute(state) {
    const details = await service.generate(state);

    state.response = {
      type: "PRODUCT_DETAILS",

      data: details,
    };

    return state;
  }
}
