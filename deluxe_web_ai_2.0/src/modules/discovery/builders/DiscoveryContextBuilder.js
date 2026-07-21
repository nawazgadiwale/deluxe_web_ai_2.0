export default class DiscoveryContextBuilder {
  build(products = []) {
    return products
      .map((item, index) => {
        const metadata = item.metadata ?? {};

        return `
${index + 1}. ${metadata.product}
${metadata.mainCategory}/${metadata.subCategory}
${metadata.shortDescription ?? item.content?.slice(0, 120)}
`;
      })
      .join("\n");
  }
}
