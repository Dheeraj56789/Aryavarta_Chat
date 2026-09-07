import { useState } from "react";
import {
  ArrowLeft,
  HardDrive,
  Wifi,
  Smartphone,
  Download,
  Check,
  RotateCcw,
  Sparkles,
  Shield
} from "lucide-react";
import toast from "react-hot-toast";

const StorageDataSettings = ({ onBack }) => {
  const [mobilePhotos, setMobilePhotos] = useState(true);
  const [mobileAudio, setMobileAudio] = useState(false);
  const [mobileVideo, setMobileVideo] = useState(false);
  const [mobileDocs, setMobileDocs] = useState(false);

  const [wifiPhotos, setWifiPhotos] = useState(true);
  const [wifiAudio, setWifiAudio] = useState(true);
  const [wifiVideo, setWifiVideo] = useState(true);
  const [wifiDocs, setWifiDocs] = useState(true);

  const [uploadQuality, setUploadQuality] = useState("auto"); // "auto" | "best" | "saver"
  const [useLessDataCalls, setUseLessDataCalls] = useState(false);

  const handleClearCache = () => {
    localStorage.removeItem("aryavarta_cached_media");
    toast.success("Local temporary media cache cleared (14.2 MB freed) 🧹");
  };

  const Switch = ({ checked, onChange }) => (
    <label className="relative inline-flex items-center cursor-pointer flex-shrink-0 select-none">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only peer"
      />
      <div className="w-11 h-6 bg-[#374151] peer-focus:outline-none rounded-full peer peer-checked:bg-[#6366f1] transition-colors duration-200">
        <div
          className={`absolute top-[2px] left-[2px] bg-white rounded-full h-5 w-5 transition-transform duration-200 shadow-md ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </div>
    </label>
  );

  return (
    <div className="w-full flex flex-col h-full min-h-0 bg-[#0c1317] border-r border-slate-800/80 z-10 box-border text-slate-100 select-none">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-slate-800/60 flex-shrink-0 bg-[#111b21]">
        <button
          onClick={onBack}
          className="p-1.5 rounded-full hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-bold text-slate-100">Storage and data</h2>
      </div>

      {/* Body */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
        {/* Storage overview */}
        <div className="bg-[#1a222d] border border-slate-800/80 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <HardDrive className="w-5 h-5 text-indigo-400" />
              <h3 className="text-sm font-semibold text-white">Storage Usage</h3>
            </div>
            <span className="text-xs font-bold text-emerald-400">Available</span>
          </div>

          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden flex">
            <div className="bg-indigo-500 h-full w-[25%]" title="Media" />
            <div className="bg-emerald-500 h-full w-[15%]" title="Documents" />
            <div className="bg-purple-500 h-full w-[10%]" title="Messages" />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>24.8 MB used by Aryavarta</span>
            <button
              onClick={handleClearCache}
              className="text-indigo-400 hover:text-indigo-300 font-semibold"
            >
              Clear Cache
            </button>
          </div>
        </div>

        {/* Media Auto-Download Group */}
        <div className="bg-[#1a222d] border border-slate-800/80 rounded-2xl overflow-hidden divide-y divide-slate-800/60">
          <div className="p-4">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Media auto-download
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Voice messages are always automatically downloaded
            </p>
          </div>

          {/* When using mobile data */}
          <div className="p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-200">
              <Smartphone className="w-4 h-4 text-indigo-400" />
              <span>When using mobile data</span>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1">
              {[
                { label: "Photos", val: mobilePhotos, set: setMobilePhotos },
                { label: "Audio", val: mobileAudio, set: setMobileAudio },
                { label: "Videos", val: mobileVideo, set: setMobileVideo },
                { label: "Documents", val: mobileDocs, set: setMobileDocs }
              ].map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => item.set(!item.val)}
                  className={`px-3 py-2 rounded-xl text-xs font-medium border flex items-center justify-between transition-all ${
                    item.val
                      ? "bg-indigo-600/20 border-indigo-500 text-indigo-300"
                      : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <span>{item.label}</span>
                  {item.val && <Check className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
          </div>

          {/* When connected on Wi-Fi */}
          <div className="p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-200">
              <Wifi className="w-4 h-4 text-emerald-400" />
              <span>When connected on Wi-Fi</span>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1">
              {[
                { label: "Photos", val: wifiPhotos, set: setWifiPhotos },
                { label: "Audio", val: wifiAudio, set: setWifiAudio },
                { label: "Videos", val: wifiVideo, set: setWifiVideo },
                { label: "Documents", val: wifiDocs, set: setWifiDocs }
              ].map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => item.set(!item.val)}
                  className={`px-3 py-2 rounded-xl text-xs font-medium border flex items-center justify-between transition-all ${
                    item.val
                      ? "bg-emerald-600/20 border-emerald-500 text-emerald-300"
                      : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <span>{item.label}</span>
                  {item.val && <Check className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Media Upload Quality */}
        <div className="bg-[#1a222d] border border-slate-800/80 rounded-2xl p-4 space-y-3">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Media upload quality
          </h4>
          <div className="space-y-1 divide-y divide-slate-800/60">
            {[
              { id: "auto", label: "Auto (recommended)", desc: "Optimal balance of speed and image clarity" },
              { id: "best", label: "Best quality (HD)", desc: "Uploads uncompressed photos and high-res video" },
              { id: "saver", label: "Data saver", desc: "Compresses media to minimize bandwidth" }
            ].map((opt) => (
              <div
                key={opt.id}
                onClick={() => setUploadQuality(opt.id)}
                className="flex items-center justify-between py-2.5 cursor-pointer hover:bg-slate-800/30 rounded-lg px-2"
              >
                <div>
                  <span className="text-xs font-medium text-white block">{opt.label}</span>
                  <span className="text-[11px] text-slate-400 block">{opt.desc}</span>
                </div>
                <div
                  className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    uploadQuality === opt.id ? "border-[#6366f1] bg-[#6366f1]" : "border-slate-500"
                  }`}
                >
                  {uploadQuality === opt.id && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Use less data for calls */}
        <div className="bg-[#1a222d] border border-slate-800/80 rounded-2xl p-4 flex items-center justify-between">
          <div className="pr-2">
            <h4 className="text-sm font-semibold text-white">Use less data for calls</h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Reduces audio & video bandwidth on cellular data
            </p>
          </div>
          <Switch checked={useLessDataCalls} onChange={setUseLessDataCalls} />
        </div>
      </div>
    </div>
  );
};

export default StorageDataSettings;
