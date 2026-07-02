export default class FilterBuilder {
  build(input = {}) {
    const entities = input.entities ?? input;

    const filter = {};

    this.add(filter, "mainCategory", entities.mainCategory);
    this.add(filter, "subCategory", entities.subCategory);
    this.add(filter, "product", entities.product);
    this.add(filter, "businessType", entities.businessType);
    this.add(filter, "department", entities.department);
    this.add(filter, "language", entities.language);

    // Always ignore inactive knowledge
    filter.isActive = true;

    return filter;
  }

  add(filter, key, value) {
    if (value !== undefined && value !== null && value !== "") {
      filter[key] = value;
    }
  }
}
