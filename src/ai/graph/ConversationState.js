import { Annotation } from "@langchain/langgraph";

const ConversationState = Annotation.Root({
  // Session
  sessionId: Annotation({
    default: () => null,
  }),

  conversationId: Annotation({
    default: () => null,
  }),

  customerId: Annotation({
    default: () => null,
  }),

  // Current message
  userMessage: Annotation({
    default: () => "",
  }),

  action: Annotation({
    default: () => null,
  }),

  attachments: Annotation({
    default: () => [],
  }),

  // Conversation history
  history: Annotation({
    reducer: (current, update) => [...current, ...update],
    default: () => [],
  }),

  // Loaded entities
  conversation: Annotation({
    default: () => null,
  }),

  customer: Annotation({
    default: () => null,
  }),

  orderRequest: Annotation({
    default: () => null,
  }),

  leadRequest: Annotation({
    default: () => null,
  }),

  activeOrderItem: Annotation({
    default: () => null,
  }),

  currentStep: Annotation({
    default: () => null,
  }),

  // Routing
  capabilities: Annotation({
    default: () => [],
  }),

  routingConfidence: Annotation({
    default: () => 0,
  }),

  // Order extraction
  extractedOrder: Annotation({
    default: () => ({}),
  }),

  // Customer extraction

  extractedCustomer: Annotation({
    default: () => ({
      name: null,

      mobile: null,

      email: null,
    }),
  }),

  // Recommendation
  recommendation: Annotation({
    default: () => null,
  }),

  // RAG
  rag: Annotation({
    default: () => ({
      documents: [],
      context: "",
      normalizedQuery: "",
      enrichedQuery: "",
      filters: {},
    }),
  }),

  // Final response
  response: Annotation({
    default: () => null,
  }),

  executionPlan: Annotation({
    default: () => [],
  }),

  persistence: Annotation({
    default: () => ({
      customer: {
        dirty: false,
        updatedAt: null,
      },

      orderRequest: {
        dirty: false,
        updatedAt: null,
      },

      conversation: {
        dirty: false,
        updatedAt: null,
      },
    }),
  }),

  currentExecutionIndex: Annotation({
    default: () => 0,
  }),
  // Shared metadata
  metadata: Annotation({
    default: () => ({}),
  }),
  workflow: Annotation({
    default: () => "NONE",
  }),

  awaitingDecision: Annotation({
    default: () => false,
  }),

  pendingQuestions: Annotation({
    default: () => [],
  }),

  completedQuestions: Annotation({
    default: () => [],
  }),

  greetingCompleted: Annotation({
    default: () => false,
  }),

  capability: Annotation({
    default: () => null,
  }),
});

export default ConversationState;
