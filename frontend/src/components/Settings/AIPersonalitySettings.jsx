import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Sparkles,
  Volume2,
  Sliders,
  Check,
  Play,
  RotateCcw,
  Languages,
  Mic
} from "lucide-react";
import { useChatContext } from "../../context/ChatContext";
import { voiceAssistant } from "../../utils/voiceAssistant";
import toast from "react-hot-toast";

const PERSONALITIES = [
  {
    id: "arya",
    name: "Arya",
    tagline: "Friendly & Cheerful",
    description: "Supportive, enthusiastic, and warm conversational companion.",
    icon: "🌸",
    preview: "Namaste! I am Arya. I'm excited to help you manage your chats, draft messages, and answer your questions!"
  },
  {
    id: "chanakya",
    name: "Chanakya",
    tagline: "Wise & Strategic",
    description: "Analytical, strategic thinker offering tactical advice and deep knowledge.",
    icon: "📜",
    preview: "Knowledge and decisive action rule the world. State your query, and we shall formulate a strategic response."
  },
  {
    id: "saraswati",
    name: "Saraswati",
    tagline: "Scholarly & Poetic",
    description: "Cultural, thoughtful guide versed in literature, philosophy, and sciences.",
    icon: "🪕",
    preview: "Vidya Dadati Vinayam. May wisdom and clarity illuminate all your conversations and decisions."
  },
  {
    id: "techpro",
    name: "TechPro",
    tagline: "Concise & Fast",
    description: "Ultra-crisp, efficient developer assistant delivering direct solutions.",
    icon: "⚡",
    preview: "TechPro online. Ready to execute commands, debug code, and manage chats with zero latency."
  }
];

const AIPersonalitySettings = ({ onBack }) => {
  const { aiPreferences, updateAIPreferences } = useChatContext();

  const [personality, setPersonality] = useState(aiPreferences?.personality || "arya");
  const [voiceURI, setVoiceURI] = useState(aiPreferences?.voiceURI || "default");
  const [voiceLanguage, setVoiceLanguage] = useState(aiPreferences?.voiceLanguage || "en-US");
  const [voicePitch, setVoicePitch] = useState(aiPreferences?.voicePitch || 1.0);
  const [voiceRate, setVoiceRate] = useState(aiPreferences?.voiceRate || 1.0);
  const [autoSpeak, setAutoSpeak] = useState(aiPreferences?.autoSpeak !== false);
  const [availableVoices, setAvailableVoices] = useState([]);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);

  useEffect(() => {
    const voices = voiceAssistant.getVoices();
    setAvailableVoices(voices);
  }, []);

  const handleTestVoice = () => {
    const persona = PERSONALITIES.find((p) => p.id === personality) || PERSONALITIES[0];
    setIsPlayingPreview(true);
    voiceAssistant.speak(persona.preview, {
      voiceURI,
      pitch: voicePitch,
      rate: voiceRate,
      language: voiceLanguage,
      onEnd: () => setIsPlayingPreview(false)
    });
  };

  const handleSave = async () => {
    await updateAIPreferences({
      personality,
      voiceURI,
      voiceLanguage,
      voicePitch,
      voiceRate,
      autoSpeak
    });
  };

  return (
    <div className="w-full flex flex-col h-full min-h-0 bg-[#111b21] border-r border-slate-800/80 z-10 box-border text-slate-100 select-none animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-slate-800/60 flex-shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <span>AI Voice & Personality</span>
              <Sparkles className="w-4 h-4 text-purple-400" />
            </h2>
            <p className="text-xs text-slate-400">Customize how Aryavarta AI speaks and behaves</p>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="px-4 py-2 bg-[#5c7cd8] hover:bg-[#4a6ac6] text-white text-xs font-bold rounded-xl shadow-lg transition-transform active:scale-95 cursor-pointer"
        >
          Save
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-6">
        {/* ================= 1. PERSONALITY PICKER ================= */}
        <div className="space-y-3">
          <span className="text-xs font-semibold text-slate-400 block tracking-wide px-1">
            Choose Personality
          </span>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {PERSONALITIES.map((p) => {
              const isSelected = personality === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => setPersonality(p.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer relative ${
                    isSelected
                      ? "bg-[#5c7cd8]/20 border-[#5c7cd8] shadow-lg shadow-indigo-500/10"
                      : "bg-[#182229] border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">{p.icon}</span>
                      <div>
                        <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                          <span>{p.name}</span>
                          {isSelected && <Check className="w-4 h-4 text-[#5c7cd8]" />}
                        </h4>
                        <span className="text-[11px] text-[#5c7cd8] font-semibold">{p.tagline}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">{p.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* ================= 2. VOICE SYNTHESIS MODEL ================= */}
        <div className="p-4 bg-[#182229] border border-slate-800 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Volume2 className="w-4 h-4 text-[#5c7cd8]" />
              <span>Voice Synthesis Model</span>
            </span>

            <button
              onClick={handleTestVoice}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-purple-300 rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Play className={`w-3.5 h-3.5 ${isPlayingPreview ? "animate-spin" : ""}`} />
              <span>{isPlayingPreview ? "Speaking..." : "Test Voice"}</span>
            </button>
          </div>

          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Select System / Browser Voice</label>
            <select
              value={voiceURI}
              onChange={(e) => setVoiceURI(e.target.value)}
              className="w-full py-2.5 px-3 bg-[#202c33] border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-[#5c7cd8]"
            >
              <option value="default">Default Intelligent Assistant Voice</option>
              {availableVoices.map((v, i) => (
                <option key={i} value={v.voiceURI || v.name}>
                  {v.name} ({v.lang})
                </option>
              ))}
            </select>
          </div>

          {/* Sliders: Pitch & Speed */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <div className="flex items-center justify-between text-xs text-slate-300 mb-1.5">
                <span>Pitch</span>
                <span className="font-mono text-purple-400">{voicePitch}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="1.5"
                step="0.1"
                value={voicePitch}
                onChange={(e) => setVoicePitch(Number(e.target.value))}
                className="w-full accent-[#5c7cd8] cursor-pointer"
              />
            </div>

            <div>
              <div className="flex items-center justify-between text-xs text-slate-300 mb-1.5">
                <span>Speed</span>
                <span className="font-mono text-purple-400">{voiceRate}x</span>
              </div>
              <input
                type="range"
                min="0.7"
                max="1.4"
                step="0.1"
                value={voiceRate}
                onChange={(e) => setVoiceRate(Number(e.target.value))}
                className="w-full accent-[#5c7cd8] cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* ================= 3. AUTO-SPEAK TOGGLE ================= */}
        <div className="p-4 bg-[#182229] border border-slate-800 rounded-2xl flex items-start justify-between">
          <div className="pr-4">
            <span className="text-sm font-semibold text-slate-100 block">Auto-speak voice responses</span>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              When enabled, Aryavarta AI will automatically speak responses using your selected voice profile.
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer flex-shrink-0 mt-0.5">
            <input
              type="checkbox"
              checked={autoSpeak}
              onChange={(e) => setAutoSpeak(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#5c7cd8]"></div>
          </label>
        </div>
      </div>
    </div>
  );
};

export default AIPersonalitySettings;
