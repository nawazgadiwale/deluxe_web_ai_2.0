import mongoose from "mongoose";

/*
 * =====================================================
 * Order Item
 * =====================================================
 */

const OrderItemSchema = new mongoose.Schema(
  {
    product: {
      type: String,
      required: true,
      trim: true,
    },

    mainCategory: {
      type: String,
      default: null,
    },

    subCategory: {
      type: String,
      default: null,
    },

    quantity: {
      type: Number,
      default: null,
      min: 1,
    },

    /*
     * Artwork
     */

    artworkStatus: {
      type: String,
      enum: ["READY", "PENDING", "NEED_DESIGN"],
      default: null,
    },

    artworkFile: {
      type: String,
      default: null,
    },

    designRequirements: {
      type: String,
      default: null,
    },

    /*
     * Delivery
     */

    deadline: {
      type: String,
      default: null,
    },

    /*
     * Dynamic Specifications
     */

    specifications: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    /*
     * Additional Notes
     */

    notes: {
      type: String,
      default: null,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },

    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    _id: false,
  },
);

/*
 * =====================================================
 * Customer
 * =====================================================
 */

const CustomerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: null,
    },

    phone: {
      type: String,
      default: null,
    },

    email: {
      type: String,
      default: null,
    },

    company: {
      type: String,
      default: null,
    },
  },
  {
    _id: false,
  },
);

/*
 * =====================================================
 * Order
 * =====================================================
 */

const OrderSchema = new mongoose.Schema(
  {
    /*
     * Identity
     */

    orderNumber: {
      type: String,
      default: null,
      // unique: true,
      sparse: true,
    },

    sessionId: {
      type: String,
      required: true,
      index: true,
    },

    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      default: null,
    },

    leadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lead",
      default: null,
    },

    /*
     * Conversation State
     */

    status: {
      type: String,
      enum: ["COLLECTING", "REVIEW", "CONFIRMED", "CANCELLED"],
      default: "COLLECTING",
    },

    /*
     * Customer
     */

    customer: {
      type: CustomerSchema,
      default: () => ({}),
    },

    /*
     * Items
     */

    items: {
      type: [OrderItemSchema],
      default: [],
    },

    /*
     * Totals
     */

    totalItems: {
      type: Number,
      default: 0,
    },

    totalQuantity: {
      type: Number,
      default: 0,
    },

    /*
     * Order Notes
     */

    notes: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: "orders",
  },
);

export default mongoose.model("Order", OrderSchema);
