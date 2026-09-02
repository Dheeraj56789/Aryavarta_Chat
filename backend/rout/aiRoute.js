import express from "express";
import { handleAIChat } from "./routControlers/aiController.js";
import jwt from "jsonwebtoken";
import User from "../Models/userModels.js";

const router = express.Router();

// Optional auth middleware for AI chat
const optionalAuth = async (req, res, next) => {
    try {
        let token = req.cookies?.jwt;
        if (!token && req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
            token = req.headers.authorization.split(" ")[1];
        }

        if (token && process.env.JWT_SECRET) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                if (decoded && decoded.userId) {
                    const user = await User.findById(decoded.userId).select("-password");
                    if (user) req.user = user;
                }
            } catch {
                // Ignore invalid token and continue as guest
            }
        }
        next();
    } catch {
        next();
    }
};

router.post("/chat", optionalAuth, handleAIChat);

export default router;
