import { useState, useRef, useEffect } from "react";
import { useAuthContext } from "../../context/AuthContext";
import {
  Sparkles,
  Search,
  MoreVertical,
  ExternalLink,
  X,
  Paperclip,
  Smile,
  Mic,
  Send,
  FileText,
  Image as ImageIcon,
  Camera,
  Copy,
  Check,
  Bot,
  User,
  Trash2
} from "lucide-react";
import toast from "react-hot-toast";

const DEFAULT_CHIPS = [
  "Car race on mars",
  "What are the most popular shows on Netflix?",
  "Give me a recipe for banana bread",
  "What is cpp with code example",
  "Explain React state & Socket.IO"
];

const AIChatView = () => {
  const { authUser } = useAuthContext();
  const [showBanner, setShowBanner] = useState(true);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [messages, setMessages] = useState([
    {
      sender: "ai",
      text: `Namaste ${authUser?.fullname || "friend"}! 🙏 I am **Aryavarta AI**, your personal AI assistant.

Ask me anything — writing, coding, math, recipes, entertainment, history, or message drafting! ⚡`,
      timestamp: new Date()
    }
  ]);

  const messagesEndRef = useRef(null);
  const attachMenuRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (attachMenuRef.current && !attachMenuRef.current.contains(e.target)) {
        setShowAttachMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSend = async (queryText) => {
    const textToSend = (queryText || input).trim();
    if (!textToSend || loading) return;

    const userMsg = {
      sender: "user",
      text: textToSend,
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: textToSend })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "AI failed to respond");
      }

      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: data.reply,
          timestamp: new Date(data.timestamp || Date.now())
        }
      ]);
    } catch (err) {
      toast.error(err.message || "Failed to reach Aryavarta AI");
      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: "⚠️ Sorry, I encountered an issue answering. Please try again!",
          timestamp: new Date()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const copyText = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleClear = () => {
    setMessages([
      {
        sender: "ai",
        text: `Chat cleared! How can I assist you next, ${authUser?.fullname || "friend"}? ✨`,
        timestamp: new Date()
      }
    ]);
    toast.success("Aryavarta AI history reset");
  };

  return (
    <div className="flex-1 flex flex-col h-full min-h-0 bg-[#0b141a] overflow-hidden relative z-10 box-border">
      {/* WhatsApp Doodle Wallpaper Pattern */}
      <div
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#a855f7 0.75px, transparent 0.75px), radial-gradient(#64748b 0.75px, #0b141a 0.75px)`,
          backgroundSize: "30px 30px",
          backgroundPosition: "0 0, 15px 15px"
        }}
      />

      {/* 1. Header (Matching Screenshot 1:1) */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#202c33] border-b border-slate-700/50 flex-shrink-0 z-20 relative">
        <div className="flex items-center gap-3">
          {/* Purple Swirl Logo */}
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-600 via-pink-600 to-indigo-600 p-0.5 flex items-center justify-center shadow-lg shadow-purple-600/30 animate-spin-slow flex-shrink-0">
            <div className="w-full h-full bg-[#111b21] rounded-full flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-purple-400" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-tight">Aryavarta AI</h2>
              <span className="text-purple-400 text-xs">✨</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 text-slate-300">
          <button
            onClick={() => toast("Search in Aryavarta AI chat 🔍")}
            className="p-2 rounded-xl hover:bg-slate-700/60 hover:text-white transition-colors"
            title="Search"
          >
            <Search className="w-5 h-5" />
          </button>

          <button
            onClick={handleClear}
            className="p-2 rounded-xl hover:bg-slate-700/60 hover:text-white transition-colors"
            title="Clear Chat"
          >
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 2. Top Web Feature Banner (From Screenshot) */}
      {showBanner && (
        <div className="px-4 py-3 bg-[#182229]/95 border-b border-slate-700/60 flex items-center justify-between text-xs text-slate-300 z-10 animate-fade-in flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <ExternalLink className="w-4 h-4 text-purple-400 flex-shrink-0" />
            <span>
              On Aryavarta AI web you can organise your Aryavarta AI chats by topic, create AI-powered docs and more.{" "}
              <button
                onClick={() => toast.success("Aryavarta AI Docs & Topics activated! ✨")}
                className="text-emerald-400 font-bold hover:underline cursor-pointer ml-1"
              >
                Try it
              </button>
            </span>
          </div>
          <button
            onClick={() => setShowBanner(false)}
            className="p-1 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 3. Messages Stream */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 md:p-6 space-y-4">
        {/* Center Pill: Today */}
        <div className="flex items-center justify-center my-1">
          <span className="px-3 py-0.5 bg-[#182229] border border-slate-800 text-[10px] font-semibold text-slate-400 rounded-full shadow-inner">
            Today
          </span>
        </div>

        {/* AI Disclaimer Box matching Screenshot */}
        <div className="flex items-center justify-center my-2">
          <div className="px-5 py-3 bg-[#182229]/90 border border-slate-700/60 text-xs text-slate-300 rounded-2xl text-center max-w-lg shadow-lg leading-relaxed">
            Messages are generated by Aryavarta AI. Some may be inaccurate or inappropriate. You can improve the quality by sending feedback.{" "}
            <span className="text-purple-400 underline cursor-pointer hover:text-purple-300">
              Click to learn more.
            </span>
          </div>
        </div>

        {/* Message List */}
        {messages.map((msg, idx) => {
          const isAI = msg.sender === "ai";
          return (
            <div
              key={idx}
              className={`flex items-start gap-2.5 group ${
                isAI ? "justify-start" : "justify-end flex-row-reverse"
              }`}
            >
              {/* Avatar Icon */}
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 shadow ${
                  isAI
                    ? "bg-gradient-to-tr from-purple-600 via-pink-600 to-indigo-600 text-white"
                    : "bg-[#005c4b] text-white"
                }`}
              >
                {isAI ? <Sparkles className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
              </div>

              {/* Message Content */}
              <div
                className={`max-w-[85%] md:max-w-[75%] rounded-2xl p-4 text-[13.5px] leading-relaxed shadow-lg relative ${
                  isAI
                    ? "bg-[#202c33] text-[#e9edef] rounded-tl-xs border border-slate-700/50"
                    : "bg-[#005c4b] text-[#e9edef] rounded-tr-xs"
                }`}
              >
                <div className="whitespace-pre-wrap font-sans leading-relaxed">
                  {msg.text}
                </div>

                {/* Copy Button for AI */}
                {isAI && (
                  <div className="flex items-center justify-end mt-2 pt-2 border-t border-slate-700/50 text-xs text-slate-400">
                    <button
                      onClick={() => copyText(msg.text, idx)}
                      className="flex items-center gap-1 hover:text-purple-300 transition-colors"
                      title="Copy response"
                    >
                      {copiedIndex === idx ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400 text-[11px]">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span className="text-[11px]">Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {loading && (
          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
            </div>
            <div className="px-4 py-2.5 bg-[#202c33] rounded-2xl rounded-tl-xs border border-purple-900/40 flex items-center gap-1.5 shadow">
              <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
              <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
              <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" />
              <span className="text-xs text-purple-300 font-medium ml-2">Aryavarta AI is thinking...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 4. Horizontal Prompt Suggestion Chips (From Screenshot) */}
      <div className="px-4 py-2 bg-[#111b21]/80 border-t border-slate-800/60 flex items-center gap-2 overflow-x-auto flex-shrink-0 scrollbar-none">
        {DEFAULT_CHIPS.map((chipText, i) => (
          <button
            key={i}
            onClick={() => handleSend(chipText)}
            disabled={loading}
            className="px-3.5 py-1.5 rounded-full bg-[#202c33] hover:bg-[#2a3942] border border-slate-700/60 text-xs font-medium text-slate-200 hover:text-white flex-shrink-0 transition-all active:scale-95 disabled:opacity-50"
          >
            {chipText}
          </button>
        ))}
      </div>

      {/* 5. Input Bar with Paperclip Popover (From Screenshot) */}
      <div className="p-3 bg-[#202c33] border-t border-slate-700/50 flex-shrink-0 relative">
        {/* Attachment Menu Popup */}
        {showAttachMenu && (
          <div
            ref={attachMenuRef}
            className="absolute bottom-16 left-4 bg-[#233138] border border-slate-700/80 rounded-2xl shadow-2xl p-2 z-50 animate-fade-in w-48 space-y-1"
          >
            <button
              onClick={() => {
                setShowAttachMenu(false);
                toast.success("Document attached for Aryavarta AI analysis 📄");
              }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:bg-[#182229] transition-colors"
            >
              <div className="w-7 h-7 rounded-lg bg-purple-600/30 text-purple-400 flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
              <span>Document</span>
            </button>

            <button
              onClick={() => {
                setShowAttachMenu(false);
                toast.success("Image attached for Aryavarta AI vision 🖼️");
              }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:bg-[#182229] transition-colors"
            >
              <div className="w-7 h-7 rounded-lg bg-cyan-600/30 text-cyan-400 flex items-center justify-center">
                <ImageIcon className="w-4 h-4" />
              </div>
              <span>Photos & videos</span>
            </button>

            <button
              onClick={() => {
                setShowAttachMenu(false);
                toast.success("Camera opened 📷");
              }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:bg-[#182229] transition-colors"
            >
              <div className="w-7 h-7 rounded-lg bg-pink-600/30 text-pink-400 flex items-center justify-center">
                <Camera className="w-4 h-4" />
              </div>
              <span>Camera</span>
            </button>
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          {/* Paperclip Button */}
          <button
            type="button"
            onClick={() => setShowAttachMenu(!showAttachMenu)}
            className={`p-2 rounded-xl transition-colors ${
              showAttachMenu ? "text-purple-400 bg-slate-700" : "text-slate-400 hover:text-white"
            }`}
            title="Attach"
          >
            <Paperclip className="w-5 h-5" />
          </button>

          {/* Emoji Button */}
          <button
            type="button"
            onClick={() => toast("Emoji picker 😃")}
            className="p-2 text-slate-400 hover:text-white transition-colors"
            title="Emoji"
          >
            <Smile className="w-5 h-5" />
          </button>

          {/* Input Box */}
          <input
            type="text"
            placeholder="Type a message"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            className="flex-1 py-2 px-4 bg-[#2a3942] border-none rounded-xl text-sm text-slate-100 placeholder:text-slate-400 focus:outline-none"
          />

          {/* Send or Voice Note Button */}
          {input.trim() ? (
            <button
              type="submit"
              disabled={loading}
              className="p-2.5 rounded-full bg-[#00a884] hover:bg-[#02906f] text-white shadow-md transition-all active:scale-95 cursor-pointer"
              title="Send"
            >
              <Send className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => toast("Voice note for Aryavarta AI 🎙️")}
              className="p-2 text-slate-400 hover:text-white transition-colors"
              title="Voice note"
            >
              <Mic className="w-5 h-5" />
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

export default AIChatView;
