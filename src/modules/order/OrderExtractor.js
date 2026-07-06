// import CatalogService from "../catalog/CatalogService.js";

// const catalogService = new CatalogService();

// export default class OrderExtractor {
//   async extract(state) {
//     const message = (state.userMessage ?? "").trim();
//     const normalized = message.toLowerCase();

//     const extractedOrder = {
//       product: null,
//       mainCategory: null,
//       subCategory: null,
//       quantity: null,
//       specifications: {},
//       artwork: null,
//       deadline: null,
//       remarks: null,
//     };

//     console.log("\n==================================================");
//     console.log("ORDER EXTRACTOR");
//     console.log("==================================================");
//     console.log("Message:", message);
//     console.log("Workflow:", state.workflow);
//     console.log("Current Step:", state.currentStep);

//     console.log("\nActive Item:");
//     console.dir(state.activeOrderItem, { depth: null });

//     console.log("\nSelected Product:");
//     console.log(state.selectedProduct);

//     console.log("\nIncoming Action:");
//     console.dir(state.action, { depth: null });

//     console.log("\nRecommendation Context:");
//     console.dir(state.recommendation, { depth: 2 });

//     /*
//      * =====================================================
//      * Continue Existing Collection Step
//      * =====================================================
//      */

//     switch (state.currentStep) {
//       case "QUANTITY": {
//         const match = message.match(/\d+/);

//         if (match) {
//           extractedOrder.quantity = Number(match[0]);
//         }

//         console.log("Extracted Quantity:", extractedOrder.quantity);
//         console.log("==================================================\n");

//         return extractedOrder;
//       }

//       case "DEADLINE":
//         extractedOrder.deadline = message;

//         console.log("Extracted Deadline:", extractedOrder.deadline);
//         console.log("==================================================\n");

//         return extractedOrder;

//       case "ARTWORK":
//         extractedOrder.artwork = message;

//         console.log("Extracted Artwork:", extractedOrder.artwork);
//         console.log("==================================================\n");

//         return extractedOrder;

//       case "SIZE":
//         extractedOrder.specifications.size = message;

//         console.log("Extracted Size:", message);
//         console.log("==================================================\n");

//         return extractedOrder;

//       case "MATERIAL":
//         extractedOrder.specifications.material = message;

//         console.log("Extracted Material:", message);
//         console.log("==================================================\n");

//         return extractedOrder;

//       case "FINISH":
//         extractedOrder.specifications.finish = message;

//         console.log("Extracted Finish:", message);
//         console.log("==================================================\n");

//         return extractedOrder;

//       default:
//         break;
//     }

//     /*
//      * =====================================================
//      * Ignore Workflow Commands
//      * =====================================================
//      */

//     const decisions = new Set([
//       "yes",
//       "yeah",
//       "y",
//       "ok",
//       "okay",
//       "sure",
//       "no",
//       "confirm",
//       "confirmed",
//       "done",
//       "finish",
//       "cancel",
//       "review",
//       "review order",
//       "modify",
//       "modify order",
//       "add another",
//     ]);

//     if (decisions.has(normalized)) {
//       console.log("Decision Message Detected");
//       console.log("==================================================\n");
//       return extractedOrder;
//     }

//     /*
//      * =====================================================
//      * 1. Product From UI Action
//      * =====================================================
//      */

//     const selectedProduct =
//       state.action?.payload?.product ?? state.selectedProduct ?? null;

//     if (selectedProduct) {
//       console.log("\nSearching UI Selected Product:", selectedProduct);

//       const product = await catalogService.findProductByName(selectedProduct);

//       if (product) {
//         console.log("Product Found From UI");

//         return this.buildProduct(product, extractedOrder);
//       }

//       console.log("UI Product Not Found");
//     }

//     /*
//      * =====================================================
//      * 2. Product From Recommendation
//      * =====================================================
//      */

//     const recommendation = state.recommendation?.products?.find((item) =>
//       normalized.includes(item.product.toLowerCase()),
//     );

//     if (recommendation) {
//       console.log("\nMatched Recommendation:", recommendation.product);

//       const product = await catalogService.findProductByName(
//         recommendation.product,
//       );

//       if (product) {
//         console.log("Recommendation Product Found");

//         return this.buildProduct(product, extractedOrder);
//       }

