import { useState } from "react";
import {
  ArrowLeft,
  Shield,
  FileText,
  Info,
  Lock,
  MessageSquare,
  Phone,
  Image as ImageIcon,
  MapPin,
  Radio,
  Clock,
  AlertTriangle,
  ExternalLink
} from "lucide-react";
import { useAuthContext } from "../../context/AuthContext";
import toast from "react-hot-toast";

const AccountSettings = ({ onBack }) => {
  const { authUser, logout } = useAuthContext();
  const [subView, setSubView] = useState(null); // null | "security" | "request_info" | "delete_account"

  // Security screen states
  const [securityNotifsOn, setSecurityNotifsOn] = useState(false);

  // Request account info states
  const [accountReportSent, setAccountReportSent] = useState(true);
  const [channelsReportSent, setChannelsReportSent] = useState(false);

  // Delete account state
  const [phoneConfirm, setPhoneConfirm] = useState("");

  // Calculate dynamic ready date (+3 days)
  const readyDate = new Date();
  readyDate.setDate(readyDate.getDate() + 3);
  const readyDateStr = readyDate.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric"
  });

  // ================= 1. SECURITY SUB-SCREEN (Matching Screenshot 1) =================
  if (subView === "security") {
    return (
      <div className="w-full flex flex-col h-full min-h-0 bg-[#111b21] border-r border-slate-800/80 z-10 box-border text-slate-100 select-none animate-fade-in">
        {/* Header: ← Security */}
        <div className="flex items-center gap-4 px-4 py-4 border-b border-slate-800/60 flex-shrink-0">
          <button
            onClick={() => setSubView(null)}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
            title="Back to Account"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-bold text-slate-100">Security</h2>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 min-h-0 overflow-y-auto p-5 space-y-6">
          {/* Top Graphic */}
          <div className="flex justify-center my-2">
            <div className="w-28 h-10 rounded-full bg-gradient-to-r from-emerald-200/90 to-emerald-400 flex items-center justify-end pr-3 shadow-md">
              <div className="w-4 h-4 rounded-full bg-emerald-800/80 flex items-center justify-center">
                <Lock className="w-2.5 h-2.5 text-white" />
              </div>
            </div>
          </div>

          {/* Title & Description */}
          <div className="space-y-2">
            <h3 className="text-base md:text-lg font-bold text-white tracking-tight">
              Your chats and calls are private
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              End-to-end encryption keeps your personal messages and calls between you and the people you choose. No one outside of the chat, not even Aryavarta, can read, listen to, or share them. This includes your:
            </p>
          </div>

          {/* Feature List matching screenshot 1 */}
          <div className="space-y-4 text-xs font-medium text-slate-200">
            <div className="flex items-center gap-3.5">
              <MessageSquare className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <span>Text and voice messages</span>
            </div>

            <div className="flex items-center gap-3.5">
              <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <span>Audio and video calls</span>
            </div>

            <div className="flex items-center gap-3.5">
              <ImageIcon className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <span>Photos, videos and documents</span>
            </div>

            <div className="flex items-center gap-3.5">
              <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <span>Location sharing</span>
            </div>

            <div className="flex items-center gap-3.5">
              <Radio className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <span>Statuses</span>
            </div>
          </div>

          {/* Learn More link */}
          <div>
            <button
              onClick={() => toast("Opening Aryavarta Security Whitepaper 📄")}
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 underline"
            >
              Learn more
            </button>
          </div>

          {/* Bottom Card / Toggle matching screenshot 1 */}
          <div className="pt-4 border-t border-slate-800/80 flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <Lock className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-medium text-slate-200 block leading-tight">
                  Show security notifications on this computer
                </span>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  Get notified when your security code changes for a contact's phone. If you have multiple devices, this setting must be enabled on each device.
                </p>
              </div>
            </div>

            {/* Toggle Switch */}
            <label className="relative inline-flex items-center cursor-pointer flex-shrink-0 mt-0.5">
              <input
                type="checkbox"
                checked={securityNotifsOn}
                onChange={(e) => {
                  setSecurityNotifsOn(e.target.checked);
                  toast(
                    e.target.checked
                      ? "Security notifications enabled on this computer 🔔"
                      : "Security notifications disabled"
                  );
                }}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00a884]"></div>
            </label>
          </div>
        </div>
      </div>
    );
  }

  // ================= 2. REQUEST ACCOUNT INFO SUB-SCREEN (Matching Screenshot 2) =================
  if (subView === "request_info") {
    return (
      <div className="w-full flex flex-col h-full min-h-0 bg-[#111b21] border-r border-slate-800/80 z-10 box-border text-slate-100 select-none animate-fade-in">
        {/* Header: ← Request account info */}
        <div className="flex items-center gap-4 px-4 py-4 border-b border-slate-800/60 flex-shrink-0">
          <button
            onClick={() => setSubView(null)}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
            title="Back to Account"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-bold text-slate-100">Request account info</h2>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-6">
          {/* Section 1: Account information */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-400 block tracking-wide">
              Account information
            </span>

            {/* Request Sent card */}
            <div className="flex items-center gap-4 px-4 py-3.5 bg-[#202c33] rounded-2xl border border-slate-750/60">
              <Clock className="w-5 h-5 text-slate-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <h4 className="text-xs md:text-sm font-semibold text-slate-200">Request sent</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Ready by {readyDateStr}</p>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed px-1 pt-1">
              Your request will be cancelled if you make changes to your account such as changing your number or deleting your account.
            </p>
          </div>

          {/* Section 2: Channels activity matching screenshot 2 */}
          <div className="space-y-2 pt-2">
            <span className="text-xs font-semibold text-slate-400 block tracking-wide">
              Channels activity
            </span>

            {/* Request Channels report button */}
            <button
              onClick={() => {
                setChannelsReportSent(true);
                toast.success("Channels report requested! Ready soon. 📑");
              }}
              className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl border transition-colors text-left ${
                channelsReportSent
                  ? "bg-[#202c33] border-slate-700/60 text-slate-300"
                  : "bg-[#202c33] hover:bg-[#2a3942] border-slate-700/60 text-slate-200"
              }`}
            >
              <FileText className="w-5 h-5 text-slate-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <span className="text-xs md:text-sm font-semibold block">
                  {channelsReportSent ? "Channels request sent" : "Request Channels report"}
                </span>
                {channelsReportSent && (
                  <span className="text-[11px] text-emerald-400">Ready by {readyDateStr}</span>
                )}
              </div>
            </button>

            <p className="text-[11px] text-slate-400 leading-relaxed px-1 pt-1">
              Create a report of updates and information from channels you interact with or manage, which you can access or port to another app.{" "}
              <button
                onClick={() => toast("Learn more about Channels reports 📄")}
                className="text-emerald-400 hover:text-emerald-300 underline"
              >
                Learn more
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ================= 3. DELETE ACCOUNT SUB-SCREEN =================
  if (subView === "delete_account") {
    return (
      <div className="w-full flex flex-col h-full min-h-0 bg-[#111b21] border-r border-slate-800/80 z-10 box-border text-slate-100 select-none animate-fade-in">
        <div className="flex items-center gap-4 px-4 py-4 border-b border-slate-800/60 flex-shrink-0">
          <button
            onClick={() => setSubView(null)}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-bold text-rose-400">Delete account</h2>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto p-5 space-y-6">
          <div className="p-4 bg-rose-950/30 border border-rose-500/40 rounded-2xl space-y-2">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <span>Deleting your account will:</span>
            </div>
            <ul className="text-xs text-rose-200/80 list-disc list-inside space-y-1 pl-1">
              <li>Delete your account info and profile photo</li>
              <li>Delete you from all Aryavarta groups</li>
              <li>Delete your message history on this device</li>
            </ul>
          </div>

          <div className="space-y-3">
            <label className="block text-xs font-semibold text-slate-300">
              To delete your account, confirm your phone number:
            </label>
            <input
              type="text"
              placeholder={authUser?.phone || "+91 88581 81459"}
              value={phoneConfirm}
              onChange={(e) => setPhoneConfirm(e.target.value)}
              className="w-full py-2.5 px-3.5 bg-[#202c33] border border-slate-700 rounded-xl text-xs text-slate-100 font-mono focus:outline-none focus:border-rose-500"
            />

            <button
              onClick={() => {
                if (!phoneConfirm.trim()) {
                  toast.error("Please enter your registered phone number to confirm");
                  return;
                }
                toast.success("Account deleted. Logging out...");
                setTimeout(() => logout(), 1000);
              }}
              className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-600/30 transition-all cursor-pointer"
            >
              Delete My Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ================= MAIN ACCOUNT SCREEN =================
  return (
    <div className="w-full flex flex-col h-full min-h-0 bg-[#111b21] border-r border-slate-800/80 z-10 box-border text-slate-100 select-none">
      {/* 1. Header: ← Account */}
      <div className="flex items-center gap-4 px-4 py-4 border-b border-slate-800/60 flex-shrink-0">
        <button
          onClick={onBack}
          className="p-1.5 rounded-full hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
          title="Back to Settings"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-bold text-slate-100">Account</h2>
      </div>

      {/* 2. Menu list items */}
      <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-1">
        {/* 1. Security notifications */}
        <div
          onClick={() => setSubView("security")}
          className="flex items-center gap-4 px-4 py-3.5 rounded-2xl hover:bg-[#202c33] cursor-pointer transition-colors text-slate-200"
        >
          <Shield className="w-5 h-5 text-slate-400 flex-shrink-0" />
          <span className="text-sm font-medium flex-1">Security notifications</span>
        </div>

        {/* 2. Request account info */}
        <div
          onClick={() => setSubView("request_info")}
          className="flex items-center gap-4 px-4 py-3.5 rounded-2xl hover:bg-[#202c33] cursor-pointer transition-colors text-slate-200"
        >
          <FileText className="w-5 h-5 text-slate-400 flex-shrink-0" />
          <span className="text-sm font-medium flex-1">Request account info</span>
        </div>

        {/* 3. How to delete my account */}
        <div
          onClick={() => setSubView("delete_account")}
          className="flex items-center gap-4 px-4 py-3.5 rounded-2xl hover:bg-[#202c33] cursor-pointer transition-colors text-slate-200"
        >
          <Info className="w-5 h-5 text-slate-400 flex-shrink-0" />
          <span className="text-sm font-medium flex-1">How to delete my account</span>
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;
