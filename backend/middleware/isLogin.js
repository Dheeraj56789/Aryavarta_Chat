import jwt from "jsonwebtoken";
import User from "../Models/userModels.js";

const isLogin = async (req, res, next) => {
    try {
        let token = req.cookies?.jwt;

        if (!token && req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
            token = req.headers.authorization.split(" ")[1];
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: No token provided"
            });
        }

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (jwtErr) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: Invalid or expired token"
            });
        }

        if (!decoded || !decoded.userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: Invalid token payload"
            });
        }

        const user = await User.findById(decoded.userId).select("-password");
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // =========================================================================
        // 🔒 SINGLE SESSION ENFORCEMENT
        // If the user's currentSessionId exists in MongoDB and doesn't match the
        // token's embedded sessionId, a newer login has taken place elsewhere.
        // =========================================================================
        if (user.currentSessionId) {
            if (!decoded.sessionId || user.currentSessionId !== decoded.sessionId) {
                console.log('Session invalidated for user', user._id.toString(), '- old sessionId no longer matches');
                console.log(`[SingleSession] Session mismatch for user ${user._id}. Token sessionId: ${decoded.sessionId || 'NONE'}, DB currentSessionId: ${user.currentSessionId}`);

                // Immediately clear the invalidated JWT cookie from the client browser
                res.cookie("jwt", "", {
                    maxAge: 0,
                    httpOnly: true,
                    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
                    secure: process.env.NODE_ENV === "production"
                });

                return res.status(401).json({
                    success: false,
                    code: "SESSION_EXPIRED_ELSEWHERE",
                    message: "SESSION_EXPIRED_ELSEWHERE",
                    reason: "Your account was logged in from another location."
                });
            }
        } else if (user.currentSessionId === null) {
            // User was previously logged out
            res.cookie("jwt", "", {
                maxAge: 0,
                httpOnly: true,
                sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
                secure: process.env.NODE_ENV === "production"
            });
            return res.status(401).json({
                success: false,
                code: "SESSION_EXPIRED_ELSEWHERE",
                message: "SESSION_EXPIRED_ELSEWHERE",
                reason: "Session has ended. Please log in again."
            });
        }

        req.user = user;
        req.sessionId = decoded.sessionId || user.currentSessionId;
        next();
    } catch (error) {
        console.error("Error in isLogin middleware:", error.message);
        return res.status(500).json({
            success: false,
            message: "Internal server error in authentication"
        });
    }
};

export default isLogin;