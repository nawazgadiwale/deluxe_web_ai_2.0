import mongoose from "mongoose";

const customerSnapshotSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      default: null,
    },

    mobile: {
      type: String,
      trim: true,
      default: null,
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: null,
    },

    company: {
      type: String,
      trim: true,
      default: null,
    },
  },
  {
    _id: false,
  },
);

const orderItemSchema = new mongoose.Schema(
  {
    itemId: {
      type: String,
      required: true,
    },

    mainCategory: {
      type: String,
      required: true,
    },

    subCategory: {
      type: String,
      default: null,
    },

    product: {
      type: String,
      required: true,
    },

    quantity: {
      type: Number,
      default: null,
    },

    specifications: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {},
    },

    artwork: {
      type: String,
      default: null,
    },

    deadline: {
      type: Date,
      default: null,
    },

    salesperson: {
      type: String,
      default: null,
    },

    status: {
      type: String,
      enum: ["PENDING", "ASSIGNED", "QUOTED", "CONFIRMED", "CANCELLED"],
      default: "PENDING",
    },
  },
  {
    _id: false,
  },
);

const orderRequestSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true,
    },

    sessionId: {
      type: String,
      required: true,
      index: true,
    },

    customer: {
      type: customerSnapshotSchema,
      default: () => ({}),
    },

    items: {
      type: [orderItemSchema],
      default: [],
    },

    notes: {
      type: String,
      default: null,
    },

    assignedTo: {
      type: String,
      default: null,
    },

    quotationNumber: {
      type: String,
      default: null,
    },

    status: {
      type: String,
      enum: ["DRAFT", "SUBMITTED", "PROCESSING", "COMPLETED", "CANCELLED"],
      default: "DRAFT",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

const OrderRequest = mongoose.model("OrderRequest", orderRequestSchema);

export default OrderRequest;
