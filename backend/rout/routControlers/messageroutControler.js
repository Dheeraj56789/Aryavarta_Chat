import Conversation from "../../Models/conversationModels.js";
import Message from "../../Models/messageSchema.js";
import { getReceiverSocketId, io } from "../../socket/socket.js";

export const sendMessage = async (req, res) => {
    try {
        const { message } = req.body;
        const { id: receiverId } = req.params;
        const senderId = req.user._id;

        if (!message || message.trim() === "") {
            return res.status(400).json({
                success: false,
                message: "Message text cannot be empty"
            });
        }

        let conversation = await Conversation.findOne({
            participants: { $all: [senderId, receiverId] }
        });

        if (!conversation) {
            conversation = await Conversation.create({
                participants: [senderId, receiverId],
                messages: []
            });
        }

        const newMessage = new Message({
            senderId,
            receiverId,
            message,
            conversationId: conversation._id
        });

        if (newMessage) {
            conversation.messages.push(newMessage._id);
        }

        await Promise.all([conversation.save(), newMessage.save()]);

        // Real-time Socket.IO emission
        const receiverSocketId = getReceiverSocketId(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", newMessage);
        }

        return res.status(201).json(newMessage);
    } catch (error) {
        console.error("Error in sendMessage controller:", error.message);
        return res.status(500).json({
            success: false,
            message: "Internal server error while sending message"
        });
    }
};

export const getMessages = async (req, res) => {
    try {
        const { id: userToChatId } = req.params;
        const senderId = req.user._id;

        const conversation = await Conversation.findOne({
            participants: { $all: [senderId, userToChatId] }
        }).populate("messages");

        if (!conversation) {
            return res.status(200).json([]);
        }

        return res.status(200).json(conversation.messages);
    } catch (error) {
        console.error("Error in getMessages controller:", error.message);
        return res.status(500).json({
            success: false,
            message: "Internal server error while fetching messages"
        });
    }
};

export const deleteConversation = async (req, res) => {
    try {
        const { id } = req.params;
        const currentUserId = req.user._id;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Conversation or chatter ID is required"
            });
        }

        // 1. Find conversation where participants include both users
        let conversation = await Conversation.findOne({
            participants: { $all: [currentUserId, id] }
        });

        // 2. Fallback: Find conversation by conversation _id where current user is participant
        if (!conversation) {
            conversation = await Conversation.findOne({
                _id: id,
                participants: currentUserId
            });
        }

        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: "Conversation not found or you are not a participant"
            });
        }

        const conversationId = conversation._id;

        // Delete all messages belonging to this conversation
        await Message.deleteMany({
            $or: [
                { conversationId: conversationId },
                { _id: { $in: conversation.messages || [] } }
            ]
        });

        // Permanently remove the conversation document
        await Conversation.findByIdAndDelete(conversationId);

        return res.status(200).json({
            success: true,
            deletedId: id,
            conversationId: conversationId,
            message: "Conversation and messages permanently deleted"
        });
    } catch (error) {
        console.error("Error in deleteConversation controller:", error.message);
        return res.status(500).json({
            success: false,
            message: "Internal server error while deleting conversation"
        });
    }
};