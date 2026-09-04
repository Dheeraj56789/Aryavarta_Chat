import "dotenv/config";
import mongoose from "mongoose";
import dbConnect from "../backend/DB/dbConnect.js";
import Conversation from "../backend/Models/conversationModels.js";
import Message from "../backend/Models/messageSchema.js";
import User from "../backend/Models/userModels.js";

const cleanOrphanedData = async () => {
    try {
        console.log("Connecting to MongoDB...");
        await dbConnect();

        // 1. Fetch all real user IDs
        const existingUsers = await User.find({}, "_id").lean();
        const existingUserIds = new Set(existingUsers.map(u => u._id.toString()));
        console.log(`Found ${existingUserIds.size} registered users in database.`);

        // 2. Find orphaned conversations (where participants no longer exist or have < 2 valid participants)
        const allConversations = await Conversation.find({}).lean();
        console.log(`Found ${allConversations.length} total conversations in database.`);

        let deletedConvs = 0;
        let deletedMsgs = 0;

        for (const conv of allConversations) {
            const validParticipants = (conv.participants || []).filter(p => p && existingUserIds.has(p.toString()));
            
            // If conversation has invalid participants or no messages
            if (validParticipants.length < 2) {
                console.log(`Cleaning orphaned/invalid conversation: ${conv._id}`);
                await Message.deleteMany({ conversationId: conv._id });
                await Conversation.deleteOne({ _id: conv._id });
                deletedConvs++;
            }
        }

        // 3. Clean any orphaned messages
        const validConvs = await Conversation.find({}, "_id").lean();
        const validConvIds = new Set(validConvs.map(c => c._id.toString()));
        const orphanedMessages = await Message.deleteMany({
            conversationId: { $nin: Array.from(validConvIds) }
        });
        deletedMsgs += orphanedMessages.deletedCount || 0;

        console.log(`\nCleanup Complete! ✅`);
        console.log(`- Removed ${deletedConvs} orphaned conversations`);
        console.log(`- Removed ${deletedMsgs} orphaned messages`);
        console.log(`Database is clean for testing!\n`);

        process.exit(0);
    } catch (err) {
        console.error("Cleanup error:", err);
        process.exit(1);
    }
};

cleanOrphanedData();
