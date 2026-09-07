import { useState } from "react";
import { ArrowLeft, Globe, Check } from "lucide-react";
import toast from "react-hot-toast";

const LANGUAGES = [
  { code: "en", name: "English", localName: "English (device's language)", desc: "Default" },
  { code: "hi", name: "Hindi", localName: "हिन्दी", desc: "India" },
  { code: "bn", name: "Bengali", localName: "বাংলা", desc: "India / Bangladesh" },
  { code: "ta", name: "Tamil", localName: "தமிழ்", desc: "India / Sri Lanka" },
  { code: "te", name: "Telugu", localName: "తెలుగు", desc: "India" },
  { code: "mr", name: "Marathi", localName: "मराठी", desc: "India" },
  { code: "es", name: "Spanish", localName: "Español", desc: "International" },
  { code: "fr", name: "French", localName: "Français", desc: "International" },
  { code: "de", name: "German", localName: "Deutsch", desc: "Germany" },
  { code: "ar", name: "Arabic", localName: "العربية", desc: "Middle East" }
];

const LanguageSettings = ({ onBack }) => {
  const [selectedLang, setSelectedLang] = useState(() => {
    return localStorage.getItem("aryavarta_app_language") || "en";
  });

  const handleSelect = (code, name) => {
    setSelectedLang(code);
    localStorage.setItem("aryavarta_app_language", code);
    toast.success(`Language set to ${name} 🌐`);
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
        <h2 className="text-lg font-bold text-slate-100">App language</h2>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3">
        <div className="bg-[#1a222d] border border-slate-800/80 rounded-2xl overflow-hidden divide-y divide-slate-800/60">
          {LANGUAGES.map((lang) => {
            const isSelected = selectedLang === lang.code;
            return (
              <div
                key={lang.code}
                onClick={() => handleSelect(lang.code, lang.name)}
                className="flex items-center justify-between p-4 hover:bg-slate-800/40 cursor-pointer transition-colors"
              >
                <div>
                  <span className="text-sm font-semibold text-white block">
                    {lang.localName}
                  </span>
                  <span className="text-xs text-slate-400 block mt-0.5">
                    {lang.name} • {lang.desc}
                  </span>
                </div>

                <div
                  className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 ${
                    isSelected
                      ? "border-[#6366f1] bg-[#6366f1]"
                      : "border-slate-500"
                  }`}
                >
                  {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LanguageSettings;
