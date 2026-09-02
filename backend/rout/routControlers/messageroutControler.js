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