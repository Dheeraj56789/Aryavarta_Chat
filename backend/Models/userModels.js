import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        fullname: {
            type: String,
            required: true,
            trim: true
        },
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
            minlength: 3
        },
        email: {
            type: String,
            required: false,
            unique: true,
            sparse: true,
            trim: true,
            lowercase: true
        },
        email_verified: {
            type: Boolean,
            default: false
        },
        phone: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        phone_verified: {
            type: Boolean,
            default: false
        },
        gender: {
            type: String,
            required: true,
            enum: ["male", "female", "other"],
            default: "male"
        },
        country: {
            type: String,
            default: "India",
            trim: true
        },
        state: {
            type: String,
            default: "Uttar Pradesh",
            trim: true
        },
        district: {
            type: String,
            default: "Lucknow",
            trim: true
        },
        pincode: {
            type: String,
            default: "226001",
            trim: true
        },
        password: {
            type: String,
            default: "$2a$10$wN1H1m3mBfO1eLzZ/Q2yU.hD7Vd8i9o0p1q2r3s4t5u6v7w8x9y0z" // default secure hash
        },
        profilepic: {
            type: String,
            default: ""
        },
        about: {
            type: String,
            default: "Available | Using Aryavarta 🚀"
        },
        isOnline: {
            type: Boolean,
            default: false
        },
        lastSeen: {
            type: Date,
            default: Date.now
        },
        aiPreferences: {
            preferredVoice: {
                type: String,
                default: "Arya (Natural Hindi/English)"
            },
            personality: {
                type: String,
                default: "arya"
            },
            speechSpeed: {
                type: Number,
                default: 1.0
            },
            speechPitch: {
                type: Number,
                default: 1.0
            },
            language: {
                type: String,
                default: "en-US"
            }
        }
    },
    { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;