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

    return sections.join("\n\n------------------------------\n\n");
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

    return `
Title:
${metadata.title ?? metadata.file ?? "N/A"}

Category:
${metadata.category ?? "N/A"}

Source:
${metadata.source ?? "N/A"}

Content:
${document.pageContent}
`.trim();
  }
}
