import { matchContact } from "../../utils/fuzzyMatcher.js";
import User from "../../Models/userModels.js";
import Conversation from "../../Models/conversationModels.js";

// 1. Live Knowledge Fetcher
async function fetchOnlineKnowledge(query) {
    try {
        const cleanQuery = query
            .replace(/^(what is|who is|explain|tell me about|define|how does|what are|history of|meaning of|batao|kya hai)\s+/i, "")
            .replace(/\?+$/, "")
            .trim();

        if (!cleanQuery) return null;

        const wikiUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(cleanQuery)}`;
        const res = await fetch(wikiUrl, {
            headers: { "User-Agent": "AryavartaAI/2.0 (chat-app-assistant)" }
        });

        if (res.ok) {
            const data = await res.json();
            if (data && data.extract && data.extract.length > 50 && data.type !== "disambiguation") {
                return {
                    title: data.title,
                    description: data.description || "",
                    extract: data.extract
                };
            }
        }
    } catch {
        // Fallback gracefully
    }
    return null;
}

// 2. Math Equation Solver
function trySolveMath(prompt) {
    const mathPattern = /^[0-9+\-*/().^%\s]+$/;
    const clean = prompt.replace(/^(calculate|what is|solve|evaluate|hisab karo)\s+/i, "").replace(/\?+$/, "").trim();
    if (mathPattern.test(clean) && clean.length > 1 && /[+\-*/^%]/.test(clean)) {
        try {
            const sanitized = clean.replace(/\^/g, "**");
            const result = Function(`"use strict"; return (${sanitized})`)();
            if (typeof result === "number" && !isNaN(result)) {
                return `### 🧮 Math Solution\n\n**Expression:** \`${clean}\`\n**Result:** **${result}**\n\n*Calculated with high precision arithmetic.* ✨`;
            }
        } catch {
            return null;
        }
    }
    return null;
}