//       console.log("Recommendation Product Missing In Catalog");
//     }

//     /*
//      * =====================================================
//      * 3. Catalog Search
//      * =====================================================
//      */

//     console.log("\nSearching Catalog...");

//     const matches = await catalogService.searchProducts(message, 5);

//     console.log(
//       "Catalog Matches:",
//       matches.map((m) => m.metadata.product),
//     );

//     if (matches.length) {
//       console.log("Catalog Product Selected:", matches[0].metadata.product);

//       return this.buildProduct(matches[0], extractedOrder);
//     }

//     console.log("\nNo Product Could Be Extracted");

//     console.log("Final Extracted Order:");
//     console.dir(extractedOrder, { depth: null });

//     console.log("==================================================\n");

//     return extractedOrder;
//   }

//   /*
//    * =====================================================
//    * Helper
//    * =====================================================
//    */

//   buildProduct(product, order) {
//     if (!product) {
//       return order;
//     }

//     order.product = product.metadata.product;
//     order.mainCategory = product.metadata.mainCategory;
//     order.subCategory = product.metadata.subCategory;

//     console.log("\nExtracted Product");
//     console.log("-------------------------");
//     console.log("Product:", order.product);
//     console.log("Main Category:", order.mainCategory);
//     console.log("Sub Category:", order.subCategory);

//     return order;
//   }
// }

import CatalogService from "../catalog/CatalogService.js";
import LeadExtractor from "../lead/LeadExtractor.js";

const leadExtractor = new LeadExtractor();
const catalogService = new CatalogService();

export default class OrderExtractor {
  async extract(state) {
    const message = (state.userMessage ?? "").trim();

    const extractedOrder = this.createEmptyOrder();

    this.logExtraction(state, message);

    /*
     * =====================================================
     * Continue Existing Workflow
     * =====================================================
     */

    const workflowExtraction = await this.extractWorkflowField(
      state,
      state.currentStep,
      message,
      extractedOrder,
    );

    if (workflowExtraction) {
      return workflowExtraction;
    }

    /*
     * =====================================================
     * Ignore Workflow Decisions
     * =====================================================
     */

    if (this.isDecisionMessage(message)) {
      console.log("Decision Message Detected");
      console.log("==================================================\n");

      return extractedOrder;
    }

    /*
     * =====================================================
     * Product From UI
     * =====================================================
     */

    const actionProduct = await this.extractFromAction(state, extractedOrder);

    if (actionProduct) {
      return actionProduct;
    }

    /*
     * =====================================================
     * Product From Recommendation
     * =====================================================
     */

    const recommendationProduct = await this.extractFromRecommendation(
      state,
      message,
      extractedOrder,
    );

    if (recommendationProduct) {
      return recommendationProduct;
    }

    /*
     * =====================================================
     * Catalog Search
     * =====================================================
     */

    const catalogProduct = await this.extractFromCatalog(
      message,
      extractedOrder,
    );

    if (catalogProduct) {
      return catalogProduct;
    }

    console.log("\nNo Product Could Be Extracted");

    console.dir(extractedOrder, {
      depth: null,
    });

    console.log("==================================================\n");

    return extractedOrder;
  }

  /*
   * =====================================================
   * Helpers
   * =====================================================
   */

  createEmptyOrder() {
    return {
      product: null,

      mainCategory: null,

      subCategory: null,

      quantity: null,

      specifications: {},

      artwork: null,

      deadline: null,

      remarks: null,
    };
  }

  logExtraction(state, message) {
    console.log("\n==================================================");
    console.log("ORDER EXTRACTOR");
    console.log("==================================================");

    console.log("Message:", message);

    console.log("Workflow:", state.workflow);

    console.log("Current Step:", state.currentStep);

    console.log("\nActive Item:");

    console.dir(state.activeOrderItem, {
      depth: null,
    });

    console.log("\nSelected Product:");

    console.log(state.selectedProduct);

    console.log("\nIncoming Action:");

    console.dir(state.action, {
      depth: null,
    });

    console.log("\nRecommendation Context:");

    console.dir(state.recommendation, {
      depth: 2,
    });
  }

  /*
   * =====================================================
   * Workflow Field Extraction
   * =====================================================
   */

