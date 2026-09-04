import mongoose from "mongoose";

const participantSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: false
        },
        fullname: {
            type: String,
            required: true,
            trim: true
        },
        username: {
            type: String,
            trim: true
        },
        profilepic: {
            type: String,
            default: ""
        },
        joinedAt: {
            type: Date,
            default: Date.now
        },
        leftAt: {
            type: Date
        }
    },
    { _id: false }
);

const meetingSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
            default: "Aryavarta Video Meeting"
        },
        code: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true
        },
        host: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        hostName: {
            type: String,
            default: "Host"
        },
        status: {
            type: String,
            enum: ["scheduled", "live", "ended"],
            default: "scheduled"
        },
        scheduledDate: {
            type: String,
            default: ""
        },
        startedAt: {
            type: Date,
            default: null
        },
        endedAt: {
            type: Date,
            default: null
        },
        duration: {
            type: String,
            default: "0 mins"
        },
        participants: [participantSchema]
    },
    { timestamps: true }
);

const Meeting = mongoose.model("Meeting", meetingSchema);

export default Meeting;
