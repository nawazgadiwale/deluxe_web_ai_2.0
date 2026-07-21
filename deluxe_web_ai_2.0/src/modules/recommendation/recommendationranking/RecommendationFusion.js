import ReciprocalRankFusion from "../../../ai/rag/retrieval/rankers/RRFRanker.js";

const fusion = new ReciprocalRankFusion({
  topK: 10,
});

export default class RecommendationFusion {
  merge(catalogResults = [], ragDocuments = []) {
    /*
     * ==========================================
     * Catalog Results
     * ==========================================
     */

    const catalog = catalogResults.map((item) => ({
      pageContent: item.content ?? "",

      metadata: {
        ...item.metadata,

        retrievalMethod: "CATALOG",

        retrievalSource: "catalog",

        retrievalScore: item.metadata?.score ?? 1,
      },
    }));

    /*
     * ==========================================
     * Semantic Results
     * ==========================================
     */

    const semantic = ragDocuments
      .filter((doc) => doc.metadata?.product && doc.metadata?.mainCategory)
      .map((doc) => ({
        pageContent: doc.pageContent,
        metadata: {
          ...doc.metadata,
          retrievalMethod: "SEMANTIC",
        },
      }));
    /*
     * ==========================================
     * Hybrid Fusion
     * ==========================================
     */

    return fusion.fuse([catalog, semantic]);
  }
}
