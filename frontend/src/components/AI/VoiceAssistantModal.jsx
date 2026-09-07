import { useState, useEffect, useRef } from "react";
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  X,
  Sparkles,
  Zap,
  Send,
  Radio,
  AlertCircle,
  Phone,
  Video,
  MessageSquare,
  User,
  Check,
  RotateCcw
} from "lucide-react";
import { useChatContext } from "../../context/ChatContext";
import { voiceAssistant } from "../../utils/voiceAssistant";
import toast from "react-hot-toast";

const LANGUAGES = [
  { code: "en-US", label: "English (US)", flag: "🇺🇸" },
  { code: "hi-IN", label: "हिंदी / Hinglish", flag: "🇮🇳" },
  { code: "es-ES", label: "Español", flag: "🇪🇸" },
  { code: "fr-FR", label: "Français", flag: "🇫🇷" },
  { code: "de-DE", label: "Deutsch", flag: "🇩🇪" }
];

const VoiceAssistantModal = ({ onClose, onNavigate, onLockApp }) => {
  const { aiPreferences, executeAutonomousAction, allUsers, conversations } = useChatContext();

  // States: "idle" | "listening" | "thinking" | "speaking"
  const [status, setStatus] = useState("idle");
  const [transcript, setTranscript] = useState("");
  const [inputText, setInputText] = useState("");
  const [assistantReply, setAssistantReply] = useState("");
  const [lastAction, setLastAction] = useState(null);
  const [clarificationCandidates, setClarificationCandidates] = useState([]);
  const [pendingIntent, setPendingIntent] = useState(null);
  const [pendingMessageText, setPendingMessageText] = useState("");
  const [selectedLang, setSelectedLang] = useState(aiPreferences?.voiceLanguage || "en-US");
  const [isMuted, setIsMuted] = useState(false);
  const [micPermissionError, setMicPermissionError] = useState(false);

  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    // Auto start listening when opening voice assistant
    handleStartListening();

    return () => {
      isMountedRef.current = false;
      voiceAssistant.stopListening();
      voiceAssistant.stopSpeaking();
    };
  }, []);

  const handleStartListening = async () => {
    voiceAssistant.stopSpeaking();
    setTranscript("");
    setClarificationCandidates([]);
    setMicPermissionError(false);
    setStatus("listening");

    // Check mic permission first
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        await navigator.mediaDevices.getUserMedia({ audio: true });
      }
    } catch (err) {
      console.warn("Microphone permission check warning:", err);
    }

    const started = voiceAssistant.startListening({
      language: selectedLang,
      continuous: false,
      onStart: () => {
        if (isMountedRef.current) setStatus("listening");
      },
      onTranscript: (liveText) => {
        if (isMountedRef.current) setTranscript(liveText);
      },
      onFinal: (finalText) => {
        if (finalText && finalText.trim()) {
          handleProcessVoiceQuery(finalText.trim());
        }
      },
      onError: (err) => {
        console.warn("Voice error:", err);
        if (isMountedRef.current) {
          setStatus("idle");
          if (err === "not-allowed" || err?.name === "NotAllowedError") {
            setMicPermissionError(true);
            toast.error("Microphone permission blocked. Please allow mic access in URL bar.");
          }
        }
      },
      onEnd: () => {
        if (isMountedRef.current && status === "listening") {
          setStatus("idle");
        }
      }
    });

    if (!started) {
      setStatus("idle");
    }
  };

  // Speak assistant feedback
  const speakFeedback = (text) => {
    if (isMuted || !text) return;
    setStatus("speaking");
    voiceAssistant.speak(text, {
      voiceURI: aiPreferences?.voiceURI,
      pitch: aiPreferences?.voicePitch || 1.0,
      rate: aiPreferences?.voiceRate || 1.0,
      language: selectedLang,
      onStart: () => {
        if (isMountedRef.current) setStatus("speaking");
      },
      onEnd: () => {
        if (isMountedRef.current) setStatus("idle");
      }
    });
  };

  // Main voice query processor
  const handleProcessVoiceQuery = async (queryText) => {
    if (!queryText.trim()) return;

    setStatus("thinking");
    setTranscript(queryText);
    setClarificationCandidates([]);

    try {
      // Prepare client contacts pool to pass for instant high-speed matching
      const contactPool = (allUsers || []).map((u) => ({
        _id: u._id,
        fullname: u.fullname,
        username: u.username,
        profilepic: u.profilepic || u.profilePic,
        gender: u.gender
      }));

      const res = await fetch("/api/ai/voice-command", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: queryText,
          language: selectedLang,
          contacts: contactPool
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to process command");
      }

      setAssistantReply(data.textReply || data.reply || "");

      // Case A: Ambiguous contact match -> Request clarification
      if (data.clarificationNeeded && Array.isArray(data.candidates) && data.candidates.length > 0) {
        setClarificationCandidates(data.candidates);
        setPendingIntent(data.intent);
        setPendingMessageText(data.messageText || "");
        speakFeedback(data.speechReply);
        return;
      }

      // Case B: Contact not found
      if (data.notFound) {
        speakFeedback(data.speechReply);
        return;
      }

      // Case C: Action is ready to execute!
      if (data.actionReady && data.action) {
        setLastAction(data.action);

        // Perform actual action in frontend
        await executeAutonomousAction(data.action, {
          onNavigate: (view) => {
            if (onNavigate) onNavigate(view);
          },
          onLockApp: () => {
            if (onLockApp) onLockApp();
          },
          onClearAI: () => {}
        });

        // Speak back voice confirmation
        if (data.speechReply) {
          speakFeedback(data.speechReply);
        }

        // Auto close assistant after action completion
        setTimeout(() => {
          if (isMountedRef.current) {
            onClose();
          }
        }, 1800);
        return;
      }

      // Case D: General conversation or question
      const reply = data.reply || data.textReply;
      setAssistantReply(reply);
      speakFeedback(reply);
    } catch (err) {
      console.error("Voice processing error:", err);
      toast.error(err.message || "Voice processing failed");
      setStatus("idle");
    }
  };

  // Handle user selecting a candidate contact from clarification options
  const handleSelectCandidate = async (contact) => {
    if (!contact || !pendingIntent) return;

    setClarificationCandidates([]);
    const actionObj = {
      type: pendingIntent,
      contact,
      text: pendingMessageText
    };

    setLastAction(actionObj);

    let speech = "";
    if (pendingIntent === "OPEN_CHAT") {
      speech = `Opening chat with ${contact.fullname}`;
    } else if (pendingIntent === "VOICE_CALL") {
      speech = `Calling ${contact.fullname} now`;
    } else if (pendingIntent === "VIDEO_CALL") {
      speech = `Starting video call with ${contact.fullname}`;
    } else if (pendingIntent === "SEND_MESSAGE") {
      speech = `Sending message to ${contact.fullname}`;
    }

    setAssistantReply(`Executing: ${speech}`);
    speakFeedback(speech);

    await executeAutonomousAction(actionObj, {
      onNavigate,
      onLockApp,
      onClearAI: () => {}
    });

    setTimeout(() => {
      if (isMountedRef.current) {
        onClose();
      }
    }, 1800);
  };

  const handleOrbClick = () => {
    if (status === "listening") {
      voiceAssistant.stopListening();
      setStatus("idle");
    } else if (status === "speaking") {
      voiceAssistant.stopSpeaking();
      setStatus("idle");
    } else {
      handleStartListening();
    }
  };

  const handleTextSubmit = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    const q = inputText;
    setInputText("");
    handleProcessVoiceQuery(q);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-fade-in select-none">
      <div className="w-full max-w-lg bg-gradient-to-b from-[#111b21] via-[#182229] to-[#0c1317] border border-slate-800 rounded-3xl p-6 text-white shadow-2xl space-y-4 relative flex flex-col items-center text-center">
        {/* Top Control Bar */}
        <div className="w-full flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-600/30">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="text-left">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <span>Aryavarta Voice Assistant</span>
                <span className="text-[10px] px-1.5 py-0.2 bg-emerald-500/20 text-emerald-400 font-bold rounded-md">
                  Active
                </span>
              </h3>
              <p className="text-[10px] text-slate-400">Speak naturally to control chats & calls</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Selector */}
            <select
              value={selectedLang}
              onChange={(e) => setSelectedLang(e.target.value)}
              className="py-1 px-2 bg-[#202c33] border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none cursor-pointer"
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.flag} {l.label}
                </option>
              ))}
            </select>

            {/* Mute/Unmute */}
            <button
              onClick={() => {
                setIsMuted(!isMuted);
                if (!isMuted) voiceAssistant.stopSpeaking();
              }}
              className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title={isMuted ? "Unmute Assistant Voice" : "Mute Assistant Voice"}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ================= 🌌 SIRI / GOOGLE STYLE 3D ORB & WAVEFORM ================= */}
        <div className="relative my-3 flex items-center justify-center cursor-pointer group" onClick={handleOrbClick}>
          {/* Listening Pulsing Rings */}
          {status === "listening" && (
            <>
              <div className="absolute w-44 h-44 rounded-full bg-cyan-500/30 animate-ping opacity-75 pointer-events-none" />
              <div className="absolute w-56 h-56 rounded-full bg-indigo-500/20 animate-pulse pointer-events-none" />
              {/* Dynamic Soundwave Equalizer Bars */}
              <div className="absolute flex items-center gap-1 -bottom-7 pointer-events-none">
                {[40, 70, 100, 60, 90, 50, 80, 40].map((h, i) => (
                  <div
                    key={i}
                    style={{ height: `${h}%`, animationDelay: `${i * 0.1}s` }}
                    className="w-1 bg-cyan-400 rounded-full animate-pulse h-4"
                  />
                ))}
              </div>
            </>
          )}

          {/* Thinking Spinner */}
          {status === "thinking" && (
            <div className="absolute w-44 h-44 rounded-full bg-purple-500/40 animate-spin pointer-events-none border-2 border-dashed border-purple-400" />
          )}

          {/* Speaking Equalizer Waves */}
          {status === "speaking" && (
            <>
              <div className="absolute w-48 h-48 rounded-full bg-emerald-500/30 animate-pulse pointer-events-none" />
              <div className="absolute w-60 h-60 rounded-full bg-emerald-500/15 animate-ping opacity-50 pointer-events-none" />
            </>
          )}

          {/* Glowing Orb Center */}
          <div
            className={`w-32 h-32 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 ${
              status === "listening"
                ? "bg-gradient-to-tr from-cyan-500 via-indigo-600 to-purple-600 shadow-[0_0_60px_rgba(6,182,212,0.8)] scale-110 ring-4 ring-cyan-400"
                : status === "thinking"
                ? "bg-gradient-to-tr from-purple-600 via-pink-600 to-amber-500 shadow-[0_0_60px_rgba(217,70,239,0.8)] animate-pulse"
                : status === "speaking"
                ? "bg-gradient-to-tr from-emerald-500 via-teal-600 to-cyan-500 shadow-[0_0_60px_rgba(16,185,129,0.8)] scale-110 ring-4 ring-emerald-400"
                : "bg-gradient-to-tr from-slate-700 via-slate-800 to-indigo-950 shadow-lg group-hover:scale-105 group-hover:shadow-[0_0_35px_rgba(99,102,241,0.5)]"
            }`}
          >
            {status === "listening" && <Mic className="w-12 h-12 text-white animate-bounce" />}
            {status === "thinking" && <Sparkles className="w-12 h-12 text-white animate-spin" />}
            {status === "speaking" && <Volume2 className="w-12 h-12 text-white animate-pulse" />}
            {status === "idle" && <Mic className="w-10 h-10 text-slate-300 group-hover:text-white transition-colors" />}
          </div>
        </div>

        {/* State Label */}
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-white">
            {status === "listening" && "🔴 Listening... Speak command now"}
            {status === "thinking" && "🧠 Understanding your command..."}
            {status === "speaking" && "🔊 Assistant speaking..."}
            {status === "idle" && "Tap Orb To Speak"}
          </h4>

          {micPermissionError ? (
            <p className="text-[11px] text-rose-400 font-semibold flex items-center justify-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Microphone blocked. Click 🔒 in browser URL bar to allow microphone.</span>
            </p>
          ) : (
            <p className="text-[11px] text-slate-400">
              Speak in <strong className="text-emerald-300">English</strong> or <strong className="text-emerald-300">Hindi/Hinglish</strong>
            </p>
          )}
        </div>

        {/* Live Transcript / Assistant Response Box */}
        {(transcript || assistantReply) && (
          <div className="w-full p-3.5 bg-[#182229] border border-slate-800 rounded-2xl text-left space-y-2 max-h-36 overflow-y-auto animate-fade-in shadow-inner">
            {transcript && (
              <div>
                <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block">You Said:</span>
                <p className="text-xs text-white italic">"{transcript}"</p>
              </div>
            )}

            {lastAction && (
              <div className="p-2 bg-emerald-950/60 border border-emerald-500/40 rounded-xl flex items-center gap-2 text-xs text-emerald-300 font-semibold shadow">
                <Zap className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Action Executed: {lastAction.type}</span>
              </div>
            )}

            {assistantReply && (
              <div className="pt-1 border-t border-slate-800">
                <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider block">Assistant:</span>
                <p className="text-xs text-slate-200 whitespace-pre-wrap leading-relaxed">{assistantReply}</p>
              </div>
            )}
          </div>
        )}

        {/* ================= 👥 CLARIFICATION CANDIDATES SELECTION ================= */}
        {clarificationCandidates.length > 0 && (
          <div className="w-full p-3.5 bg-slate-900/90 border border-indigo-500/40 rounded-2xl text-left space-y-2.5 animate-fade-in shadow-xl">
            <span className="text-xs font-bold text-indigo-300 block">
              Which contact did you mean? Tap to proceed:
            </span>
            <div className="grid grid-cols-1 gap-1.5 max-h-40 overflow-y-auto">
              {clarificationCandidates.map((c) => (
                <button
                  key={c._id}
                  onClick={() => handleSelectCandidate(c)}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-800 hover:bg-indigo-600/30 border border-slate-700 hover:border-indigo-500 transition-all text-left cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <img
                      src={c.profilepic || "/default-avatar.png"}
                      alt=""
                      className="w-8 h-8 rounded-full object-cover bg-slate-700"
                      onError={(e) => {
                        e.target.src = "https://api.dicebear.com/7.x/bottts/svg?seed=" + (c.username || "User");
                      }}
                    />
                    <div>
                      <span className="text-xs font-bold text-white block">{c.fullname}</span>
                      <span className="text-[10px] text-slate-400 block">@{c.username}</span>
                    </div>
                  </div>
                  <Check className="w-4 h-4 text-indigo-400" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Text Command Input Bar */}
        <form onSubmit={handleTextSubmit} className="w-full flex items-center gap-2">
          <input
            type="text"
            placeholder="Type voice command (e.g. Call Rahul)..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 py-2 px-3.5 bg-[#202c33] border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 font-medium"
          />
          <button
            type="submit"
            className="py-2 px-3.5 bg-[#5c7cd8] hover:bg-[#4a6ac6] text-white font-bold text-xs rounded-xl shadow-lg transition-transform active:scale-95 cursor-pointer flex items-center gap-1"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send</span>
          </button>
        </form>

        {/* Quick Voice Command Pills */}
        <div className="w-full flex items-center gap-1.5 overflow-x-auto scrollbar-none pt-1">
          {[
            "Call Rahul",
            "Video call Priya",
            "Rahul ka chat kholo",
            "Priya ko bolo I am on the way",
            "Open settings",
            "Lock app"
          ].map((cmd, i) => (
            <button
              key={i}
              onClick={() => handleProcessVoiceQuery(cmd)}
              className="px-2.5 py-1 bg-[#202c33] hover:bg-[#2a3942] border border-slate-700/60 rounded-full text-[11px] text-slate-300 hover:text-white transition-colors cursor-pointer whitespace-nowrap flex-shrink-0"
            >
              {cmd}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VoiceAssistantModal;
