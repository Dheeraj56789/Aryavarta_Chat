import { useState, useRef, useEffect } from "react";
import { useAuthContext } from "../../context/AuthContext";
import { useChatContext } from "../../context/ChatContext";
import { voiceAssistant } from "../../utils/voiceAssistant";
import {
  Sparkles,
  Search,
  MoreVertical,
  ExternalLink,
  X,
  Paperclip,
  Smile,
  Mic,
  MicOff,
  Send,
  FileText,
  Image as ImageIcon,
  Camera,
  Copy,
  Check,
  Bot,
  User,
  Trash2,
  Volume2,
  VolumeX,
  Zap,
  Radio
} from "lucide-react";
import toast from "react-hot-toast";

const DEFAULT_CHIPS = [
  "Open settings",
  "What is C++ with code example",
  "Explain Quantum Computing in Hindi",
  "Draft an email for leave request",
  "Open meetings",
  "Tell me a joke"
];

const AIChatView = ({ onNavigate, onLockApp }) => {
  const { authUser } = useAuthContext();
  const { aiPreferences, executeAutonomousAction } = useChatContext();

  const [showBanner, setShowBanner] = useState(true);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [speakingIndex, setSpeakingIndex] = useState(null);
  const [copiedIndex, setCopiedIndex] = useState(null);

  const [messages, setMessages] = useState([
    {
      sender: "ai",
      text: `Namaste ${authUser?.fullname || "friend"}! 🙏 I am **Aryavarta AI Voice Assistant** (${aiPreferences?.personality || "Arya"}).
      
I can answer your questions, write code, or execute voice commands like *"Open chat with Rahul"*, *"Send message to Priya"*, or *"Open settings"*! ⚡`,
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
        body: JSON.stringify({
          message: textToSend,
          personality: aiPreferences?.personality || "arya",
          language: aiPreferences?.voiceLanguage || "en-US"
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "AI failed to respond");
      }

      const aiMsg = {
        sender: "ai",
        text: data.reply,
        action: data.action || null,
        timestamp: new Date(data.timestamp || Date.now())
      };

      setMessages((prev) => [...prev, aiMsg]);

      // Execute autonomous action if returned
      if (data.action) {
        await executeAutonomousAction(data.action, {
          onNavigate,
          onLockApp
        });
      }

      // Auto-speak response if enabled
      if (aiPreferences?.autoSpeak !== false) {
        setSpeakingIndex(messages.length + 1);
        voiceAssistant.speak(data.reply, {
          voiceURI: aiPreferences?.voiceURI,
          pitch: aiPreferences?.voicePitch || 1.0,
          rate: aiPreferences?.voiceRate || 1.0,
          language: aiPreferences?.voiceLanguage || "en-US",
          onEnd: () => setSpeakingIndex(null)
        });
      }
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

  // Toggle Live Speech Recording
  const handleToggleVoiceInput = () => {
    if (isRecording) {
      voiceAssistant.stopListening();
      setIsRecording(false);
    } else {
      setIsRecording(true);
      voiceAssistant.startListening({
        language: aiPreferences?.voiceLanguage || "en-US",
        onTranscript: (liveText) => setInput(liveText),
        onFinal: (finalText) => {
          setIsRecording(false);
          if (finalText.trim()) {
            handleSend(finalText.trim());
          }
        },
        onError: () => setIsRecording(false),
        onEnd: () => setIsRecording(false)
      });
    }
  };

  // Speak / Stop AI Message Playback
  const handleToggleSpeak = (text, idx) => {
    if (speakingIndex === idx) {
      voiceAssistant.stopSpeaking();
      setSpeakingIndex(null);
    } else {
      setSpeakingIndex(idx);
      voiceAssistant.speak(text, {
        voiceURI: aiPreferences?.voiceURI,
        pitch: aiPreferences?.voicePitch || 1.0,
        rate: aiPreferences?.voiceRate || 1.0,
        language: aiPreferences?.voiceLanguage || "en-US",
        onEnd: () => setSpeakingIndex(null)
      });
    }
  };

  const copyText = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleClear = () => {
    voiceAssistant.stopSpeaking();
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
    <div className="flex-1 flex flex-col h-full min-h-0 bg-[#0b141a] overflow-hidden relative z-10 box-border select-none">
      {/* Background Pattern */}
      <div
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#a855f7 0.75px, transparent 0.75px), radial-gradient(#64748b 0.75px, #0b141a 0.75px)`,
          backgroundSize: "30px 30px",
          backgroundPosition: "0 0, 15px 15px"
        }}
      />

      {/* 1. Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#202c33] border-b border-slate-700/50 flex-shrink-0 z-20 relative">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-600 via-pink-600 to-indigo-600 p-0.5 flex items-center justify-center shadow-lg shadow-purple-600/30 animate-spin-slow flex-shrink-0">
            <div className="w-full h-full bg-[#111b21] rounded-full flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-purple-400" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-tight">Aryavarta AI Voice</h2>
              <span className="text-[10px] px-1.5 py-0.2 bg-purple-500/20 text-purple-400 font-bold rounded-md uppercase">
                {aiPreferences?.personality || "Arya"}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Multilingual Autonomous Assistant</p>
          </div>
        </div>

        <div className="flex items-center gap-1 text-slate-300">
          <button
            onClick={() => toast("Search in Aryavarta AI chat 🔍")}
            className="p-2 rounded-xl hover:bg-slate-700/60 hover:text-white transition-colors cursor-pointer"
            title="Search"
          >
            <Search className="w-5 h-5" />
          </button>

          <button
            onClick={handleClear}
            className="p-2 rounded-xl hover:bg-slate-700/60 hover:text-white transition-colors cursor-pointer"
            title="Clear Chat"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 2. Top Web Feature Banner */}
      {showBanner && (
        <div className="px-4 py-3 bg-[#182229]/95 border-b border-slate-700/60 flex items-center justify-between text-xs text-slate-300 z-10 animate-fade-in flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <Radio className="w-4 h-4 text-purple-400 flex-shrink-0 animate-pulse" />
            <span>
              Voice assistant active with <strong>{aiPreferences?.personality || "Arya"}</strong> persona. You can give voice commands to open chats, send messages, and navigate!
            </span>
          </div>
          <button onClick={() => setShowBanner(false)} className="p-1 text-slate-400 hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 3. Messages Stream */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 md:p-6 space-y-4">
        {messages.map((msg, idx) => {
          const isAI = msg.sender === "ai";
          const isSpeaking = speakingIndex === idx;

          return (
            <div
              key={idx}
              className={`flex items-start gap-2.5 group ${
                isAI ? "justify-start" : "justify-end flex-row-reverse"
              }`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 shadow ${
                  isAI
                    ? "bg-gradient-to-tr from-purple-600 via-pink-600 to-indigo-600 text-white"
                    : "bg-[#005c4b] text-white"
                }`}
              >
                {isAI ? <Sparkles className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
              </div>

              <div
                className={`max-w-[85%] md:max-w-[75%] rounded-2xl p-4 text-[13.5px] leading-relaxed shadow-lg relative ${
                  isAI
                    ? "bg-[#202c33] text-[#e9edef] rounded-tl-xs border border-slate-700/50"
                    : "bg-[#005c4b] text-[#e9edef] rounded-tr-xs"
                }`}
              >
                {/* Action Badge if Executed */}
                {msg.action && (
                  <div className="mb-2.5 p-2 bg-emerald-950/60 border border-emerald-500/40 rounded-xl flex items-center gap-2 text-xs text-emerald-300 font-semibold shadow-inner">
                    <Zap className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    <span>Action Executed: {msg.action.type}</span>
                  </div>
                )}

                <div className="whitespace-pre-wrap font-sans leading-relaxed">
                  {msg.text}
                </div>

                {/* AI Footer Toolbar: Speaker & Copy */}
                {isAI && (
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-700/50 text-xs text-slate-400">
                    <button
                      onClick={() => handleToggleSpeak(msg.text, idx)}
                      className={`flex items-center gap-1.5 transition-colors cursor-pointer ${
                        isSpeaking ? "text-emerald-400 font-bold" : "hover:text-purple-300"
                      }`}
                      title={isSpeaking ? "Stop Speaking" : "Play Voice"}
                    >
                      {isSpeaking ? (
                        <>
                          <VolumeX className="w-3.5 h-3.5" />
                          <span className="text-[11px] animate-pulse">Speaking...</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3.5 h-3.5" />
                          <span className="text-[11px]">Listen</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => copyText(msg.text, idx)}
                      className="flex items-center gap-1 hover:text-purple-300 transition-colors cursor-pointer"
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

      {/* 4. Suggestion Chips */}
      <div className="px-4 py-2 bg-[#111b21]/80 border-t border-slate-800/60 flex items-center gap-2 overflow-x-auto flex-shrink-0 scrollbar-none">
        {DEFAULT_CHIPS.map((chipText, i) => (
          <button
            key={i}
            onClick={() => handleSend(chipText)}
            disabled={loading}
            className="px-3.5 py-1.5 rounded-full bg-[#202c33] hover:bg-[#2a3942] border border-slate-700/60 text-xs font-medium text-slate-200 hover:text-white flex-shrink-0 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {chipText}
          </button>
        ))}
      </div>

      {/* 5. Message Input Bar with Voice Button */}
      <div className="p-3 bg-[#202c33] border-t border-slate-700/50 flex-shrink-0 relative">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          {/* Paperclip */}
          <button
            type="button"
            onClick={() => setShowAttachMenu(!showAttachMenu)}
            className={`p-2 rounded-xl transition-colors cursor-pointer ${
              showAttachMenu ? "text-purple-400 bg-slate-700" : "text-slate-400 hover:text-white"
            }`}
            title="Attach"
          >
            <Paperclip className="w-5 h-5" />
          </button>

          {/* Text Input */}
          <input
            type="text"
            placeholder={isRecording ? "Listening to your voice..." : "Ask AI or give command (e.g. Open settings)..."}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            className={`flex-1 py-2 px-4 bg-[#2a3942] border-none rounded-xl text-sm text-slate-100 placeholder:text-slate-400 focus:outline-none transition-all ${
              isRecording ? "ring-2 ring-purple-500 animate-pulse bg-purple-950/30" : ""
            }`}
          />

          {/* Send or Live Voice Mic Button */}
          {input.trim() ? (
            <button
              type="submit"
              disabled={loading}
              className="p-2.5 rounded-full bg-[#00a884] hover:bg-[#02906f] text-white shadow-md transition-all active:scale-95 cursor-pointer"
              title="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleToggleVoiceInput}
              className={`p-2.5 rounded-full transition-all active:scale-95 cursor-pointer ${
                isRecording
                  ? "bg-purple-600 text-white animate-ping"
                  : "bg-slate-700 hover:bg-slate-600 text-slate-200"
              }`}
              title={isRecording ? "Stop Listening" : "Speak to AI"}
            >
              {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-purple-400" />}
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

export default AIChatView;