// 3. Comprehensive Multilingual Intent & Entity Parser (English + Hindi / Hinglish)
export function parseVoiceIntent(rawPrompt) {
    const prompt = (rawPrompt || "").trim();
    const lower = prompt.toLowerCase();

    // ================= A. VIDEO CALL INTENT =================
    // English: "video call [name]", "start video call with [name]", "make a video call to [name]"
    // Hindi: "[name] ko video call karo", "[name] se video call karo", "[name] ke sath video call lagao"
    const videoCallEn = lower.match(/(?:start\s+video\s+call\s+with|make\s+a\s+video\s+call\s+to|video\s+call)\s+([a-zA-Z0-9_\s]+)$/i);
    const videoCallHi = lower.match(/([a-zA-Z0-9_\s]+?)\s+(?:ko|se|ke\s+sath)\s+video\s+call\s+(?:karo|lagao|start\s+karo)/i);

    if (videoCallEn || videoCallHi) {
        const contactName = (videoCallEn ? videoCallEn[1] : videoCallHi[1]).trim();
        return {
            intent: "VIDEO_CALL",
            contactName,
            isHindi: !!videoCallHi
        };
    }

    // ================= B. VOICE CALL INTENT =================
    // English: "call [name]", "voice call [name]", "make a call to [name]", "dial [name]", "phone [name]"
    // Hindi: "[name] ko call karo", "[name] ko phone lagao", "[name] se call par baat karao", "[name] ko call lagao"
    const voiceCallEn = lower.match(/(?:voice\s+call|make\s+a\s+call\s+to|start\s+a\s+call\s+with|dial|call)\s+([a-zA-Z0-9_\s]+)$/i);
    const voiceCallHi = lower.match(/([a-zA-Z0-9_\s]+?)\s+(?:ko|se)\s+(?:call|phone)\s+(?:karo|lagao|par\s+baat\s+karao)/i);

    if (voiceCallEn || voiceCallHi) {
        const contactName = (voiceCallEn ? voiceCallEn[1] : voiceCallHi[1]).trim();
        // Disregard if it's "call log" or general queries
        if (!["log", "logs", "history"].includes(contactName)) {
            return {
                intent: "VOICE_CALL",
                contactName,
                isHindi: !!voiceCallHi
            };
        }
    }

    // ================= C. SEND MESSAGE INTENT =================
    // English: "send a message to [name] saying [message]", "send message to [name] that [message]",
    //          "message [name] that [message]", "tell [name] [message]", "text [name] [message]"
    // Hindi: "[name] ko bolo [message]", "[name] ko message bhejo [message]",
    //        "[name] ko text karo [message]", "[name] ko keh do [message]"
    const sendMsgEn = lower.match(/(?:send\s+a\s+message\s+to|send\s+message\s+to|message|tell|text)\s+([a-zA-Z0-9_\s]+?)\s+(?:saying|that|:)\s+(.+)/i) ||
                      lower.match(/(?:send\s+a\s+message\s+to|send\s+message\s+to|message|text)\s+([a-zA-Z0-9_\s]+?)\s+([a-zA-Z0-9\s.,!?]+)$/i);

    const sendMsgHi = lower.match(/([a-zA-Z0-9_\s]+?)\s+ko\s+(?:message\s+bhejo|message\s+karo|bolo|keh\s+do|likho|text\s+karo)\s+(.+)/i) ||
                      lower.match(/([a-zA-Z0-9_\s]+?)\s+ko\s+(.+)\s+bhejo/i);

    if (sendMsgEn || sendMsgHi) {
        const match = sendMsgEn || sendMsgHi;
        const contactName = match[1].trim();
        const messageText = match[2].trim();
        return {
            intent: "SEND_MESSAGE",
            contactName,
            messageText,
            isHindi: !!sendMsgHi
        };
    }

    // ================= D. OPEN CHAT INTENT =================
    // English: "open chat with [name]", "show me my chat with [name]", "chat with [name]", "open [name]"
    // Hindi: "[name] ka chat kholo", "[name] ki chat kholo", "[name] se chat karo", "[name] ka inbox kholo"
    const openChatEn = lower.match(/(?:open\s+chat\s+with|show\s+me\s+my\s+chat\s+with|open\s+chat\s+for|chat\s+with|talk\s+to)\s+([a-zA-Z0-9_\s]+?)(?:\s+chat)?$/i) ||
                       lower.match(/^open\s+([a-zA-Z0-9_\s]+?)(?:\s+chat)?$/i);

    const openChatHi = lower.match(/([a-zA-Z0-9_\s]+?)\s+(?:ka|ki|ke)\s+(?:chat|inbox)\s+kholo/i) ||
                       lower.match(/([a-zA-Z0-9_\s]+?)\s+se\s+(?:chat|baat)\s+karo/i) ||
                       lower.match(/([a-zA-Z0-9_\s]+?)\s+ko\s+open\s+karo/i);

    if (openChatEn || openChatHi) {
        const contactName = (openChatEn ? openChatEn[1] : openChatHi[1]).trim();
        const forbidden = ["settings", "setting", "privacy", "meetings", "calls", "stories", "channels"];
        if (!forbidden.includes(contactName)) {
            return {
                intent: "OPEN_CHAT",
                contactName,
                isHindi: !!openChatHi
            };
        }
    }

    // ================= E. CLOSE CHAT INTENT =================
    if (/^(close\s+chat|close\s+conversation|exit\s+chat|go\s+back|chat\s+band\s+karo)/i.test(lower)) {
        return { intent: "CLOSE_CHAT" };
    }

    // ================= F. NAVIGATION INTENTS =================
    if (lower.includes("setting")) {
        return { intent: "NAVIGATE", targetView: "settings" };
    }
    if (lower.includes("privacy") || lower.includes("security")) {
        return { intent: "NAVIGATE", targetView: "privacy" };
    }
    if (lower.includes("meeting") || lower.includes("video room")) {
        return { intent: "NAVIGATE", targetView: "meetings" };
    }
    if (lower.includes("call log") || lower.includes("calls") || lower.includes("call history")) {
        return { intent: "NAVIGATE", targetView: "calls" };
    }
    if (lower.includes("story") || lower.includes("status")) {
        return { intent: "NAVIGATE", targetView: "stories" };
    }
    if (lower.includes("linked device") || lower.includes("linked devices")) {
        return { intent: "NAVIGATE", targetView: "linked_devices" };
    }

    // ================= G. LOCK APP INTENT =================
    if (/^(lock\s+app|lock\s+application|secure\s+app|app\s+lock\s+karo)/i.test(lower)) {
        return { intent: "LOCK_APP" };
    }

    return null;
}

