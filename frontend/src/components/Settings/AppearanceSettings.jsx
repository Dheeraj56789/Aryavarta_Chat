import { useState } from "react";
import { ArrowLeft, Palette, Check, Sun, Moon, Monitor, Sparkles } from "lucide-react";
import { useChatContext } from "../../context/ChatContext";
import toast from "react-hot-toast";

const THEMES = [
  { id: "System default", label: "System default", icon: Monitor, desc: "Matches operating system theme" },
  { id: "Dark", label: "Dark theme", icon: Moon, desc: "Sleek low-light experience" },
  { id: "Light", label: "Light theme", icon: Sun, desc: "Bright and crisp" },
  { id: "Amoled", label: "Midnight AMOLED", icon: Moon, desc: "Deep true black for OLED screens" }
];

const ACCENT_COLORS = [
  { id: "emerald", label: "WhatsApp Emerald", bg: "bg-[#00a884]" },
  { id: "indigo", label: "Telegram Indigo", bg: "bg-[#6366f1]" },
  { id: "sapphire", label: "Sapphire Blue", bg: "bg-[#3b82f6]" },
  { id: "rose", label: "Crimson Rose", bg: "bg-[#f43f5e]" },
  { id: "amber", label: "Warm Amber", bg: "bg-[#f59e0b]" }
];

const APP_ICONS = [
  { id: "classic", name: "Classic Emerald", color: "bg-emerald-500 text-slate-950" },
  { id: "dark", name: "Dark Stealth", color: "bg-slate-900 text-white border border-slate-700" },
  { id: "gold", name: "Royal Gold", color: "bg-amber-400 text-slate-950" },
  { id: "cyber", name: "Neon Cyberpunk", color: "bg-purple-600 text-white" }
];

const AppearanceSettings = ({ onBack }) => {
  const { theme, setTheme } = useChatContext();
  const [selectedAccent, setSelectedAccent] = useState(() => {
    return localStorage.getItem("aryavarta_accent_color") || "emerald";
  });
  const [selectedIcon, setSelectedIcon] = useState(() => {
    return localStorage.getItem("aryavarta_app_icon") || "classic";
  });

  const handleSelectTheme = (t) => {
    if (setTheme) setTheme(t);
    toast.success(`Theme set to ${t} 🎨`);
  };

  const handleSelectAccent = (colorId) => {
    setSelectedAccent(colorId);
    localStorage.setItem("aryavarta_accent_color", colorId);
    toast.success("Accent color applied! ✨");
  };

  const handleSelectIcon = (iconId) => {
    setSelectedIcon(iconId);
    localStorage.setItem("aryavarta_app_icon", iconId);
    toast.success("App icon preference saved!");
  };

  return (
    <div className="w-full flex flex-col h-full min-h-0 bg-[#0c1317] border-r border-slate-800/80 z-10 box-border text-slate-100 select-none">
      <div className="flex items-center gap-3 px-4 py-4 border-b border-slate-800/60 flex-shrink-0 bg-[#111b21]">
        <button
          onClick={onBack}
          className="p-1.5 rounded-full hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-bold text-slate-100">Appearance</h2>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
        {/* App Theme */}
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2 px-1">
            App theme
          </span>
          <div className="bg-[#1a222d] border border-slate-800/80 rounded-2xl overflow-hidden divide-y divide-slate-800/60">
            {THEMES.map((item) => {
              const isSelected = theme === item.id;
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  onClick={() => handleSelectTheme(item.id)}
                  className="flex items-center justify-between p-4 hover:bg-slate-800/40 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-slate-800 text-slate-300">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-white block">
                        {item.label}
                      </span>
                      <span className="text-xs text-slate-400 block mt-0.5">
                        {item.desc}
                      </span>
                    </div>
                  </div>

                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      isSelected ? "border-[#6366f1] bg-[#6366f1]" : "border-slate-500"
                    }`}
                  >
                    {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Accent Color */}
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2 px-1">
            Chat Accent Color
          </span>
          <div className="bg-[#1a222d] border border-slate-800/80 rounded-2xl p-4 flex items-center gap-3">
            {ACCENT_COLORS.map((c) => (
              <button
                key={c.id}
                onClick={() => handleSelectAccent(c.id)}
                className={`w-9 h-9 rounded-full ${c.bg} flex items-center justify-center transition-all ${
                  selectedAccent === c.id
                    ? "ring-2 ring-white ring-offset-2 ring-offset-[#1a222d] scale-110 shadow-lg"
                    : "opacity-75 hover:opacity-100"
                }`}
                title={c.label}
              >
                {selectedAccent === c.id && <Check className="w-4 h-4 text-white stroke-[3]" />}
              </button>
            ))}
          </div>
        </div>

        {/* App Icon */}
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2 px-1">
            App Icon Style
          </span>
          <div className="grid grid-cols-2 gap-2">
            {APP_ICONS.map((icon) => (
              <div
                key={icon.id}
                onClick={() => handleSelectIcon(icon.id)}
                className={`p-3 rounded-2xl border cursor-pointer flex items-center gap-3 transition-all ${
                  selectedIcon === icon.id
                    ? "bg-slate-800/80 border-[#6366f1] text-white"
                    : "bg-[#1a222d] border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                <div className={`w-8 h-8 rounded-xl ${icon.color} flex items-center justify-center text-xs font-bold shadow`}>
                  A
                </div>
                <span className="text-xs font-medium truncate">{icon.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppearanceSettings;
