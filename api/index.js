import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import dbConnect from "../backend/DB/dbConnect.js";
import authRouter from "../backend/rout/authUser.js";
import messageRouter from "../backend/rout/messageRout.js";
import userRouter from "../backend/rout/userRout.js";
import aiRouter from "../backend/rout/aiRoute.js";
import meetingRouter from "../backend/rout/meetingRoute.js";
import callRouter from "../backend/rout/callRoute.js";

const app = express();

// Flexible CORS for Vercel deployment & Local development
app.use(
    cors({
        origin: (origin, callback) => {
            // Allow all origins (browser requests with credentials)
            callback(null, true);
        },
        credentials: true
    })
);

app.use(express.json());
app.use(cookieParser());

// Serverless DB Connection check
app.use(async (req, res, next) => {
    try {
        await dbConnect();
        next();
    } catch (err) {
        console.error("[Vercel API DB Connection Error]:", err.message);
        return res.status(500).json({ success: false, message: "Database connection failed. Please check MongoDB Atlas access." });
    }
});

// Mount routes with BOTH /api prefix and without /api prefix
// (handles rewrite edge cases on Vercel gracefully)
app.use("/api/auth", authRouter);
app.use("/auth", authRouter);

app.use("/api/message", messageRouter);
app.use("/message", messageRouter);

app.use("/api/user", userRouter);
app.use("/user", userRouter);

app.use("/api/ai", aiRouter);
app.use("/ai", aiRouter);

app.use("/api/meeting", meetingRouter);
app.use("/meeting", meetingRouter);

app.use("/api/calls", callRouter);
app.use("/calls", callRouter);

// Health check endpoint
app.get(["/api/health", "/health"], (req, res) => {
    res.status(200).json({
        status: "online",
        runtime: "vercel-serverless",
        timestamp: new Date().toISOString()
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error("[API Unhandled Error]:", err);
    res.status(500).json({
        success: false,
        message: err.message || "An internal server error occurred"
    });
});

export default app;