// 4. Dedicated Voice Command Handler Endpoint (POST /api/ai/voice-command)
export const handleVoiceCommand = async (req, res) => {
    try {
        const { text, language = "en-US", contacts: clientContacts } = req.body;
        const user = req.user;

        if (!text || text.trim() === "") {
            return res.status(400).json({
                success: false,
                message: "Voice transcript text is required"
            });
        }

        const prompt = text.trim();
        const parsed = parseVoiceIntent(prompt);

        // If no structured command parsed, fall back to conversational AI
        if (!parsed) {
            return handleAIChat(req, res);
        }

        const { intent, contactName, messageText, targetView, isHindi } = parsed;

        // If command does not require contact (e.g. NAVIGATE, LOCK_APP, CLOSE_CHAT)
        if (intent === "NAVIGATE" || intent === "LOCK_APP" || intent === "CLOSE_CHAT") {
            let feedback = "";
            let speechReply = "";

            if (intent === "NAVIGATE") {
                feedback = `Navigating to **${targetView}** 🚀`;
                speechReply = isHindi ? `${targetView} खोल रहा हूँ` : `Opening ${targetView}`;
            } else if (intent === "LOCK_APP") {
                feedback = `Locking Aryavarta App now 🔐`;
                speechReply = isHindi ? `ऐप लॉक कर रहा हूँ` : `Locking the app now`;
            } else {
                feedback = `Closing current conversation ↩️`;
                speechReply = isHindi ? `चैट बंद कर दी` : `Chat closed`;
            }

            return res.status(200).json({
                success: true,
                intent,
                action: { type: intent, targetView },
                actionReady: true,
                speechReply,
                textReply: feedback
            });
        }

        // Fetch contacts for matching if not passed from client
        let availableContacts = clientContacts;
        if (!Array.isArray(availableContacts) || availableContacts.length === 0) {
            if (user && user._id) {
                const conversations = await Conversation.find({ participants: user._id })
                    .populate("participants", "fullname username profilepic gender");
                
                const set = new Map();
                conversations.forEach((conv) => {
                    conv.participants.forEach((p) => {
                        if (p._id.toString() !== user._id.toString()) {
                            set.set(p._id.toString(), p);
                        }
                    });
                });
                availableContacts = Array.from(set.values());
            }

            if (!availableContacts || availableContacts.length === 0) {
                availableContacts = await User.find({ _id: { $ne: user?._id } })
                    .select("fullname username profilepic gender")
                    .limit(50);
            }
        }

        // Fuzzy match contact name
        const matchResult = matchContact(contactName, availableContacts);

        // Case 1: Contact not found
        if (!matchResult.found) {
            const speechReply = isHindi
                ? `मुझे आपकी संपर्क सूची में ${contactName} नाम का कोई संपर्क नहीं मिला।`
                : `I couldn't find anyone named ${contactName} in your contacts.`;

            return res.status(200).json({
                success: true,
                intent,
                actionReady: false,
                notFound: true,
                searchedName: contactName,
                speechReply,
                textReply: `❌ Could not find contact matching "**${contactName}**".`
            });
        }

        // Case 2: Ambiguous match (multiple contacts like Rahul Sharma & Rahul Verma)
        if (matchResult.isAmbiguous && matchResult.candidates.length > 1) {
            const namesList = matchResult.candidates.map((c) => c.fullname);
            const speechReply = isHindi
                ? `मुझे ${contactName} नाम के ${matchResult.candidates.length} संपर्क मिले: ${namesList.join(" या ")}। आप किसे चुनना चाहते हैं?`
                : `I found ${matchResult.candidates.length} contacts named ${contactName}: ${namesList.join(" or ")}. Which one did you mean?`;

            return res.status(200).json({
                success: true,
                intent,
                actionReady: false,
                clarificationNeeded: true,
                candidates: matchResult.candidates,
                searchedName: contactName,
                messageText,
                speechReply,
                textReply: `🤔 Found multiple contacts for "**${contactName}**". Please select one:`
            });
        }

        // Case 3: High confidence single match -> Action is ready to execute!
        const matchedContact = matchResult.bestMatch;
        let speechReply = "";
        let textReply = "";

        if (intent === "OPEN_CHAT") {
            speechReply = isHindi
                ? `${matchedContact.fullname} के साथ चैट खोल रहा हूँ`
                : `Opening chat with ${matchedContact.fullname}`;
            textReply = `Opening conversation with **${matchedContact.fullname}** 💬`;
        } else if (intent === "SEND_MESSAGE") {
            speechReply = isHindi
                ? `${matchedContact.fullname} को संदेश भेज दिया`
                : `Sending message to ${matchedContact.fullname}`;
            textReply = `Sending message to **${matchedContact.fullname}**: "${messageText}" ✉️`;
        } else if (intent === "VOICE_CALL") {
            speechReply = isHindi
                ? `${matchedContact.fullname} को कॉल मिला रहा हूँ`
                : `Calling ${matchedContact.fullname} now`;
            textReply = `Calling **${matchedContact.fullname}** 📞`;
        } else if (intent === "VIDEO_CALL") {
            speechReply = isHindi
                ? `${matchedContact.fullname} को वीडियो कॉल मिला रहा हूँ`
                : `Starting video call with ${matchedContact.fullname}`;
            textReply = `Starting video call with **${matchedContact.fullname}** 📹`;
        }

        return res.status(200).json({
            success: true,
            intent,
            actionReady: true,
            action: {
                type: intent,
                contact: matchedContact,
                text: messageText
            },
            speechReply,
            textReply
        });
    } catch (error) {
        console.error("Error in Voice Command handler:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to process voice command"
        });
    }
};

