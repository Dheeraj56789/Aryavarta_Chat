import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuthContext } from "./AuthContext";
import { useSocketContext } from "./SocketContext";
import { soundEffects } from "../utils/sound";
import { voiceAssistant } from "../utils/voiceAssistant";
import toast from "react-hot-toast";

const ChatContext = createContext();

export const useChatContext = () => {
  return useContext(ChatContext);
};

export const ChatContextProvider = ({ children }) => {
  const { authUser, setAuthUser } = useAuthContext();
  const { socket } = useSocketContext();

  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loadingConversations, setLoadingConversations] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [typingMap, setTypingMap] = useState({});
  const [soundEnabled, setSoundEnabledState] = useState(true);

  // ================= 🎨 THEME & WALLPAPER SYSTEM =================
  const [theme, setThemeState] = useState(
    () => localStorage.getItem("aryavarta_theme") || "System default"
  );
  const [wallpaperColor, setWallpaperColorState] = useState(
    () => localStorage.getItem("aryavarta_wallpaper_color") || "default"
  );
  const [wallpaperDoodle, setWallpaperDoodleState] = useState(
    () => localStorage.getItem("aryavarta_wallpaper_doodle") !== "false"
  );
  const [customWallpaperUrl, setCustomWallpaperUrlState] = useState(
    () => localStorage.getItem("aryavarta_custom_wallpaper") || ""
  );
  const [fontSize, setFontSizeState] = useState(
    () => localStorage.getItem("aryavarta_font_size") || "100%"
  );
  const [enterIsSend, setEnterIsSendState] = useState(
    () => localStorage.getItem("aryavarta_enter_is_send") !== "false"
  );
  const [mediaQuality, setMediaQualityState] = useState(
    () => localStorage.getItem("aryavarta_media_quality") || "HD quality"
  );
  const [spellCheck, setSpellCheckState] = useState(
    () => localStorage.getItem("aryavarta_spell_check") !== "false"
  );
  const [replaceEmoji, setReplaceEmojiState] = useState(
    () => localStorage.getItem("aryavarta_replace_emoji") !== "false"
  );

  // ================= 🎙️ AI VOICE & PERSONALITY PREFERENCES =================
  const [aiPreferences, setAiPreferencesState] = useState(() => {
    const saved = localStorage.getItem("aryavarta_ai_preferences");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return {
      personality: authUser?.aiPreferences?.personality || "arya",
      voiceURI: authUser?.aiPreferences?.voiceURI || "default",
      voiceLanguage: authUser?.aiPreferences?.voiceLanguage || "en-US",
      voicePitch: authUser?.aiPreferences?.voicePitch || 1.0,
      voiceRate: authUser?.aiPreferences?.voiceRate || 1.0,
      autoSpeak: authUser?.aiPreferences?.autoSpeak !== undefined ? authUser.aiPreferences.autoSpeak : true,
      wakeWord: authUser?.aiPreferences?.wakeWord || false
    };
  });

  const updateAIPreferences = async (newPrefs) => {
    const merged = { ...aiPreferences, ...newPrefs };
    setAiPreferencesState(merged);
    localStorage.setItem("aryavarta_ai_preferences", JSON.stringify(merged));

    // Persist to MongoDB backend if user is logged in
    if (authUser?.token) {
      try {
        const res = await fetch("/api/user/ai-preferences", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authUser.token}`
          },
          body: JSON.stringify(merged)
        });
        if (res.ok) {
          const data = await res.json();
          if (data.aiPreferences) {
            setAuthUser((prev) => ({ ...prev, aiPreferences: data.aiPreferences }));
          }
        }
      } catch (err) {
        console.warn("Could not sync AI preferences to server:", err);
      }
    }
    toast.success("AI Voice & Personality updated! 🎙️✨");
  };

  // Set & Persist Theme
  const setTheme = (val) => {
    setThemeState(val);
    localStorage.setItem("aryavarta_theme", val);
    applyThemeToDOM(val);
  };

  const applyThemeToDOM = (val) => {
    const root = document.documentElement;
    if (val === "Light") {
      root.classList.remove("dark");
      root.classList.add("light");
    } else if (val === "Dark") {
      root.classList.remove("light");
      root.classList.add("dark");
    } else {
      const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (isDark) {
        root.classList.remove("light");
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
        root.classList.add("light");
      }
    }
  };

  useEffect(() => {
    applyThemeToDOM(theme);
  }, [theme]);

  const setWallpaperColor = (val) => {
    setWallpaperColorState(val);
    localStorage.setItem("aryavarta_wallpaper_color", val);
  };

  const setWallpaperDoodle = (val) => {
    setWallpaperDoodleState(val);
    localStorage.setItem("aryavarta_wallpaper_doodle", String(val));
  };

  const setCustomWallpaperUrl = (val) => {
    setCustomWallpaperUrlState(val);
    localStorage.setItem("aryavarta_custom_wallpaper", val);
  };

  const setFontSize = (val) => {
    setFontSizeState(val);
    localStorage.setItem("aryavarta_font_size", val);
  };

  const setEnterIsSend = (val) => {
    setEnterIsSendState(val);
    localStorage.setItem("aryavarta_enter_is_send", String(val));
  };

  const setMediaQuality = (val) => {
    setMediaQualityState(val);
    localStorage.setItem("aryavarta_media_quality", val);
  };

  const setSpellCheck = (val) => {
    setSpellCheckState(val);
    localStorage.setItem("aryavarta_spell_check", String(val));
  };

  const setReplaceEmoji = (val) => {
    setReplaceEmojiState(val);
    localStorage.setItem("aryavarta_replace_emoji", String(val));
  };

  const setSoundEnabled = (val) => {
    soundEffects.enabled = val;
    setSoundEnabledState(val);
  };

  // Fetch recent conversations & all users
  const fetchConversations = useCallback(async () => {
    if (!authUser) return;
    setLoadingConversations(true);
    try {
      const headers = authUser.token ? { Authorization: `Bearer ${authUser.token}` } : {};

      const [recentRes, allRes] = await Promise.all([
        fetch("/api/user/currentchatters", { headers }),
        fetch("/api/user/all", { headers })
      ]);

      if (recentRes.ok) {
        const data = await recentRes.json();
        setConversations(Array.isArray(data) ? data : []);
      }

      if (allRes.ok) {
        const allData = await allRes.json();
        setAllUsers(Array.isArray(allData) ? allData : []);
      }
    } catch (err) {
      console.error("Error fetching conversations:", err);
    } finally {
      setLoadingConversations(false);
    }
  }, [authUser]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Fetch messages when selected conversation changes
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedConversation?._id || !authUser) {
        setMessages([]);
        return;
      }
      setLoadingMessages(true);
      try {
        const headers = authUser.token ? { Authorization: `Bearer ${authUser.token}` } : {};
        const res = await fetch(`/api/message/${selectedConversation._id}`, { headers });
        if (res.ok) {
          const data = await res.json();
          setMessages(Array.isArray(data) ? data : []);
        } else {
          setMessages([]);
        }
      } catch (err) {
        console.error("Error fetching messages:", err);
        setMessages([]);
      } finally {
        setLoadingMessages(false);
      }
    };

    fetchMessages();
  }, [selectedConversation, authUser]);

  // Real-time socket message and typing listeners
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (newMessage) => {
      const isFromActiveChat = selectedConversation && newMessage.senderId === selectedConversation._id;

      if (isFromActiveChat) {
        setMessages((prev) => [...prev, newMessage]);
        soundEffects.playReceive();
      } else {
        soundEffects.playReceive();
        toast(`New message received! 💬`, {
          icon: "🔔",
          style: {
            borderRadius: "12px",
            background: "#1e293b",
            color: "#fff",
            border: "1px solid rgba(255,255,255,0.1)"
          }
        });
      }

      setConversations((prev) => {
        const existingIndex = prev.findIndex(
          (c) => c._id === newMessage.senderId || c._id === newMessage.receiverId
        );
        if (existingIndex !== -1) {
          const updated = [...prev];
          const item = updated.splice(existingIndex, 1)[0];
          item.lastMessage = newMessage.message;
          item.lastMessageTime = newMessage.createdAt || new Date().toISOString();
          return [item, ...updated];
        } else {
          fetchConversations();
          return prev;
        }
      });
    };

    const handleUserTyping = ({ senderId }) => {
      setTypingMap((prev) => ({ ...prev, [senderId]: true }));
    };

    const handleUserStoppedTyping = ({ senderId }) => {
      setTypingMap((prev) => ({ ...prev, [senderId]: false }));
    };

    socket.on("newMessage", handleNewMessage);
    socket.on("userTyping", handleUserTyping);
    socket.on("userStoppedTyping", handleUserStoppedTyping);

    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.off("userTyping", handleUserTyping);
      socket.off("userStoppedTyping", handleUserStoppedTyping);
    };
  }, [socket, selectedConversation, fetchConversations]);

  // Send message function
  const sendMessage = async (messageText) => {
    if (!selectedConversation?._id || !messageText.trim()) return;

    let finalText = messageText;
    if (replaceEmoji) {
      finalText = finalText
        .replace(/:\)/g, "😊")
        .replace(/:-\)/g, "😊")
        .replace(/:\(/g, "😢")
        .replace(/:-\(/g, "😢")
        .replace(/:D/g, "😃")
        .replace(/:p/i, "😛")
        .replace(/<3/g, "❤️");
    }

    try {
      const headers = {
        "Content-Type": "application/json",
        ...(authUser?.token ? { Authorization: `Bearer ${authUser.token}` } : {})
      };

      const res = await fetch(`/api/message/send/${selectedConversation._id}`, {
        method: "POST",
        headers,
        body: JSON.stringify({ message: finalText })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to send message");
      }

      setMessages((prev) => [...prev, data]);
      soundEffects.playSend();

      setConversations((prev) => {
        const existingIndex = prev.findIndex((c) => c._id === selectedConversation._id);
        if (existingIndex !== -1) {
          const updated = [...prev];
          const item = updated.splice(existingIndex, 1)[0];
          item.lastMessage = finalText;
          item.lastMessageTime = data.createdAt || new Date().toISOString();
          return [item, ...updated];
        } else {
          const newChatter = {
            ...selectedConversation,
            lastMessage: finalText,
            lastMessageTime: data.createdAt || new Date().toISOString()
          };
          return [newChatter, ...prev];
        }
      });
    } catch (err) {
      toast.error(err.message || "Could not send message");
    }
  };

  // Emit typing indicator
  const emitTyping = (isTyping) => {
    if (!socket || !selectedConversation?._id || !authUser?._id) return;
    if (isTyping) {
      socket.emit("typing", { senderId: authUser._id, receiverId: selectedConversation._id });
    } else {
      socket.emit("stopTyping", { senderId: authUser._id, receiverId: selectedConversation._id });
    }
  };

  // ================= ⚡ AUTONOMOUS ACTION DISPATCHER =================
  const executeAutonomousAction = async (action, appHooks = {}) => {
    if (!action || !action.type) return;

    switch (action.type) {
      case "OPEN_CHAT": {
        const query = action.targetName?.toLowerCase() || "";
        const target =
          conversations.find(
            (c) =>
              c.fullname.toLowerCase().includes(query) ||
              (c.username && c.username.toLowerCase().includes(query))
          ) ||
          allUsers.find(
            (u) =>
              u.fullname.toLowerCase().includes(query) ||
              (u.username && u.username.toLowerCase().includes(query))
          );

        if (target) {
          setSelectedConversation(target);
          if (appHooks.onClearAI) appHooks.onClearAI();
          toast.success(`Opened chat with ${target.fullname} 💬`);
        } else {
          toast.error(`Could not find contact matching "${action.targetName}"`);
        }
        break;
      }

      case "CLOSE_CHAT": {
        setSelectedConversation(null);
        if (appHooks.onClearAI) appHooks.onClearAI();
        toast("Chat closed ↩️");
        break;
      }

      case "SEND_MESSAGE": {
        const query = action.targetName?.toLowerCase() || "";
        const target =
          conversations.find(
            (c) =>
              c.fullname.toLowerCase().includes(query) ||
              (c.username && c.username.toLowerCase().includes(query))
          ) ||
          allUsers.find(
            (u) =>
              u.fullname.toLowerCase().includes(query) ||
              (u.username && u.username.toLowerCase().includes(query))
          );

        if (target) {
          setSelectedConversation(target);
          if (appHooks.onClearAI) appHooks.onClearAI();

          // Send message directly
          try {
            const headers = {
              "Content-Type": "application/json",
              ...(authUser?.token ? { Authorization: `Bearer ${authUser.token}` } : {})
            };
            const res = await fetch(`/api/message/send/${target._id}`, {
              method: "POST",
              headers,
              body: JSON.stringify({ message: action.text })
            });
            if (res.ok) {
              const data = await res.json();
              setMessages((prev) => [...prev, data]);
              soundEffects.playSend();
              toast.success(`Message sent to ${target.fullname}! ✉️⚡`);
            }
          } catch (err) {
            toast.error("Failed to deliver voice command message");
          }
        } else {
          toast.error(`Could not find contact "${action.targetName}" to send message`);
        }
        break;
      }

      case "NAVIGATE": {
        if (appHooks.onNavigate) {
          appHooks.onNavigate(action.targetView);
          toast.success(`Navigating to ${action.targetView} 🚀`);
        }
        break;
      }

      case "LOCK_APP": {
        if (appHooks.onLockApp) {
          appHooks.onLockApp();
          toast("App locked by voice command 🔐");
        }
        break;
      }

      default:
        break;
    }
  };

  const isCurrentChatTyping = selectedConversation ? !!typingMap[selectedConversation._id] : false;

  return (
    <ChatContext.Provider
      value={{
        selectedConversation,
        setSelectedConversation,
        messages,
        conversations,
        allUsers,
        loadingConversations,
        loadingMessages,
        isCurrentChatTyping,
        soundEnabled,
        setSoundEnabled,
        theme,
        setTheme,
        wallpaperColor,
        setWallpaperColor,
        wallpaperDoodle,
        setWallpaperDoodle,
        customWallpaperUrl,
        setCustomWallpaperUrl,
        fontSize,
        setFontSize,
        enterIsSend,
        setEnterIsSend,
        mediaQuality,
        setMediaQuality,
        spellCheck,
        setSpellCheck,
        replaceEmoji,
        setReplaceEmoji,
        aiPreferences,
        updateAIPreferences,
        executeAutonomousAction,
        sendMessage,
        emitTyping,
        fetchConversations
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
