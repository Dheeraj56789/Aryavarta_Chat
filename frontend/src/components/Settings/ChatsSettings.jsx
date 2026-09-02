import { useState, useRef } from "react";
import { ArrowLeft, ChevronRight, Check, Image as ImageIcon, Sparkles, Upload, RefreshCw } from "lucide-react";
import { useChatContext } from "../../context/ChatContext";
import toast from "react-hot-toast";

const WALLPAPER_COLORS = [
  { id: "default", bg: "bg-[#0b141a]", label: "Dark Slate" },
  { id: "emerald", bg: "bg-[#062419]", label: "Emerald" },
  { id: "midnight", bg: "bg-[#0f172a]", label: "Midnight" },
  { id: "purple", bg: "bg-[#1e102d]", label: "Amethyst" },
  { id: "navy", bg: "bg-[#0a192f]", label: "Deep Navy" },
  { id: "warm", bg: "bg-[#1c1917]", label: "Warm Charcoal" },
  { id: "burgundy", bg: "bg-[#280914]", label: "Burgundy" }
];

const ChatsSettings = ({ onBack }) => {
  const {
    theme,
    setTheme,
    wallpaperColor,
    setWallpaperColor,
    wallpaperDoodle,
    setWallpaperDoodle,
    customWallpaperUrl,
    setCustomWallpaperUrl,
    mediaQuality,
    setMediaQuality,
    spellCheck,
    setSpellCheck,
    replaceEmoji,
    setReplaceEmoji,
    enterIsSend,
    setEnterIsSend
  } = useChatContext();

  const [subView, setSubView] = useState(null); // null | "theme" | "wallpaper" | "media_quality" | "media_download"
  const wallpaperInputRef = useRef(null);

  // Auto-download states
  const [downloadPhotos, setDownloadPhotos] = useState(true);
  const [downloadAudio, setDownloadAudio] = useState(true);
  const [downloadVideos, setDownloadVideos] = useState(false);
  const [downloadDocs, setDownloadDocs] = useState(true);

  const handleCustomWallpaperUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setCustomWallpaperUrl(reader.result);
        toast.success("Custom chat wallpaper applied! 🖼️");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResetWallpaper = () => {
    setCustomWallpaperUrl("");
    setWallpaperColor("default");
    setWallpaperDoodle(true);
    toast.success("Wallpaper reset to default WhatsApp theme 🎨");
  };

  // ================= 1. SUB-VIEW: THEME =================
  if (subView === "theme") {
    return (
      <div className="w-full flex flex-col h-full min-h-0 bg-[#111b21] border-r border-slate-800/80 z-10 box-border text-slate-100 select-none animate-fade-in">
        <div className="flex items-center gap-4 px-4 py-4 border-b border-slate-800/60 flex-shrink-0">
          <button onClick={() => setSubView(null)} className="p-1.5 rounded-full hover:bg-slate-800 text-slate-300 hover:text-white cursor-pointer">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-bold text-slate-100">Theme</h2>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3">
          {["System default", "Dark", "Light"].map((t) => (
            <div
              key={t}
              onClick={() => {
                setTheme(t);
                toast.success(`Theme set to ${t} 🎨`);
              }}
              className="flex items-center justify-between p-3.5 rounded-2xl hover:bg-[#202c33] cursor-pointer transition-colors"
            >
              <span className="text-sm font-medium text-slate-200">{t}</span>
              {theme === t && <Check className="w-4 h-4 text-emerald-400" />}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ================= 2. SUB-VIEW: WALLPAPER =================
  if (subView === "wallpaper") {
    return (
      <div className="w-full flex flex-col h-full min-h-0 bg-[#111b21] border-r border-slate-800/80 z-10 box-border text-slate-100 select-none animate-fade-in">
        <div className="flex items-center gap-4 px-4 py-4 border-b border-slate-800/60 flex-shrink-0">
          <button onClick={() => setSubView(null)} className="p-1.5 rounded-full hover:bg-slate-800 text-slate-300 hover:text-white cursor-pointer">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-bold text-slate-100">Set chat wallpaper</h2>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-5">
          {/* Add WhatsApp Doodles Toggle */}
          <div className="flex items-start justify-between p-3 bg-[#202c33] rounded-2xl border border-slate-750">
            <div>
              <span className="text-sm font-medium text-slate-200 block">Add WhatsApp doodles</span>
              <p className="text-xs text-slate-400 mt-0.5">Show doodle icons on wallpaper background</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer flex-shrink-0 mt-0.5">
              <input
                type="checkbox"
                checked={wallpaperDoodle}
                onChange={(e) => {
                  setWallpaperDoodle(e.target.checked);
                  toast(e.target.checked ? "Doodles enabled ✏️" : "Doodles hidden");
                }}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00a884]"></div>
            </label>
          </div>

          {/* Solid Colors Palette */}
          <div>
            <span className="text-xs font-semibold text-slate-400 block pb-2.5">Solid Colors</span>
            <div className="grid grid-cols-4 gap-3">
              {WALLPAPER_COLORS.map((c) => (
                <div
                  key={c.id}
                  onClick={() => {
                    setCustomWallpaperUrl("");
                    setWallpaperColor(c.id);
                    toast.success(`Wallpaper set to ${c.label}`);
                  }}
                  className={`aspect-square rounded-2xl ${c.bg} border-2 flex flex-col items-center justify-center cursor-pointer transition-transform hover:scale-105 ${
                    !customWallpaperUrl && wallpaperColor === c.id
                      ? "border-emerald-400 scale-105 shadow-lg shadow-emerald-500/20"
                      : "border-slate-700"
                  }`}
                  title={c.label}
                >
                  {!customWallpaperUrl && wallpaperColor === c.id && (
                    <Check className="w-5 h-5 text-emerald-400" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Custom Image Wallpaper Upload */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <span className="text-xs font-semibold text-slate-400 block">Custom Image Wallpaper</span>
            <div className="flex gap-2">
              <button
                onClick={() => wallpaperInputRef.current?.click()}
                className="flex-1 py-2.5 px-3 bg-[#202c33] hover:bg-[#2a3942] border border-slate-700 rounded-xl text-xs font-semibold text-emerald-400 flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                <span>Upload Custom Image</span>
              </button>

              <button
                onClick={handleResetWallpaper}
                className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs text-slate-300 hover:text-white transition-colors cursor-pointer"
                title="Reset to default"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            <input
              ref={wallpaperInputRef}
              type="file"
              accept="image/*"
              onChange={handleCustomWallpaperUpload}
              className="hidden"
            />
          </div>
        </div>
      </div>
    );
  }

  // ================= 3. SUB-VIEW: MEDIA UPLOAD QUALITY =================
  if (subView === "media_quality") {
    return (
      <div className="w-full flex flex-col h-full min-h-0 bg-[#111b21] border-r border-slate-800/80 z-10 box-border text-slate-100 select-none animate-fade-in">
        <div className="flex items-center gap-4 px-4 py-4 border-b border-slate-800/60 flex-shrink-0">
          <button onClick={() => setSubView(null)} className="p-1.5 rounded-full hover:bg-slate-800 text-slate-300 hover:text-white cursor-pointer">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-bold text-slate-100">Media upload quality</h2>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3">
          <p className="text-xs text-slate-400 px-1 leading-relaxed">
            HD media is clearer, but can use more data and take longer to send.
          </p>

          {["Standard quality", "HD quality"].map((q) => (
            <div
              key={q}
              onClick={() => {
                setMediaQuality(q);
                toast.success(`Upload quality set to ${q}`);
              }}
              className="flex items-center justify-between p-3.5 rounded-2xl hover:bg-[#202c33] cursor-pointer transition-colors"
            >
              <div>
                <span className="text-sm font-medium text-slate-200 block">{q}</span>
                <span className="text-xs text-slate-400">
                  {q === "HD quality" ? "Sends photos and videos with crisp resolution" : "Faster sending with compressed file size"}
                </span>
              </div>
              {mediaQuality === q && <Check className="w-4 h-4 text-emerald-400" />}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ================= 4. SUB-VIEW: MEDIA AUTO-DOWNLOAD =================
  if (subView === "media_download") {
    return (
      <div className="w-full flex flex-col h-full min-h-0 bg-[#111b21] border-r border-slate-800/80 z-10 box-border text-slate-100 select-none animate-fade-in">
        <div className="flex items-center gap-4 px-4 py-4 border-b border-slate-800/60 flex-shrink-0">
          <button onClick={() => setSubView(null)} className="p-1.5 rounded-full hover:bg-slate-800 text-slate-300 hover:text-white cursor-pointer">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-bold text-slate-100">Media auto-download</h2>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
          <span className="text-xs font-semibold text-slate-400 block">When connected to network</span>

          {[
            { label: "Photos", state: downloadPhotos, set: setDownloadPhotos },
            { label: "Audio", state: downloadAudio, set: setDownloadAudio },
            { label: "Videos", state: downloadVideos, set: setDownloadVideos },
            { label: "Documents", state: downloadDocs, set: setDownloadDocs }
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between p-3 rounded-2xl hover:bg-[#202c33]">
              <span className="text-sm text-slate-200">{item.label}</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={item.state}
                  onChange={(e) => item.set(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00a884]"></div>
              </label>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ================= MAIN CHATS SETTINGS (Matching Screenshot 1:1) =================
  return (
    <div className="w-full flex flex-col h-full min-h-0 bg-[#111b21] border-r border-slate-800/80 z-10 box-border text-slate-100 select-none">
      {/* 1. Header: ← Chats */}
      <div className="flex items-center gap-4 px-4 py-4 border-b border-slate-800/60 flex-shrink-0">
        <button
          onClick={onBack}
          className="p-1.5 rounded-full hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
          title="Back to Settings"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-bold text-slate-100">Chats</h2>
      </div>

      {/* 2. Scrollable Content matching screenshot */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-6">
        {/* ================= SECTION 1: Display ================= */}
        <div className="space-y-1">
          <span className="text-xs font-semibold text-slate-400 block tracking-wide px-2 pb-1">
            Display
          </span>

          {/* Theme */}
          <div
            onClick={() => setSubView("theme")}
            className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-[#202c33] cursor-pointer transition-colors"
          >
            <div>
              <span className="text-sm font-medium text-slate-200 block">Theme</span>
              <span className="text-xs text-slate-400">{theme}</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </div>

          {/* Wallpaper */}
          <div
            onClick={() => setSubView("wallpaper")}
            className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-[#202c33] cursor-pointer transition-colors"
          >
            <div>
              <span className="text-sm font-medium text-slate-200 block">Wallpaper</span>
              <span className="text-xs text-slate-400">
                {customWallpaperUrl ? "Custom image" : `${wallpaperColor} ${wallpaperDoodle ? "(Doodles)" : ""}`}
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </div>
        </div>

        {/* ================= SECTION 2: Chat settings ================= */}
        <div className="space-y-3 pt-2 border-t border-slate-800">
          <span className="text-xs font-semibold text-slate-400 block tracking-wide px-2 pb-1">
            Chat settings
          </span>

          {/* Media upload quality */}
          <div
            onClick={() => setSubView("media_quality")}
            className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-[#202c33] cursor-pointer transition-colors"
          >
            <span className="text-sm font-medium text-slate-200">Media upload quality</span>
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </div>

          {/* Media auto-download */}
          <div
            onClick={() => setSubView("media_download")}
            className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-[#202c33] cursor-pointer transition-colors"
          >
            <span className="text-sm font-medium text-slate-200">Media auto-download</span>
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </div>

          {/* Spell check */}
          <div className="flex items-start justify-between p-2.5 pt-1">
            <div className="pr-4">
              <span className="text-sm font-medium text-slate-200 block">Spell check</span>
              <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                Check spelling while typing
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer flex-shrink-0 mt-0.5">
              <input
                type="checkbox"
                checked={spellCheck}
                onChange={(e) => {
                  setSpellCheck(e.target.checked);
                  toast(e.target.checked ? "Spell check enabled" : "Spell check disabled");
                }}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00a884]"></div>
            </label>
          </div>

          {/* Replace text with emoji */}
          <div className="flex items-start justify-between p-2.5 pt-1">
            <div className="pr-4">
              <span className="text-sm font-medium text-slate-200 block">Replace text with emoji</span>
              <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                Emoji will replace specific text as you type
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer flex-shrink-0 mt-0.5">
              <input
                type="checkbox"
                checked={replaceEmoji}
                onChange={(e) => {
                  setReplaceEmoji(e.target.checked);
                  toast(e.target.checked ? "Auto emoji replacement enabled" : "Disabled");
                }}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00a884]"></div>
            </label>
          </div>

          {/* Enter is send */}
          <div className="flex items-start justify-between p-2.5 pt-1">
            <div className="pr-4">
              <span className="text-sm font-medium text-slate-200 block">Enter is send</span>
              <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                Enter key will send your message
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer flex-shrink-0 mt-0.5">
              <input
                type="checkbox"
                checked={enterIsSend}
                onChange={(e) => {
                  setEnterIsSend(e.target.checked);
                  toast(e.target.checked ? "Enter is send enabled" : "Enter is send disabled");
                }}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00a884]"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatsSettings;
