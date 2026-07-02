export default class ReciprocalRankFusion {
  constructor(options = {}) {
    this.k = options.k ?? 60;
    this.topK = options.topK ?? 20;
  }

  /*
   * =====================================================
   * Reciprocal Rank Fusion
   * =====================================================
   */

  fuse(rankings = []) {
    const results = new Map();

    for (const documents of rankings) {
      documents.forEach((document, index) => {
        if (!document) {
          return;
        }

        const id = this.getDocumentId(document);

        if (!id) {
          return;
        }

        const score = 1 / (this.k + index + 1);

        const existing = results.get(id);

        if (!existing) {
          results.set(id, {
            score,
            document: this.decorate(document),
          });

          return;
        }

        existing.score += score;

        existing.document = this.mergeDocument(existing.document, document);
      });
    }

    return [...results.values()]
      .sort((a, b) => b.score - a.score)
      .slice(0, this.topK)
      .map((entry) => ({
        ...entry.document,

        metadata: {
          ...entry.document.metadata,

          hybridScore: Number(entry.score.toFixed(6)),
        },
      }));
  }

  /*
   * =====================================================
   * Helpers
   * =====================================================
   */

  getDocumentId(document) {
    return (
      document.metadata?.id ??
      document.metadata?.product ??
      document.metadata?.source ??
      document.pageContent
    );
  }

  decorate(document) {
    return {
      ...document,

      metadata: {
        ...document.metadata,

        retrievalMethods: [document.metadata?.retrievalMethod].filter(Boolean),
      },
    };
  }

  mergeDocument(existing, incoming) {
    const methods = new Set([
      ...(existing.metadata?.retrievalMethods ?? []),
      ...(incoming.metadata?.retrievalMethods ?? []),
      incoming.metadata?.retrievalMethod,
    ]);

    return {
      ...existing,

      pageContent:
        existing.pageContent.length >= incoming.pageContent.length
          ? existing.pageContent
          : incoming.pageContent,

      metadata: {
        ...existing.metadata,
        ...incoming.metadata,

        retrievalMethods: [...methods],
      },
    };
  }
}