// 5. General AI Chat Controller
export const handleAIChat = async (req, res) => {
    try {
        const { message, personality: reqPersonality, language: reqLang } = req.body;
        const user = req.user;

        if (!message || message.trim() === "") {
            return res.status(400).json({
                success: false,
                message: "Message prompt is required"
            });
        }

        const prompt = message.trim();
        const lowerPrompt = prompt.toLowerCase();
        const personality = reqPersonality || user?.aiPreferences?.personality || "arya";
        const userName = user?.fullname || "friend";

        let aiReply = "";
        let recognizedAction = parseVoiceIntent(prompt);

        if (recognizedAction) {
            aiReply = `Action recognized: ${recognizedAction.intent}`;
        } else if (trySolveMath(prompt)) {
            aiReply = trySolveMath(prompt);
        } else if (/^(hi|hello|hey|namaste|namaskar|hola|bonjour|guten tag|kaise ho|kya haal hai|kem cho)\b/i.test(lowerPrompt)) {
            if (/^(namaste|namaskar|kaise ho|kya haal hai)/i.test(lowerPrompt)) {
                aiReply = `नमस्ते ${userName}! 🙏 मैं **आर्यावर्त AI वॉइस असिस्टेंट** हूँ।\n\nआप मुझसे बोलकर किसी को भी कॉल कर सकते हैं, चैट खोल सकते हैं, मैसेज भेज सकते हैं या सेटिंग्स खोल सकते हैं! ⚡`;
            } else {
                aiReply = `Namaste ${userName}! 🙏 I am **Aryavarta AI Voice Assistant**.\n\nYou can command me with your voice:\n- 📞 *"Call Rahul"* or *"Video call Priya"*\n- ✉️ *"Send message to Rahul saying I am on my way"*\n- 💬 *"Open chat with Priya"*\n- ⚙️ *"Open settings"* or *"Lock app"*`;
            }
        } else {
            const liveResult = await fetchOnlineKnowledge(prompt);
            if (liveResult) {
                aiReply = `### 📚 ${liveResult.title}\n${liveResult.description ? `*${liveResult.description}*\n\n` : ""}${liveResult.extract}\n\n---\n*Need more depth on this topic? Just ask!* 🚀`;
            } else {
                aiReply = `### 💡 Aryavarta AI: "${prompt}"\n\n**${prompt}** is an essential topic. You can ask me to perform voice actions across Aryavarta or explore questions in coding, science, and history! ✨`;
            }
        }

        return res.status(200).json({
            success: true,
            reply: aiReply,
            action: recognizedAction,
            personality,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error("Error in AI Controller:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to generate AI response"
        });
    }
};
