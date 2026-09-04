import "dotenv/config";
import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import dbConnect from "./DB/dbConnect.js";
import authRouter from "./rout/authUser.js";
import messageRouter from "./rout/messageRout.js";
import userRouter from "./rout/userRout.js";
import aiRouter from "./rout/aiRoute.js";
import meetingRouter from "./rout/meetingRoute.js";
import callRouter from "./rout/callRoute.js";
import { app, server } from "./socket/socket.js";

const __dirname = path.resolve();

// Load .env from root and backend directories seamlessly
dotenv.config({ path: path.join(__dirname, ".env") });
dotenv.config({ path: path.join(__dirname, "backend", ".env") });

console.log('ENV CHECK - RESEND_API_KEY length:', (process.env.RESEND_API_KEY || '').length);
console.log("FAST2SMS_API_KEY loaded:", process.env.FAST2SMS_API_KEY ? "YES (" + process.env.FAST2SMS_API_KEY.length + " chars)" : "NO - UNDEFINED");
console.log("RESEND_API_KEY loaded:", process.env.RESEND_API_KEY ? "YES (" + process.env.RESEND_API_KEY.length + " chars)" : "NO - UNDEFINED");

const PORT = process.env.PORT || 3000;

// Middlewares
app.use(
    cors({
        origin: ["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"],
        credentials: true
    })
);
app.use(express.json());
app.use(cookieParser());

// API Routes
app.use("/api/auth", authRouter);
app.use("/api/message", messageRouter);
app.use("/api/user", userRouter);
app.use("/api/ai", aiRouter);
app.use("/api/meeting", meetingRouter);
app.use("/api/calls", callRouter);

// Health check
app.get("/api/health", (req, res) => {
    res.status(200).json({ status: "online", timestamp: new Date().toISOString() });
});

// Serve frontend in production if built
if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "frontend", "dist")));
    app.get("*", (req, res) => {
        res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
    });
} else {
    app.get("/", (req, res) => {
        res.send("Real-Time Chat Server is running smoothly! 🚀");
    });
}

server.listen(PORT, () => {
    dbConnect();
    console.log(`Server is running on port ${PORT} 🚀`);
});