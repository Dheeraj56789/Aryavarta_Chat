import Conversation from "../../Models/conversationModels.js";
import User from "../../Models/userModels.js";

export const getUserBySearch = async (req, res) => {
    try {
        const search = req.query.search || "";
        const currentUserID = req.user._id;

        const users = await User.find({
            $and: [
                {
                    $or: [
                        { username: { $regex: search, $options: "i" } },
                        { fullname: { $regex: search, $options: "i" } }
                    ]
                },
                {
                    _id: { $ne: currentUserID }
                }
            ]
        }).select("-password");

        return res.status(200).json(users);
    } catch (error) {
        console.error("Error in getUserBySearch controller:", error.message);
        return res.status(500).json({
            success: false,
            message: "Internal server error searching users"
        });
    }
};

export const getCurrentChatters = async (req, res) => {
    try {
        const currentUserID = req.user._id;

        const conversations = await Conversation.find({
            participants: currentUserID
        })
            .populate("participants", "-password")
            .populate("messages")
            .sort({ updatedAt: -1 });

        if (!conversations || conversations.length === 0) {
            return res.status(200).json([]);
        }

        // Map to unique other participants with their last message info
        const chattersMap = new Map();

        conversations.forEach((conv) => {
            const otherUser = conv.participants.find(
                (p) => p && p._id.toString() !== currentUserID.toString()
            );

            if (otherUser && !chattersMap.has(otherUser._id.toString())) {
                const lastMessage = conv.messages && conv.messages.length > 0
                    ? conv.messages[conv.messages.length - 1]
                    : null;

                chattersMap.set(otherUser._id.toString(), {
                    ...otherUser.toObject(),
                    lastMessage: lastMessage ? lastMessage.message : "",
                    lastMessageTime: lastMessage ? lastMessage.createdAt : conv.updatedAt
                });
            }
        });

        const chatters = Array.from(chattersMap.values());
        return res.status(200).json(chatters);
    } catch (error) {
        console.error("Error in getCurrentChatters controller:", error.message);
        return res.status(500).json({
            success: false,
            message: "Internal server error fetching chatters"
        });
    }
};

export const getAllUsers = async (req, res) => {
    try {
        const currentUserID = req.user._id;
        const users = await User.find({ _id: { $ne: currentUserID } }).select("-password");
        return res.status(200).json(users);
    } catch (error) {
        console.error("Error in getAllUsers controller:", error.message);
        return res.status(500).json({
            success: false,
            message: "Internal server error fetching all users"
        });
    }
};