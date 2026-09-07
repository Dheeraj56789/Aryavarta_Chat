import { useState } from "react";
import {
  X,
  Diamond,
  Check,
  Zap,
  Sparkles,
  ShieldCheck,
  Crown,
  HardDrive,
  Video,
  Palette
} from "lucide-react";
import toast from "react-hot-toast";

const PREMIUM_BENEFITS = [
  {
    icon: HardDrive,
    title: "4 GB File Uploads",
    desc: "Send high resolution uncompressed videos and large documents without limits."
  },
  {
    icon: Sparkles,
    title: "Unlimited Aryavarta AI",
    desc: "Chat with Arya & Chanakya personalities with zero daily query restrictions."
  },
  {
    icon: Crown,
    title: "Verified Identity Badge",
    desc: "Official verification mark displayed on your profile and group messages."
  },
  {
    icon: Palette,
    title: "Custom Themes & Wallpapers",
    desc: "Unlock dynamic gradients, custom bubble styling, and signature caller tunes."
  },
  {
    icon: Video,
    title: "HD Video Meetings",
    desc: "Crystal clear group calls with unlimited participants and screen sharing."
  }
];

const SubscriptionsModal = ({ onClose }) => {
  const [isActive, setIsActive] = useState(() => {
    return localStorage.getItem("aryavarta_pro_status") === "active";
  });

  const handleToggle = () => {
    const next = !isActive;
    setIsActive(next);
    localStorage.setItem("aryavarta_pro_status", next ? "active" : "inactive");
    toast.success(next ? "Aryavarta Pro Features Activated! 💎✨" : "Pro mode disabled");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn select-none">
      <div className="bg-[#111b21] border border-slate-800 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl flex flex-col text-slate-100 max-h-[85vh]">
        {/* Banner */}
        <div className="p-6 bg-gradient-to-br from-indigo-950 via-[#182035] to-[#111b21] border-b border-indigo-500/20 text-center relative">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-1.5 rounded-full hover:bg-slate-800/80 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-12 h-12 mx-auto mb-2.5 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Diamond className="w-6 h-6 text-white fill-white/20" />
          </div>

          <h3 className="text-lg font-bold text-white">Aryavarta Subscriptions</h3>
          <p className="text-xs text-indigo-300 mt-0.5">Explore premium communication perks</p>
        </div>

        {/* Benefits */}
        <div className="p-4 flex-1 min-h-0 overflow-y-auto space-y-3 divide-y divide-slate-800/60">
          {PREMIUM_BENEFITS.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className={`flex items-start gap-3 ${idx > 0 ? "pt-3" : ""}`}>
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex-shrink-0 mt-0.5">
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white">{item.title}</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action */}
        <div className="p-4 border-t border-slate-800/80 bg-[#16202a]">
          <button
            onClick={handleToggle}
            className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
              isActive
                ? "bg-emerald-500 text-slate-950 shadow"
                : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-600/30"
            }`}
          >
            {isActive ? (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                Pro Active • Tap to Toggle
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 fill-white" />
                Enable Premium Benefits (Free)
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionsModal;
