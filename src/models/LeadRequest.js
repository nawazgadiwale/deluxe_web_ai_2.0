import mongoose from "mongoose";

const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: null,
      trim: true,
    },

    phone: {
      type: String,
      default: null,
      trim: true,
    },

    email: {
      type: String,
      default: null,
      lowercase: true,
      trim: true,
    },

    company: {
      type: String,
      default: null,
      trim: true,
    },
  },
  {
    _id: false,
  },
);

const leadRequestSchema = new mongoose.Schema(
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

    type: {
      type: String,
      default: "GENERAL_ENQUIRY",
    },

    customer: {
      type: customerSchema,
      default: () => ({}),
    },

    notes: {
      type: String,
      default: null,
    },

    assignedTo: {
      role: String,
      name: String,
    },

    status: {
      type: String,
      enum: ["DRAFT", "COLLECTING_CUSTOMER", "SUBMITTED", "COMPLETED"],
      default: "DRAFT",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export default mongoose.model("LeadRequest", leadRequestSchema);