  async extractWorkflowField(state, currentStep, message, order) {
    switch (currentStep) {
      case "QUANTITY": {
        const match = message.match(/\d+/);

        if (match) {
          order.quantity = Number(match[0]);
        }

        console.log("Extracted Quantity:", order.quantity);
        console.log("==================================================\n");

        return order;
      }

      case "DEADLINE":
        order.deadline = message;

        console.log("Extracted Deadline:", order.deadline);
        console.log("==================================================\n");

        return order;

      case "ARTWORK":
        order.artwork = message;

        console.log("Extracted Artwork:", order.artwork);
        console.log("==================================================\n");

        return order;

      case "SIZE":
        order.specifications.size = message;

        console.log("Extracted Size:", message);
        console.log("==================================================\n");

        return order;

      case "MATERIAL":
        order.specifications.material = message;

        console.log("Extracted Material:", message);
        console.log("==================================================\n");

        return order;

      case "FINISH":
        order.specifications.finish = message;

        console.log("Extracted Finish:", message);
        console.log("==================================================\n");

        return order;

      case "CUSTOMER_DETAILS": {
        /*
         * We don't know whether we're collecting
         * name, mobile or email.
         *
         * Ask LeadExtractor to extract according
         * to the next missing field.
         */

        const customer = state.orderRequest?.customer ?? {};

        let currentLeadStep = "ASK_NAME";

        if (customer.name && !customer.mobile) {
          currentLeadStep = "ASK_MOBILE";
        } else if (customer.name && customer.mobile && !customer.email) {
          currentLeadStep = "ASK_EMAIL";
        }

        const extracted = await leadExtractor.extract({
          ...state,
          currentStep: currentLeadStep,
        });

        console.log("Extracted Customer");
        console.dir(extracted, { depth: null });

        return {
          customer: extracted,
        };
      }

      default:
        return null;
    }
  }

  /*
   * =====================================================
   * Workflow Decisions
   * =====================================================
   */

  isDecisionMessage(message = "") {
    const normalized = message.trim().toLowerCase();

    return new Set([
      "yes",
      "yeah",
      "y",
      "ok",
      "okay",
      "sure",
      "no",
      "confirm",
      "confirmed",
      "done",
      "finish",
      "cancel",
      "review",
      "review order",
      "modify",
      "modify order",
      "add another",
    ]).has(normalized);
  }

  /*
   * =====================================================
   * Product Extraction
   * =====================================================
   */

  async extractFromAction(state, order) {
    const selectedProduct =
      state.action?.payload?.product ?? state.selectedProduct ?? null;

    if (!selectedProduct) {
      return null;
    }

    console.log("\nSearching UI Selected Product:", selectedProduct);

    const product = await catalogService.findProductByName(selectedProduct);

    if (!product) {
      console.log("UI Product Not Found");
      return null;
    }

    console.log("Product Found From UI");

    return this.buildProduct(product, order);
  }
  async extractFromRecommendation(state, message, order) {
    const normalized = message.toLowerCase();

    const recommendation = state.recommendation?.products?.find((item) =>
      normalized.includes(item.product.toLowerCase()),
    );

    if (!recommendation) {
      return null;
    }

    console.log("\nMatched Recommendation:", recommendation.product);

    const product = await catalogService.getProductByAction(
      recommendation.product,
    );

    if (!product) {
      console.log("Recommendation Product Missing In Catalog");

      return null;
    }

    console.log("Recommendation Product Found");

    return this.buildProduct(product, order);
  }

  async extractFromCatalog(message, order) {
    console.log("\nSearching Catalog...");

    const matches = await catalogService.searchProducts(message, 5);

    console.log(
      "Catalog Matches:",
      matches.map((item) => item.metadata.product),
    );

    if (!matches.length) {
      return null;
    }

    console.log("Catalog Product Selected:", matches[0].metadata.product);

    return this.buildProduct(matches[0], order);
  }

  /*
   * =====================================================
   * Product Builder
   * =====================================================
   */

  buildProduct(product, order) {
    if (!product) {
      return order;
    }

    order.product = product.metadata.product;

    order.mainCategory = product.metadata.mainCategory;

    order.subCategory = product.metadata.subCategory;

    console.log("\nExtracted Product");
    console.log("-------------------------");
    console.log("Product:", order.product);
    console.log("Main Category:", order.mainCategory);
    console.log("Sub Category:", order.subCategory);

    return order;
  }
}
