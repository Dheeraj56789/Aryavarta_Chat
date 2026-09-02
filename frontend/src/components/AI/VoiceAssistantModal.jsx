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
  AlertCircle
} from "lucide-react";
import { useChatContext } from "../../context/ChatContext";
import { voiceAssistant } from "../../utils/voiceAssistant";
import toast from "react-hot-toast";

const LANGUAGES = [
  { code: "en-US", label: "English (US)", flag: "🇺🇸" },
  { code: "hi-IN", label: "हिंदी (Hindi)", flag: "🇮🇳" },
  { code: "es-ES", label: "Español", flag: "🇪🇸" },
  { code: "fr-FR", label: "Français", flag: "🇫🇷" },
  { code: "de-DE", label: "Deutsch", flag: "🇩🇪" },
  { code: "sa-IN", label: "संस्कृतम् (Sanskrit)", flag: "🕉️" }
];

const VoiceAssistantModal = ({ onClose, onNavigate, onLockApp, onOpenAIChat }) => {
  const { aiPreferences, executeAutonomousAction } = useChatContext();

  // State: "idle" | "listening" | "thinking" | "speaking"
  const [status, setStatus] = useState("idle");
  const [transcript, setTranscript] = useState("");
  const [inputText, setInputText] = useState("");
  const [lastResponse, setLastResponse] = useState("");
  const [lastAction, setLastAction] = useState(null);
  const [selectedLang, setSelectedLang] = useState(aiPreferences?.voiceLanguage || "en-US");
  const [isMuted, setIsMuted] = useState(!aiPreferences?.autoSpeak);
  const [micPermissionError, setMicPermissionError] = useState(false);

  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      voiceAssistant.stopListening();
      voiceAssistant.stopSpeaking();
    };
  }, []);

  const handleStartListening = async () => {
    voiceAssistant.stopSpeaking();
    setTranscript("");
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
      onStart: () => {
        if (isMountedRef.current) setStatus("listening");
      },
      onTranscript: (liveText) => {
        if (isMountedRef.current) setTranscript(liveText);
      },
      onFinal: (finalText) => {
        if (finalText.trim()) {
          handleProcessVoiceQuery(finalText.trim());
        }
      },
      onError: (err) => {
        console.warn("Voice error:", err);
        if (isMountedRef.current) {
          setStatus("idle");
          if (err === "not-allowed" || err?.name === "NotAllowedError") {
            setMicPermissionError(true);
            toast.error("Microphone permission blocked. Please allow mic in browser URL bar.");
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

  const handleProcessVoiceQuery = async (queryText) => {
    if (!queryText.trim()) return;

    setStatus("thinking");
    setTranscript(queryText);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: queryText,
          personality: aiPreferences?.personality || "arya",
          language: selectedLang
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to parse query");
      }

      setLastResponse(data.reply);
      setLastAction(data.action || null);

      // Execute autonomous action if returned
      if (data.action) {
        await executeAutonomousAction(data.action, {
          onNavigate: (view) => {
            if (onNavigate) onNavigate(view);
            onClose();
          },
          onLockApp: () => {
            if (onLockApp) onLockApp();
            onClose();
          },
          onClearAI: () => onClose()
        });
      }

      // Speak back with personalized voice
      if (!isMuted) {
        setStatus("speaking");
        voiceAssistant.speak(data.reply, {
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
      } else {
        setStatus("idle");
      }
    } catch (err) {
      toast.error(err.message || "AI voice processing failed");
      setStatus("idle");
    }
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
      <div className="w-full max-w-lg bg-gradient-to-b from-[#111b21] via-[#182229] to-[#0c1317] border border-slate-800 rounded-3xl p-6 text-white shadow-2xl space-y-5 relative flex flex-col items-center text-center">
        {/* Top Control Bar */}
        <div className="w-full flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-600/30">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="text-left">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <span>Aryavarta AI Voice</span>
                <span className="text-[10px] px-1.5 py-0.2 bg-purple-500/20 text-purple-400 font-bold rounded-md uppercase">
                  {aiPreferences?.personality || "Arya"}
                </span>
              </h3>
              <p className="text-[10px] text-slate-400">Autonomous Multilingual Assistant</p>
            </div>
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-2">
            {/* Language Selector */}
            <select
              value={selectedLang}
              onChange={(e) => setSelectedLang(e.target.value)}
              className="py-1 px-2 bg-[#202c33] border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none"
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.flag} {l.label}
                </option>
              ))}
            </select>

            {/* Mute/Unmute Toggle */}
            <button
              onClick={() => {
                setIsMuted(!isMuted);
                if (!isMuted) voiceAssistant.stopSpeaking();
              }}
              className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title={isMuted ? "Unmute Voice" : "Mute Voice"}
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

        {/* ================= 🌌 FUTURISTIC GLOWING 3D ORB ================= */}
        <div className="relative my-2 flex items-center justify-center cursor-pointer group" onClick={handleOrbClick}>
          {/* Status Animated Waves */}
          {status === "listening" && (
            <>
              <div className="absolute w-44 h-44 rounded-full bg-indigo-500/30 animate-ping opacity-75 pointer-events-none" />
              <div className="absolute w-56 h-56 rounded-full bg-cyan-500/20 animate-pulse pointer-events-none" />
            </>
          )}

          {status === "thinking" && (
            <div className="absolute w-44 h-44 rounded-full bg-purple-500/40 animate-spin pointer-events-none border-2 border-dashed border-purple-400" />
          )}

          {status === "speaking" && (
            <>
              <div className="absolute w-48 h-48 rounded-full bg-emerald-500/30 animate-pulse pointer-events-none" />
              <div className="absolute w-60 h-60 rounded-full bg-emerald-500/15 animate-ping opacity-50 pointer-events-none" />
            </>
          )}

          {/* Central Glowing Orb */}
          <div
            className={`w-32 h-32 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 ${
              status === "listening"
                ? "bg-gradient-to-tr from-cyan-500 via-indigo-600 to-purple-600 shadow-[0_0_50px_rgba(99,102,241,0.8)] scale-110 ring-4 ring-cyan-400"
                : status === "thinking"
                ? "bg-gradient-to-tr from-purple-600 via-pink-600 to-amber-500 shadow-[0_0_50px_rgba(217,70,239,0.8)] animate-pulse"
                : status === "speaking"
                ? "bg-gradient-to-tr from-emerald-500 via-teal-600 to-cyan-500 shadow-[0_0_50px_rgba(16,185,129,0.8)] scale-110 ring-4 ring-emerald-400"
                : "bg-gradient-to-tr from-slate-700 via-slate-800 to-indigo-950 shadow-lg group-hover:scale-105 group-hover:shadow-[0_0_30px_rgba(99,102,241,0.4)]"
            }`}
          >
            {status === "listening" && <Mic className="w-12 h-12 text-white animate-bounce" />}
            {status === "thinking" && <Sparkles className="w-12 h-12 text-white animate-spin" />}
            {status === "speaking" && <Volume2 className="w-12 h-12 text-white animate-pulse" />}
            {status === "idle" && <Mic className="w-10 h-10 text-slate-300 group-hover:text-white transition-colors" />}
          </div>
        </div>

        {/* State Title */}
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-white">
            {status === "listening" && "🔴 Listening... Speak now"}
            {status === "thinking" && "🧠 Thinking & Parsing Command..."}
            {status === "speaking" && "🔊 Aryavarta AI Speaking..."}
            {status === "idle" && "Tap Orb To Speak Or Type Below"}
          </h4>

          {micPermissionError ? (
            <p className="text-[11px] text-rose-400 font-semibold flex items-center justify-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Microphone blocked in browser. Click 🔒 in URL bar and set Camera/Mic to Allow.</span>
            </p>
          ) : (
            <p className="text-[11px] text-slate-400">
              Try saying: <strong className="text-purple-300">"Open settings"</strong> or <strong className="text-purple-300">"Kaise ho?"</strong>
            </p>
          )}
        </div>

        {/* Live Transcript / Result Box */}
        {(transcript || lastResponse) && (
          <div className="w-full p-3.5 bg-[#182229] border border-slate-800 rounded-2xl text-left space-y-2 max-h-40 overflow-y-auto animate-fade-in shadow-inner">
            {transcript && (
              <div>
                <span className="text-[10px] font-bold text-indigo-400 uppercase block tracking-wider">You Said:</span>
                <p className="text-xs text-white italic">"{transcript}"</p>
              </div>
            )}

            {lastAction && (
              <div className="p-2 bg-emerald-950/60 border border-emerald-500/40 rounded-xl flex items-center gap-2 text-xs text-emerald-300 font-semibold shadow">
                <Zap className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Action Executed: {lastAction.type}</span>
              </div>
            )}

            {lastResponse && (
              <div className="pt-1 border-t border-slate-800">
                <span className="text-[10px] font-bold text-purple-400 uppercase block tracking-wider">Aryavarta AI:</span>
                <p className="text-xs text-slate-200 whitespace-pre-wrap leading-relaxed">{lastResponse}</p>
              </div>
            )}
          </div>
        )}

        {/* Text Command Input Bar */}
        <form onSubmit={handleTextSubmit} className="w-full flex items-center gap-2">
          <input
            type="text"
            placeholder="Type command or question (e.g. Open settings)..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 py-2 px-3.5 bg-[#202c33] border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500 font-medium"
          />
          <button
            type="submit"
            className="py-2 px-3.5 bg-[#5c7cd8] hover:bg-[#4a6ac6] text-white font-bold text-xs rounded-xl shadow-lg transition-transform active:scale-95 cursor-pointer flex items-center gap-1"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send</span>
          </button>
        </form>

        {/* Bottom Quick Command Pills */}
        <div className="w-full flex items-center justify-center gap-1.5 overflow-x-auto scrollbar-none pt-1">
          {[
            "Open settings",
            "Open meetings",
            "Lock app",
            "Kaise ho?"
          ].map((cmd, i) => (
            <button
              key={i}
              onClick={() => handleProcessVoiceQuery(cmd)}
              className="px-3 py-1.5 bg-[#202c33] hover:bg-[#2a3942] border border-slate-700/60 rounded-full text-xs text-slate-300 hover:text-white transition-colors cursor-pointer flex-shrink-0"
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
