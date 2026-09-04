import { Server } from "socket.io";
import http from "http";
import express from "express";
import jwt from "jsonwebtoken";
import User from "../Models/userModels.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: ["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"],
        methods: ["GET", "POST"],
        credentials: true
    }
});

// Map of userId -> socketId
const userSocketMap = {};

export const getReceiverSocketId = (receiverId) => {
    return userSocketMap[receiverId];
};

// Force logout an active session for a specific user (emits to their room/socket and forcibly disconnects)
export const emitForceLogout = (userId, reason = "Your account was logged in from another location.") => {
    try {
        const uId = userId ? userId.toString() : null;
        if (!uId) return;

        console.log(`[SingleSession Backend] Step 4: Emitting force-logout to user ${uId}...`);
        const socketId = userSocketMap[uId];
        if (socketId) {
            console.log(`[SingleSession Backend] -> Emitted 'force-logout' directly to socketId: ${socketId}`);
            io.to(socketId).emit("force-logout", {
                reason,
                code: "SESSION_EXPIRED_ELSEWHERE"
            });
        }

        // Broadcast to user rooms
        console.log(`[SingleSession Backend] -> Broadcasted 'force-logout' to rooms 'user_${uId}' and '${uId}'`);
        io.to(`user_${uId}`).emit("force-logout", {
            reason,
            code: "SESSION_EXPIRED_ELSEWHERE"
        });
        io.to(uId).emit("force-logout", {
            reason,
            code: "SESSION_EXPIRED_ELSEWHERE"
        });

        // Server-side forced socket termination after 150ms buffer (allows TCP packet to reach client)
        setTimeout(() => {
            try {
                console.log(`[SingleSession Backend] -> Forcibly terminating server socket connection(s) for user ${uId}`);
                io.in(`user_${uId}`).disconnectSockets(true);
                io.in(uId).disconnectSockets(true);
                if (socketId) {
                    const activeSocket = io.sockets.sockets.get(socketId);
                    if (activeSocket) {
                        activeSocket.disconnect(true);
                    }
                }
            } catch (discErr) {
                console.warn("[SingleSession Backend] Warning during disconnectSockets:", discErr.message);
            }
        }, 150);
    } catch (err) {
        console.warn("[SingleSession Backend] Error emitting force-logout:", err);
    }
};

// =========================================================================
// 🔒 SOCKET AUTHENTICATION & SINGLE SESSION MIDDLEWARE
// =========================================================================
io.use(async (socket, next) => {
    try {
        const authHeader = socket.handshake.auth || {};
        const queryHeader = socket.handshake.query || {};

        let userId = authHeader.userId || queryHeader.userId;
        let sessionId = authHeader.sessionId || queryHeader.sessionId;
        const token = authHeader.token || queryHeader.token;

        // If a JWT token is supplied, decode it to reliably extract userId and sessionId
        if (token && token !== "undefined" && token !== "null") {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                if (decoded && decoded.userId) {
                    userId = decoded.userId;
                    if (decoded.sessionId) {
                        sessionId = decoded.sessionId;
                    }
                }
            } catch (jwtErr) {
                console.warn("[SocketAuth] Invalid socket JWT token:", jwtErr.message);
                return next(new Error("Authentication error: Invalid or expired token"));
            }
        }

        // Validate that userId is provided
        if (!userId || userId === "undefined" || userId === "null") {
            console.warn(`[SocketAuth] Rejected connection from ${socket.id}: Missing userId`);
            return next(new Error("Authentication error: Missing userId"));
        }

        // Verify user exists and check single session constraint
        const user = await User.findById(userId).select("currentSessionId fullname username");
        if (!user) {
            console.warn(`[SocketAuth] Rejected connection from ${socket.id}: User not found in DB`);
            return next(new Error("Authentication error: User not found"));
        }

        // If user has a currentSessionId in MongoDB, validate session
        if (user.currentSessionId) {
            if (!sessionId || sessionId === "undefined" || sessionId === "null" || (typeof sessionId === "string" && !sessionId.trim())) {
                console.warn(`[SocketAuth] Rejected connection from ${socket.id} for user ${userId}: Missing sessionId`);
                return next(new Error("Authentication error: Missing sessionId"));
            }

            if (user.currentSessionId !== sessionId) {
                console.log('Session invalidated for user', userId, '- old sessionId no longer matches');
                console.log(`[SingleSession] Rejected connection from ${socket.id} for user ${userId}. Session mismatch (DB: ${user.currentSessionId} !== Socket: ${sessionId})`);
                return next(new Error("SESSION_EXPIRED_ELSEWHERE"));
            }
        } else {
            // User currently has no session in DB (e.g. freshly created or logged out)
            if (!sessionId || sessionId === "undefined" || sessionId === "null" || (typeof sessionId === "string" && !sessionId.trim())) {
                console.warn(`[SocketAuth] Rejected connection from ${socket.id} for user ${userId}: No active session found`);
                return next(new Error("Authentication error: Missing sessionId"));
            }
        }

        // Attach verified user and session to socket
        socket.userId = userId;
        socket.sessionId = sessionId;
        socket.userDoc = user;

        console.log(`[SocketAuth] Authenticated socket ${socket.id} for user ${user.fullname} (${userId}) with sessionId: ${socket.sessionId}`);
        next();
    } catch (err) {
        console.error("[SocketAuth] Middleware error:", err.message);
        next(new Error("Internal server authentication error"));
    }
});

