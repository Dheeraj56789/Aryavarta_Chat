import CallLog from "../../Models/callLogModel.js";
import User from "../../Models/userModels.js";

// Helper to format date into friendly string
const formatCallTime = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();

    const timeStr = d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    if (isToday) {
        return `Today, ${timeStr}`;
    }

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) {
        return `Yesterday, ${timeStr}`;
    }

    return `${d.toLocaleDateString([], { month: "short", day: "numeric" })}, ${timeStr}`;
};

// GET /api/calls - Get call logs for logged-in user
export const getCallLogs = async (req, res) => {
    try {
        const currentUserId = req.user._id;

        // Query calls where current user is caller or receiver
        const calls = await CallLog.find({
            $or: [{ caller: currentUserId }, { receiver: currentUserId }]
        })
            .populate("caller", "fullname username profilepic gender")
            .populate("receiver", "fullname username profilepic gender")
            .sort({ createdAt: -1 })
            .limit(50);

        // Format for frontend consumption
        const formattedCalls = calls.map((call) => {
            const isCaller = call.caller && call.caller._id.toString() === currentUserId.toString();
            const otherParty = isCaller ? call.receiver : call.caller;

            let direction = "outgoing";
            if (!isCaller) {
                direction = call.status === "missed" ? "missed" : "incoming";
            } else if (call.status === "missed") {
                direction = "outgoing"; // from caller's perspective it was outgoing
            }

            return {
                _id: call._id,
                name: otherParty ? otherParty.fullname : "Unknown User",
                username: otherParty ? otherParty.username : "",
                profilepic: otherParty ? otherParty.profilepic : "",
                time: formatCallTime(call.createdAt || call.startedAt),
                type: direction, // "incoming" | "outgoing" | "missed"
                video: call.callType === "video",
                duration: call.duration || 0,
                status: call.status
            };
        });

        return res.status(200).json({
            success: true,
            calls: formattedCalls
        });
    } catch (error) {
        console.error("Error in getCallLogs controller:", error.message);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch call logs"
        });
    }
};

// POST /api/calls - Log a new call
export const logCall = async (req, res) => {
    try {
        const { receiverId, callType = "audio", status = "completed", duration = 0 } = req.body;
        const currentUserId = req.user._id;

        if (!receiverId) {
            return res.status(400).json({
                success: false,
                message: "Receiver ID is required"
            });
        }

        const newCall = new CallLog({
            caller: currentUserId,
            receiver: receiverId,
            callType,
            status,
            duration,
            startedAt: new Date()
        });

        await newCall.save();

        return res.status(201).json({
            success: true,
            call: newCall,
            message: "Call logged successfully"
        });
    } catch (error) {
        console.error("Error in logCall controller:", error.message);
        return res.status(500).json({
            success: false,
            message: "Failed to log call"
        });
    }
};
