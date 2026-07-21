export default class ProductDetailsContextBuilder {
  build(product) {
    if (!product) return "";

    const metadata = product.metadata ?? {};

    const sections = [
      `Product: ${metadata.product}`,
      `Category: ${metadata.mainCategory}/${metadata.subCategory}`,
    ];

    if (metadata.description || product.content || product.pageContent) {
      sections.push(
        `Description:\n${metadata.description ?? product.content ?? product.pageContent}`,
      );
    }

    if (metadata.features?.length) {
      sections.push(`Features:\n${metadata.features.join(", ")}`);
    }

    if (metadata.specifications) {
      const specs = Object.entries(metadata.specifications)
        .map(([k, v]) => `${k}: ${v}`)
        .join("\n");

      sections.push(`Specifications:\n${specs}`);
    }

    if (metadata.materials?.length)
      sections.push(`Materials: ${metadata.materials.join(", ")}`);

    if (metadata.availableSizes?.length)
      sections.push(`Sizes: ${metadata.availableSizes.join(", ")}`);

    if (metadata.finishes?.length)
      sections.push(`Finishes: ${metadata.finishes.join(", ")}`);

    return sections.join("\n\n");
  }
}
