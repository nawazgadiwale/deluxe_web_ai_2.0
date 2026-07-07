export default class ProductDetailsContextBuilder {
  build(product) {
    if (!product) {
      return "";
    }

    const metadata = product.metadata ?? {};

    return `
Product
${metadata.product}

Category
${metadata.mainCategory}

Sub Category
${metadata.subCategory}

Description
${product.content ?? product.pageContent ?? ""}

Business Types
${(metadata.businessTypes ?? []).join(", ")}

Industries
${(metadata.industries ?? []).join(", ")}

Customer Goals
${(metadata.customerGoals ?? []).join(", ")}

Use Cases
${(metadata.useCases ?? []).join(", ")}

Specifications
${JSON.stringify(metadata.specifications ?? {}, null, 2)}

Available Sizes
${(metadata.availableSizes ?? []).join(", ")}

Materials
${(metadata.materials ?? []).join(", ")}

Finishes
${(metadata.finishes ?? []).join(", ")}

Related Products
${(metadata.relatedProducts ?? []).join(", ")}

Frequently Bought Together
${(metadata.frequentlyBoughtWith ?? []).join(", ")}
`;
  }
}
