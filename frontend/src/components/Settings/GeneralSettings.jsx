import { useState, useEffect } from "react";
import { ArrowLeft, Globe, ChevronDown } from "lucide-react";
import toast from "react-hot-toast";

const LANGUAGES = [
  { code: "en-gb", name: "British English", flag: "🇬🇧" },
  { code: "en-us", name: "English (United States)", flag: "🇺🇸" },
  { code: "hi", name: "Hindi (हिन्दी)", flag: "🇮🇳" },
  { code: "sa", name: "Sanskrit (संस्कृतम्)", flag: "🇮🇳" },
  { code: "bn", name: "Bengali (বাংলা)", flag: "🇮🇳" },
  { code: "te", name: "Telugu (తెలుగు)", flag: "🇮🇳" },
  { code: "mr", name: "Marathi (मराठी)", flag: "🇮🇳" },
  { code: "ta", name: "Tamil (தமிழ்)", flag: "🇮🇳" },
  { code: "gu", name: "Gujarati (ગુજરાતી)", flag: "🇮🇳" },
  { code: "kn", name: "Kannada (ಕನ್ನಡ)", flag: "🇮🇳" },
  { code: "ml", name: "Malayalam (മലയാളം)", flag: "🇮🇳" },
  { code: "pa", name: "Punjabi (ਪੰਜਾਬੀ)", flag: "🇮🇳" },
  { code: "or", name: "Odia (ଓଡ଼ିଆ)", flag: "🇮🇳" },
  { code: "es", name: "Spanish (Español)", flag: "🇪🇸" },
  { code: "fr", name: "French (Français)", flag: "🇫🇷" },
  { code: "de", name: "German (Deutsch)", flag: "🇩🇪" },
  { code: "ar", name: "Arabic (العربية)", flag: "🇸🇦" },
  { code: "ru", name: "Russian (Русский)", flag: "🇷🇺" },
  { code: "ja", name: "Japanese (日本語)", flag: "🇯🇵" },
  { code: "zh", name: "Chinese (中文)", flag: "🇨🇳" },
  { code: "pt", name: "Portuguese (Português)", flag: "🇧🇷" },
  { code: "it", name: "Italian (Italiano)", flag: "🇮🇹" }
];

const FONT_SIZES = [
  { value: "85%", label: "85% (Small)" },
  { value: "90%", label: "90%" },
  { value: "100%", label: "100% (default)" },
  { value: "110%", label: "110%" },
  { value: "125%", label: "125% (Large)" },
  { value: "140%", label: "140% (Extra Large)" }
];

const GeneralSettings = ({ onBack }) => {
  const [startAtLogin, setStartAtLogin] = useState(true);
  const [minimiseToTray, setMinimiseToTray] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState("British English");
  const [selectedFontSize, setSelectedFontSize] = useState("100%");

  // Handle font size scaling
  const handleFontSizeChange = (size) => {
    setSelectedFontSize(size);
    document.documentElement.style.fontSize = size === "100%" ? "16px" : `calc(16px * ${parseFloat(size) / 100})`;
    toast.success(`Font size updated to ${size}`);
  };

  // Listen to keyboard shortcuts Ctrl + and Ctrl -
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && (e.key === "+" || e.key === "=")) {
        e.preventDefault();
        handleFontSizeChange("110%");
      } else if (e.ctrlKey && (e.key === "-" || e.key === "_")) {
        e.preventDefault();
        handleFontSizeChange("90%");
      } else if (e.ctrlKey && e.key === "0") {
        e.preventDefault();
        handleFontSizeChange("100%");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="w-full flex flex-col h-full min-h-0 bg-[#111b21] border-r border-slate-800/80 z-10 box-border text-slate-100">
      {/* 1. Header matching screenshot: ← General */}
      <div className="flex items-center gap-4 px-4 py-4 border-b border-slate-800/60 flex-shrink-0">
        <button
          onClick={onBack}
          className="p-1.5 rounded-full hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
          title="Back to Settings"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-bold text-slate-100">General</h2>
      </div>

      {/* 2. Scrollable Body matching screenshot */}
      <div className="flex-1 min-h-0 overflow-y-auto p-5 space-y-7 select-none">
        {/* Startup and close section */}
        <div className="space-y-4">
          <span className="text-xs font-semibold text-slate-400 block tracking-wide">
            Startup and close
          </span>

          {/* Start WhatsApp at login */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-200">
              Start Aryavarta at login
            </span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={startAtLogin}
                onChange={(e) => setStartAtLogin(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00a884]"></div>
            </label>
          </div>

          {/* Minimise to system tray */}
          <div className="flex items-start justify-between pt-1">
            <div className="pr-4">
              <span className="text-sm font-medium text-slate-200 block">
                Minimise to system tray
              </span>
              <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                Keep Aryavarta running after closing the application window
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer flex-shrink-0 mt-1">
              <input
                type="checkbox"
                checked={minimiseToTray}
                onChange={(e) => setMinimiseToTray(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00a884]"></div>
            </label>
          </div>
        </div>

        {/* Language Section matching screenshot */}
        <div className="space-y-2 pt-2">
          <span className="text-xs font-semibold text-slate-400 block tracking-wide">
            Language
          </span>

          <div className="relative">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              <Globe className="w-4 h-4" />
            </div>

            <select
              value={selectedLanguage}
              onChange={(e) => {
                setSelectedLanguage(e.target.value);
                toast.success(`Language set to ${e.target.value} 🌐`);
              }}
              className="w-full pl-10 pr-10 py-3 bg-[#202c33] hover:bg-[#2a3942] border border-slate-700/60 rounded-xl text-sm font-medium text-slate-100 appearance-none focus:outline-none focus:border-emerald-500 cursor-pointer transition-colors"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.name} className="bg-[#111b21] py-1 text-slate-100">
                  {lang.flag} {lang.name}
                </option>
              ))}
            </select>

            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Font size Section matching screenshot */}
        <div className="space-y-2 pt-2">
          <span className="text-xs font-semibold text-slate-400 block tracking-wide">
            Font size
          </span>

          <div className="relative">
            <select
              value={selectedFontSize}
              onChange={(e) => handleFontSizeChange(e.target.value)}
              className="w-full px-4 py-3 bg-[#202c33] hover:bg-[#2a3942] border border-slate-700/60 rounded-xl text-sm font-medium text-slate-100 appearance-none focus:outline-none focus:border-emerald-500 cursor-pointer transition-colors"
            >
              {FONT_SIZES.map((f) => (
                <option key={f.value} value={f.value} className="bg-[#111b21] py-1 text-slate-100">
                  {f.label}
                </option>
              ))}
            </select>

            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>

          <p className="text-xs text-slate-400 pt-1">
            Use <span className="font-semibold text-slate-300">Ctrl + / -</span> to increase or decrease text size
          </p>
        </div>
      </div>
    </div>
  );
};

export default GeneralSettings;
