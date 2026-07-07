export default class ComparisonContextBuilder {
  build(products = []) {
    if (!products.length) {
      return "";
    }

    return products
      .map((item, index) => {
        const metadata = item.metadata ?? {};

        return `
==================================================
Product ${index + 1}
==================================================

Product
${metadata.product}

Category
${metadata.mainCategory}

Sub Category
${metadata.subCategory}

Description
${item.content ?? item.pageContent ?? ""}

Business Types
${(metadata.businessTypes ?? []).join(", ")}

Industries
${(metadata.industries ?? []).join(", ")}

Customer Goals
${(metadata.customerGoals ?? []).join(", ")}

Applications
${(metadata.useCases ?? []).join(", ")}

Specifications
${JSON.stringify(metadata.specifications ?? {}, null, 2)}

Available Sizes
${(metadata.availableSizes ?? metadata.sizes ?? []).join(", ")}

Materials
${(metadata.materials ?? []).join(", ")}

Finishes
${(metadata.finishes ?? []).join(", ")}

Minimum Order
${metadata.minimumOrder ?? "N/A"}

Lead Time
${metadata.leadTime ?? "N/A"}

Related Products
${(metadata.relatedProducts ?? []).join(", ")}

Frequently Bought Together
${(metadata.frequentlyBoughtWith ?? []).join(", ")}
`;
      })
      .join("\n\n");
  }
}