io.on("connection", (socket) => {
    const userId = socket.userId;
    const sessionId = socket.sessionId;

    console.log(`Socket connected: ${socket.id} with userId: ${userId}, sessionId: ${sessionId}`);

    if (userId) {
        userSocketMap[userId] = socket.id;
        socket.join(`user_${userId}`);
        socket.join(userId.toString());
    }

    // Broadcast online users to all clients
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    // Handle typing events
    socket.on("typing", ({ senderId, receiverId }) => {
        const receiverSocketId = getReceiverSocketId(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("userTyping", { senderId });
        }
    });

    socket.on("stopTyping", ({ senderId, receiverId }) => {
        const receiverSocketId = getReceiverSocketId(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("userStoppedTyping", { senderId });
        }
    });

    // WebRTC Video Meeting Rooms
    socket.on("join-meeting", ({ roomCode, user }) => {
        const roomName = `meeting_${roomCode}`;
        socket.join(roomName);
        console.log(`User ${user?.fullname || socket.id} joined room ${roomName}`);
        socket.to(roomName).emit("user-joined-meeting", {
            userId: user?._id || socket.id,
            user,
            socketId: socket.id
        });
    });

    socket.on("leave-meeting", ({ roomCode, user }) => {
        const roomName = `meeting_${roomCode}`;
        socket.leave(roomName);
        console.log(`User ${user?.fullname || socket.id} left room ${roomName}`);
        socket.to(roomName).emit("user-left-meeting", {
            userId: user?._id || socket.id,
            socketId: socket.id
        });
    });

    socket.on("end-meeting-for-all", ({ roomCode }) => {
        const roomName = `meeting_${roomCode}`;
        io.to(roomName).emit("meeting-ended-by-host", { roomCode });
    });

    socket.on("meeting-signal", ({ roomCode, to, signal, from }) => {
        if (to) {
            io.to(to).emit("meeting-signal", { signal, from, socketId: socket.id });
        } else {
            socket.to(`meeting_${roomCode}`).emit("meeting-signal", { signal, from, socketId: socket.id });
        }
    });

    // Handle disconnect
    socket.on("disconnect", () => {
        console.log(`Socket disconnected: ${socket.id}`);
        if (userId && userSocketMap[userId] === socket.id) {
            delete userSocketMap[userId];
        }
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
});

export { app, io, server };
