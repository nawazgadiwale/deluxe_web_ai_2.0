export default class DiscoveryContextBuilder {
  build(products = []) {
    return products
      .map((item, index) => {
        const metadata = item.metadata ?? {};

        return `
Product ${index + 1}

Name
${metadata.product}

Category
${metadata.mainCategory}

Sub Category
${metadata.subCategory}

Business Types
${(metadata.businessTypes ?? []).join(", ")}

Industries
${(metadata.industries ?? []).join(", ")}

Use Cases
${(metadata.useCases ?? []).join(", ")}

Description
${item.content}
`;
      })
      .join("\n---------------------------------------\n");
  }
}
