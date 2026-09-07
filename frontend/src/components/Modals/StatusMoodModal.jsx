import { useState } from "react";
import { X, Check, Sparkles, Smile, MessageSquareQuote } from "lucide-react";
import { useAuthContext } from "../../context/AuthContext";
import toast from "react-hot-toast";

const PRESET_MOODS = [
  "Right now I'm coding 💻",
  "Right now I'm in a meeting 🎧",
  "Right now I'm at the gym 🏋️",
  "Right now I'm traveling ✈️",
  "Right now I'm having coffee ☕",
  "Right now I'm sleeping 😴",
  "Available to chat ✨",
  "Urgent calls only ⚠️",
  "Busy • Do not disturb 🔕"
];

const StatusMoodModal = ({ onClose, currentStatus, onSave }) => {
  const [status, setStatus] = useState(currentStatus || "Right now I'm...");

  const handleSelectPreset = (val) => {
    setStatus(val);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!status.trim()) {
      toast.error("Status cannot be empty");
      return;
    }
    onSave(status.trim());
    toast.success("Status updated! ✨");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#111b21] border border-slate-800 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl flex flex-col text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800/80 bg-[#16202a]">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <MessageSquareQuote className="w-5 h-5 text-indigo-400" />
            Your Status Bubble
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSave} className="p-5 space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              Current Thought / Status
            </label>
            <div className="relative">
              <input
                type="text"
                value={status}
                maxLength={60}
                onChange={(e) => setStatus(e.target.value)}
                placeholder="What are you up to?"
                className="w-full px-4 py-3 bg-[#1e2633] border border-slate-700/80 rounded-2xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">
                {status.length}/60
              </span>
            </div>
          </div>

          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              Quick Suggestions
            </span>
            <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto pr-1">
              {PRESET_MOODS.map((m, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectPreset(m)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                    status === m
                      ? "bg-indigo-600/30 border-indigo-500 text-indigo-300 font-medium"
                      : "bg-[#16202a] border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-[#6366f1] hover:bg-[#5254cf] text-white text-xs font-semibold transition-colors shadow-md"
            >
              Save Status
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StatusMoodModal;
