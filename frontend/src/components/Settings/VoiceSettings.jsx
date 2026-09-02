import { useState } from "react";
import { ArrowLeft, Mic, Volume2, Video } from "lucide-react";
import toast from "react-hot-toast";

const VoiceSettings = ({ onBack }) => {
  return (
    <div className="w-full flex flex-col h-full min-h-0 bg-[#111b21] border-r border-slate-800/80 z-10 box-border text-slate-100 select-none">
      <div className="flex items-center gap-4 px-4 py-4 border-b border-slate-800/60 flex-shrink-0">
        <button
          onClick={onBack}
          className="p-1.5 rounded-full hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-bold text-slate-100">Video & voice</h2>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-6">
        <div className="space-y-4">
          <span className="text-xs font-semibold text-slate-400 block tracking-wide">
            Audio devices
          </span>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Microphone</label>
            <select className="w-full py-2 px-3 bg-[#202c33] border border-slate-700/80 rounded-xl text-xs text-slate-200">
              <option>Default - Internal Microphone (Realtek)</option>
              <option>Headset Microphone</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Speakers</label>
            <select className="w-full py-2 px-3 bg-[#202c33] border border-slate-700/80 rounded-xl text-xs text-slate-200">
              <option>Default - Speakers (Realtek Audio)</option>
              <option>Headphones</option>
            </select>
          </div>

          <button
            type="button"
            onClick={() => toast.success("Speakers test: Playing sound chime 🔔")}
            className="w-full py-2 bg-[#202c33] hover:bg-[#2a3942] text-xs font-semibold rounded-xl text-emerald-400 border border-slate-700 transition-colors"
          >
            Test Audio Speakers
          </button>
        </div>
      </div>
    </div>
  );
};

export default VoiceSettings;
