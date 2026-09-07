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
import confetti from "canvas-confetti";
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
    title: "Verified Gold Badge",
    desc: "Exclusive shiny verification badge displayed on your profile and chats."
  },
  {
    icon: Palette,
    title: "Exclusive Animated Wallpapers",
    desc: "Unlock dynamic animated gradients, custom chat bubbles, and caller tunes."
  },
  {
    icon: Video,
    title: "Full HD Video Meetings",
    desc: "Host 1080p 60fps crystal clear group calls with unlimited participants."
  }
];

const SubscriptionsModal = ({ onClose }) => {
  const [billingCycle, setBillingCycle] = useState("annual"); // "monthly" | "annual"
  const [isSubscribed, setIsSubscribed] = useState(() => {
    return localStorage.getItem("aryavarta_premium_active") === "true";
  });

  const handleSubscribe = () => {
    localStorage.setItem("aryavarta_premium_active", "true");
    setIsSubscribed(true);

    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {}

    toast.success("Welcome to Aryavarta Premium! 💎✨");
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#111b21] border border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col text-slate-100 max-h-[90vh]">
        {/* Banner */}
        <div className="relative p-6 bg-gradient-to-br from-indigo-950 via-[#182035] to-[#111b21] border-b border-indigo-500/20 text-center">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-1.5 rounded-full hover:bg-slate-800/80 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Diamond className="w-8 h-8 text-white fill-white/20" />
          </div>

          <h3 className="text-xl font-extrabold text-white">Aryavarta Premium</h3>
          <p className="text-xs text-indigo-300 mt-1 max-w-xs mx-auto">
            Elevate your communication with next-level features and boundless power
          </p>

          {/* Billing selector */}
          <div className="flex items-center justify-center gap-2 mt-4 p-1 bg-slate-900/80 rounded-2xl border border-indigo-500/30 w-fit mx-auto text-xs font-semibold">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                billingCycle === "monthly"
                  ? "bg-indigo-600 text-white shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Monthly ₹99
            </button>
            <button
              onClick={() => setBillingCycle("annual")}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                billingCycle === "annual"
                  ? "bg-indigo-600 text-white shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <span>Annual ₹799</span>
              <span className="bg-emerald-500/20 text-emerald-400 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                Save 33%
              </span>
            </button>
          </div>
        </div>

        {/* Benefits list */}
        <div className="p-5 flex-1 min-h-0 overflow-y-auto space-y-3.5 divide-y divide-slate-800/60">
          {PREMIUM_BENEFITS.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className={`flex items-start gap-3.5 ${idx > 0 ? "pt-3.5" : ""}`}>
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex-shrink-0 mt-0.5">
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">{item.title}</h4>
                  <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Action */}
        <div className="p-5 border-t border-slate-800/80 bg-[#16202a]">
          {isSubscribed ? (
            <div className="w-full py-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold text-center flex items-center justify-center gap-2">
              <Check className="w-4 h-4" />
              Active Premium Member
            </div>
          ) : (
            <button
              onClick={handleSubscribe}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Zap className="w-4 h-4 fill-white" />
              Subscribe {billingCycle === "annual" ? "₹799 / Year" : "₹99 / Month"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionsModal;
