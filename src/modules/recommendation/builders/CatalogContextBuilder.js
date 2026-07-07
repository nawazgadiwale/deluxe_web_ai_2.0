export default class CatalogContextBuilder {
  build(products = []) {
    return products
      .map((item, index) => {
        const metadata = item.metadata ?? {};

        const description = (item.pageContent ?? item.content ?? "")
          .replace(/\s+/g, " ")
          .trim()
          .slice(0, 120);

        return `
Product ${index + 1}

Name: ${metadata.product}
Category: ${metadata.mainCategory}
Business: ${(metadata.businessTypes ?? []).join(", ")}
Goal: ${(metadata.customerGoals ?? []).join(", ")}
Use Cases: ${(metadata.useCases ?? []).join(", ")}
Description: ${description}
`;
      })
      .join("\n");
  }
}
