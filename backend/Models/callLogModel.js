import mongoose from "mongoose";

const callLogSchema = new mongoose.Schema(
    {
        caller: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        receiver: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        callType: {
            type: String,
            enum: ["audio", "video"],
            default: "audio"
        },
        status: {
            type: String,
            enum: ["incoming", "outgoing", "missed", "rejected", "completed"],
            default: "completed"
        },
        duration: {
            type: Number, // in seconds
            default: 0
        },
        startedAt: {
            type: Date,
            default: Date.now
        },
        endedAt: {
            type: Date
        }
    },
    { timestamps: true }
);

// Optimize query for fetching a user's calls
callLogSchema.index({ caller: 1, createdAt: -1 });
callLogSchema.index({ receiver: 1, createdAt: -1 });

const CallLog = mongoose.model("CallLog", callLogSchema);

export default CallLog;
