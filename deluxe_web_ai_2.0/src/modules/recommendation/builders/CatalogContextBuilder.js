export default class CatalogContextBuilder {
  build(products = []) {
    return products
      .map((item, index) => {
        const metadata = item.metadata ?? {};

        const description =
          metadata.shortDescription ??
          metadata.description ??
          (item.pageContent ?? item.content ?? "")
            .replace(/\s+/g, " ")
            .trim()
            .slice(0, 120);

        return `
${index + 1}. ${metadata.product}
Category: ${metadata.mainCategory}/${metadata.subCategory}
Description: ${description}
`;
      })
      .join("\n");
  }
}
