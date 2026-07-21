import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
    {
        role: {
            type: String,
            enum: ["user", "assistant", "system"],
            required: true,
        },

        content: {
            type: String,
            required: true,
            trim: true,
        },

        timestamp: {
            type: Date,
            default: Date.now,
        },
    },
    {
        _id: false,
    }
);

const customerSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            trim: true,
            default: null,
        },

        phone: {
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
    }
);

const conversationSchema = new mongoose.Schema(
    {
        sessionId: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },

        customer: {
            type: customerSchema,
            default: () => ({}),
        },

        messages: {
            type: [messageSchema],
            default: [],
        },

        workflow: {
            type: String,
            default: null,
        },

        currentStep: {
            type: String,
            default: null,
        },

        memory: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
        },

        status: {
            type: String,
            enum: [
                "ACTIVE",
                "COMPLETED",
                "ABANDONED",
            ],
            default: "ACTIVE",
        },

        metadata: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

const Conversation = mongoose.model(
    "Conversation",
    conversationSchema
);

export default Conversation;