export default class ComparisonContextBuilder {
  build({ products = [], query = {} }) {
    if (!products.length) return "";

    const sections = [
      `
Customer
--------
Type: ${query.customerType || "N/A"}
Business: ${query.businessType || "N/A"}
Goal: ${query.businessGoal || "N/A"}
Requirements: ${query.customerRequirements || "N/A"}
`,
    ];

    products.forEach((product, index) => {
      const metadata = product.metadata ?? {};

      const specs = Object.entries(metadata.specifications ?? {})
        .map(([k, v]) => `${k}: ${v}`)
        .join(", ");

      sections.push(`
Product ${index + 1}: ${metadata.product}

Category: ${metadata.mainCategory}/${metadata.subCategory}

Description:
${metadata.shortDescription ?? product.content ?? product.pageContent ?? ""}

Features:
${(metadata.features ?? []).join(", ")}

Specifications:
${specs || "N/A"}

Materials:
${(metadata.materials ?? []).join(", ")}

Sizes:
${(metadata.availableSizes ?? []).join(", ")}

MOQ:
${metadata.minimumOrder ?? "N/A"}
`);
    });

    return sections.join("\n");
  }
}
