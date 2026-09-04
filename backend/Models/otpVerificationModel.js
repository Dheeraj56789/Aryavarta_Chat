import mongoose from "mongoose";

const otpVerificationSchema = new mongoose.Schema(
    {
        destination: {
            type: String,
            required: true,
            trim: true,
            index: true
        },
        destination_type: {
            type: String,
            required: true,
            enum: ["PHONE", "EMAIL"],
            uppercase: true
        },
        otp_hash: {
            type: String,
            required: true
        },
        purpose: {
            type: String,
            enum: ["signup", "login", "reset"],
            default: "signup"
        },
        attempts: {
            type: Number,
            default: 0,
            max: 5
        },
        request_count: {
            type: Number,
            default: 1
        },
        window_start: {
            type: Date,
            default: Date.now
        },
        last_sent_at: {
            type: Date,
            default: Date.now
        },
        expires_at: {
            type: Date,
            required: true,
            index: { expires: "10m" } // Automatic MongoDB TTL cleanup after expiration
        },
        verified_at: {
            type: Date,
            default: null
        },
        verification_token: {
            type: String,
            default: null
        }
    },
    { timestamps: true }
);

// Compound index for fast lookups
otpVerificationSchema.index({ destination: 1, purpose: 1 });

const OtpVerification = mongoose.model("OtpVerification", otpVerificationSchema);

export default OtpVerification;
