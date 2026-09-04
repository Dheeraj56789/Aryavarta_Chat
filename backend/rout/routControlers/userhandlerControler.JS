import Conversation from "../../Models/conversationModels.js";
import User from "../../Models/userModels.js";
import OtpVerification from "../../Models/otpVerificationModel.js";
import { validateRealPhoneNumber } from "./userroutControler.js";
import { validateEmailWithMxAndDisposable } from "../../utils/emailValidator.js";

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
            // A conversation should only appear if messages actually exist between participants
            if (!conv.messages || conv.messages.length === 0) {
                return;
            }

            const otherUser = conv.participants.find(
                (p) => p && p._id.toString() !== currentUserID.toString()
            );

            if (otherUser && !chattersMap.has(otherUser._id.toString())) {
                const lastMessage = conv.messages[conv.messages.length - 1];

                chattersMap.set(otherUser._id.toString(), {
                    ...otherUser.toObject(),
                    conversationId: conv._id,
                    lastMessage: lastMessage ? lastMessage.message : "",
                    lastMessageTime: lastMessage ? lastMessage.createdAt : conv.updatedAt,
                    unreadCount: 0
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

export const updateAIPreferences = async (req, res) => {
    try {
        const currentUserID = req.user._id;
        const { personality, voiceURI, voiceLanguage, voicePitch, voiceRate, autoSpeak, wakeWord } = req.body;

        const updatedUser = await User.findByIdAndUpdate(
            currentUserID,
            {
                $set: {
                    "aiPreferences.personality": personality || "arya",
                    "aiPreferences.voiceURI": voiceURI || "default",
                    "aiPreferences.voiceLanguage": voiceLanguage || "en-US",
                    "aiPreferences.voicePitch": voicePitch !== undefined ? Number(voicePitch) : 1.0,
                    "aiPreferences.voiceRate": voiceRate !== undefined ? Number(voiceRate) : 1.0,
                    "aiPreferences.autoSpeak": autoSpeak !== undefined ? Boolean(autoSpeak) : true,
                    "aiPreferences.wakeWord": wakeWord !== undefined ? Boolean(wakeWord) : false
                }
            },
            { new: true }
        ).select("-password");

        return res.status(200).json({
            success: true,
            message: "AI Voice preferences updated successfully",
            aiPreferences: updatedUser.aiPreferences
        });
    } catch (error) {
        console.error("Error in updateAIPreferences:", error.message);
        return res.status(500).json({
            success: false,
            message: "Failed to update AI preferences"
        });
    }
};

// =========================================================================
// 👤 PROFILE UPDATE ENDPOINTS (SECURE VERIFIED EMAIL & PHONE CHANGES)
// =========================================================================

// PUT /api/user/profile - Update basic info (fullname, about, profilepic)
export const updateProfile = async (req, res) => {
    try {
        const currentUserID = req.user._id;
        const { fullname, about, profilepic } = req.body;

        const updateFields = {};
        if (fullname && fullname.trim()) updateFields.fullname = fullname.trim();
        if (about !== undefined) updateFields.about = about.trim();
        if (profilepic) updateFields.profilepic = profilepic;

        // Security safeguard: NEVER allow direct email or phone overwrite here
        delete req.body.email;
        delete req.body.phone;

        const updatedUser = await User.findByIdAndUpdate(
            currentUserID,
            { $set: updateFields },
            { new: true }
        ).select("-password");

        return res.status(200).json({
            success: true,
            user: updatedUser,
            message: "Profile updated successfully! ✨"
        });
    } catch (error) {
        console.error("Error in updateProfile:", error.message);
        return res.status(500).json({
            success: false,
            message: "Failed to update profile"
        });
    }
};

// POST /api/user/change-email - Commit email change ONLY after valid OTP verification
export const changeEmail = async (req, res) => {
    try {
        const currentUserID = req.user._id;
        const { newEmail, email_token } = req.body;

        if (!newEmail || !email_token) {
            return res.status(400).json({
                success: false,
                message: "New email and verification token are required"
            });
        }

        const cleanEmail = newEmail.trim().toLowerCase();

        // 1. Email format and disposable validation
        const emailValidation = await validateEmailWithMxAndDisposable(cleanEmail);
        if (!emailValidation.isValid) {
            return res.status(400).json({
                success: false,
                message: emailValidation.message
            });
        }

        // 2. Uniqueness check across all accounts
        const existingAccount = await User.findOne({
            email: cleanEmail,
            _id: { $ne: currentUserID }
        });
        if (existingAccount) {
            return res.status(400).json({
                success: false,
                message: "This email address is already linked to another account."
            });
        }

        // 3. Verify OTP session
        const FIFTEEN_MINUTES = 15 * 60 * 1000;
        const verification = await OtpVerification.findOne({
            destination: cleanEmail,
            verification_token: email_token,
            destination_type: "EMAIL"
        });

        if (
            !verification ||
            !verification.verified_at ||
            Date.now() - new Date(verification.verified_at).getTime() > FIFTEEN_MINUTES
        ) {
            return res.status(400).json({
                success: false,
                message: "Email verification expired or invalid. Please verify again."
            });
        }

        // 4. Update email
        const updatedUser = await User.findByIdAndUpdate(
            currentUserID,
            {
                $set: {
                    email: cleanEmail,
                    email_verified: true
                }
            },
            { new: true }
        ).select("-password");

        // Invalidate token
        await OtpVerification.deleteOne({ _id: verification._id });

        return res.status(200).json({
            success: true,
            user: updatedUser,
            message: "Email address changed and verified successfully! ✉️"
        });
    } catch (error) {
        console.error("Error in changeEmail:", error.message);
        return res.status(500).json({
            success: false,
            message: "Failed to update email address"
        });
    }
};

// POST /api/user/change-phone - Commit phone change ONLY after uniqueness check and OTP verification
export const changePhone = async (req, res) => {
    try {
        const currentUserID = req.user._id;
        const { newPhone, phone_token } = req.body;

        if (!newPhone || !phone_token) {
            return res.status(400).json({
                success: false,
                message: "New phone number and verification token are required"
            });
        }

        const phoneValidation = validateRealPhoneNumber(newPhone);
        if (!phoneValidation.isValid) {
            return res.status(400).json({
                success: false,
                message: phoneValidation.message
            });
        }
        const cleanPhone = phoneValidation.cleanPhone;

        // 1. Uniqueness check across all accounts
        const existingAccount = await User.findOne({
            phone: cleanPhone,
            _id: { $ne: currentUserID }
        });
        if (existingAccount) {
            return res.status(400).json({
                success: false,
                message: "This phone number is already linked to another account."
            });
        }

        // 2. Verify OTP session
        const FIFTEEN_MINUTES = 15 * 60 * 1000;
        const verification = await OtpVerification.findOne({
            destination: cleanPhone,
            verification_token: phone_token,
            destination_type: "PHONE"
        });

        if (
            !verification ||
            !verification.verified_at ||
            Date.now() - new Date(verification.verified_at).getTime() > FIFTEEN_MINUTES
        ) {
            return res.status(400).json({
                success: false,
                message: "Phone verification expired or invalid. Please verify again."
            });
        }

        // 3. Update phone
        const updatedUser = await User.findByIdAndUpdate(
            currentUserID,
            {
                $set: {
                    phone: cleanPhone,
                    phone_verified: true
                }
            },
            { new: true }
        ).select("-password");

        // Invalidate token
        await OtpVerification.deleteOne({ _id: verification._id });

        return res.status(200).json({
            success: true,
            user: updatedUser,
            message: "Phone number changed and verified successfully! 📱"
        });
    } catch (error) {
        console.error("Error in changePhone:", error.message);
        return res.status(500).json({
            success: false,
            message: "Failed to update phone number"
        });
    }
};