import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuthContext } from "./AuthContext";
import { useSocketContext } from "./SocketContext";
import { soundEffects } from "../utils/sound";
import toast from "react-hot-toast";

const ChatContext = createContext();

export const useChatContext = () => {
  return useContext(ChatContext);
};

export const ChatContextProvider = ({ children }) => {
  const { authUser } = useAuthContext();
  const { socket } = useSocketContext();

  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loadingConversations, setLoadingConversations] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [typingMap, setTypingMap] = useState({});
  const [soundEnabled, setSoundEnabledState] = useState(true);

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
        // Notification for background chatter
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

      // Update sidebar conversation item with latest message
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
          // New conversation chatter
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

    try {
      const headers = {
        "Content-Type": "application/json",
        ...(authUser?.token ? { Authorization: `Bearer ${authUser.token}` } : {})
      };

      const res = await fetch(`/api/message/send/${selectedConversation._id}`, {
        method: "POST",
        headers,
        body: JSON.stringify({ message: messageText })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to send message");
      }

      setMessages((prev) => [...prev, data]);
      soundEffects.playSend();

      // Update sidebar last message
      setConversations((prev) => {
        const existingIndex = prev.findIndex((c) => c._id === selectedConversation._id);
        if (existingIndex !== -1) {
          const updated = [...prev];
          const item = updated.splice(existingIndex, 1)[0];
          item.lastMessage = messageText;
          item.lastMessageTime = data.createdAt || new Date().toISOString();
          return [item, ...updated];
        } else {
          const newChatter = {
            ...selectedConversation,
            lastMessage: messageText,
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
        sendMessage,
        emitTyping,
        fetchConversations
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
