import { useState } from "react";
import { useAuthContext } from "../../context/AuthContext";
import { X, Copy, Check, Mail, User, Shield, Calendar } from "lucide-react";
import toast from "react-hot-toast";

const ProfileModal = ({ onClose }) => {
  const { authUser } = useAuthContext();
  const [copied, setCopied] = useState(false);

  if (!authUser) return null;

  const copyId = () => {
    navigator.clipboard.writeText(authUser._id);
    setCopied(true);
    toast.success("User ID copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div
        className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow ambient */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-indigo-400" />
            <h3 className="text-lg font-bold text-white">Your Account Profile</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="py-6 flex flex-col items-center text-center">
          <div className="relative mb-4">
            <img
              src={
                authUser.profilepic ||
                `https://avatar.iran.liara.run/public/${authUser.gender === "female" ? "girl" : "boy"}?username=${encodeURIComponent(authUser.username)}`
              }
              alt={authUser.fullname}
              className="w-24 h-24 rounded-3xl object-cover border-2 border-indigo-500/50 shadow-xl shadow-indigo-500/20"
            />
            <span className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 border-2 border-slate-900 rounded-full glow-emerald" />
          </div>

          <h2 className="text-xl font-bold text-white">{authUser.fullname}</h2>
          <p className="text-sm text-indigo-400 font-medium">@{authUser.username}</p>

          {/* Details list */}
          <div className="w-full mt-6 space-y-3 text-left">
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-800/50 border border-slate-700/40">
              <Mail className="w-4 h-4 text-indigo-400 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Email Address</p>
                <p className="text-sm font-medium text-slate-200 truncate">{authUser.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-800/50 border border-slate-700/40">
              <User className="w-4 h-4 text-purple-400 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Gender</p>
                <p className="text-sm font-medium text-slate-200 capitalize">{authUser.gender || "Not specified"}</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/50 border border-slate-700/40">
              <div className="min-w-0 flex-1">
                <p className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Account ID</p>
                <p className="text-xs font-mono text-slate-300 truncate">{authUser._id}</p>
              </div>
              <button
                onClick={copyId}
                className="p-2 rounded-xl text-slate-400 hover:text-indigo-300 hover:bg-slate-700/50 transition-colors"
                title="Copy ID"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
