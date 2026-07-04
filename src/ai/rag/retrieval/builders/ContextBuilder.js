// export default class ContextBuilder {
//   constructor(options = {}) {
//     this.maxContextLength = options.maxContextLength ?? 12000;
//   }

//   build(documents = []) {
//     if (!Array.isArray(documents) || documents.length === 0) {
//       return "";
//     }

//     const uniqueDocuments = this.removeDuplicates(documents)
//       .filter((document) => document.metadata?.isActive !== false)
//       .sort(this.sortByScore);

//     const sections = [];

//     let currentLength = 0;

//     for (const document of uniqueDocuments) {
//       const section = this.formatDocument(document);

//       if (currentLength + section.length > this.maxContextLength) {
//         break;
//       }

//       sections.push(section);
//       currentLength += section.length;
//     }

//     return sections.join("\n\n------------------------------\n\n");
//   }

//   removeDuplicates(documents) {
//     const seen = new Set();

//     return documents.filter((document) => {
//       const id = document.metadata?.id ?? document.pageContent;

//       if (seen.has(id)) {
//         return false;
//       }

//       seen.add(id);

//       return true;
//     });
//   }

//   sortByScore(a, b) {
//     const scoreA = a.metadata?.score ?? 0;
//     const scoreB = b.metadata?.score ?? 0;

//     return scoreB - scoreA;
//   }

//   formatDocument(document) {
//     const metadata = document.metadata ?? {};

//     return `
// Title:
// ${metadata.title ?? metadata.file ?? "N/A"}

// Category:
// ${metadata.category ?? "N/A"}

// Source:
// ${metadata.source ?? "N/A"}

// Content:
// ${document.pageContent}
// `.trim();
//   }
// }

// new updated builder

export default class ContextBuilder {
  constructor(options = {}) {
    this.maxContextLength = options.maxContextLength ?? 12000;
  }

  build(documents = []) {
    if (!Array.isArray(documents) || documents.length === 0) {
      return "";
    }

    const uniqueDocuments = this.removeDuplicates(documents)
      .filter((document) => document.metadata?.isActive !== false)
      .sort(this.sortByScore);

    const sections = [];

    let currentLength = 0;

    for (const document of uniqueDocuments) {
      const section = this.formatDocument(document);

      if (currentLength + section.length > this.maxContextLength) {
        break;
      }

      sections.push(section);

      currentLength += section.length;
    }

    return sections.join("\n\n----------------------------------------\n\n");
  }

  removeDuplicates(documents) {
    const seen = new Set();

    return documents.filter((document) => {
      const id = document.metadata?.id ?? document.pageContent;

      if (seen.has(id)) {
        return false;
      }

      seen.add(id);

      return true;
    });
  }

  sortByScore(a, b) {
    const scoreA = a.metadata?.score ?? 0;
    const scoreB = b.metadata?.score ?? 0;

    return scoreB - scoreA;
  }

  formatDocument(document) {
    const metadata = document.metadata ?? {};

    return [
      `Product: ${metadata.product ?? "N/A"}`,

      `Main Category: ${metadata.mainCategory ?? "N/A"}`,

      `Sub Category: ${metadata.subCategory ?? "N/A"}`,

      metadata.businessTypes?.length
        ? `Business Types: ${metadata.businessTypes.join(", ")}`
        : "",

      metadata.industries?.length
        ? `Industries: ${metadata.industries.join(", ")}`
        : "",

      metadata.useCases?.length
        ? `Use Cases: ${metadata.useCases.join(", ")}`
        : "",

      metadata.customerGoals?.length
        ? `Customer Goals: ${metadata.customerGoals.join(", ")}`
        : "",

      metadata.relatedProducts?.length
        ? `Related Products: ${metadata.relatedProducts.join(", ")}`
        : "",

      metadata.frequentlyBoughtWith?.length
        ? `Frequently Bought With: ${metadata.frequentlyBoughtWith.join(", ")}`
        : "",

      metadata.keywords?.length
        ? `Keywords: ${metadata.keywords.join(", ")}`
        : "",

      `Description: ${document.pageContent}`,
    ]
      .filter(Boolean)
      .join("\n");
  }
}
