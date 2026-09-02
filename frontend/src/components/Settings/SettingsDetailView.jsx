import { useState } from "react";
import { useAuthContext } from "../../context/AuthContext";
import { useChatContext } from "../../context/ChatContext";
import AIPersonalitySettings from "./AIPersonalitySettings";
import {
  ShieldCheck,
  Lock,
  KeyRound,
  User,
  Laptop,
  MessageSquare,
  Video,
  Bell,
  Keyboard,
  HelpCircle,
  Check,
  Eye,
  EyeOff,
  Volume2,
  VolumeX,
  Sparkles,
  Smartphone,
  Copy
} from "lucide-react";
import toast from "react-hot-toast";

const SettingsDetailView = ({ activeCategory }) => {
  const { authUser, setAuthUser } = useAuthContext();
  const { soundEnabled, setSoundEnabled } = useChatContext();

  // Settings states
  const [fullname, setFullname] = useState(authUser?.fullname || "");
  const [username, setUsername] = useState(authUser?.username || "");
  const [about, setAbout] = useState("Available | Using Aryavarta 🚀");
  const [securityNotifs, setSecurityNotifs] = useState(true);
  const [readReceipts, setReadReceipts] = useState(true);
  const [lastSeen, setLastSeen] = useState("everyone");
  const [disappearingTimer, setDisappearingTimer] = useState("off");
  const [appLockEnabled, setAppLockEnabled] = useState(false);
  const [appLockPin, setAppLockPin] = useState("1234");
  const [autoLockTime, setAutoLockTime] = useState("immediately");
  const [chatWallpaper, setChatWallpaper] = useState("dark");
  const [enterIsSend, setEnterIsSend] = useState(true);
  const [showPreview, setShowPreview] = useState(true);

  const saveProfile = (e) => {
    e.preventDefault();
    if (!fullname.trim()) {
      toast.error("Name cannot be empty");
      return;
    }
    const updated = { ...authUser, fullname, username };
    setAuthUser(updated);
    localStorage.setItem("chat-user", JSON.stringify(updated));
    toast.success("Profile updated successfully! ✨");
  };

  return (
    <div className="flex-1 flex flex-col h-full min-h-0 bg-[#0f172a] rounded-3xl border border-slate-800/80 shadow-2xl overflow-hidden relative box-border">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md flex-shrink-0">
        <h2 className="text-lg font-bold text-white capitalize">
          {activeCategory === "help"
            ? "About Aryavarta Chat Application"
            : `${activeCategory} Settings`}
        </h2>
        <p className="text-xs text-slate-400">
          Manage your personal preferences, security, and device settings
        </p>
      </div>

      {/* Content Body */}
      <div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-6">
        {/* ================= AI VOICE & PERSONALITY ================= */}
        {activeCategory === "ai_voice" && (
          <AIPersonalitySettings onBack={() => {}} />
        )}

        {/* ================= GENERAL ================= */}
        {activeCategory === "general" && (
          <div className="space-y-6 max-w-xl">
            <div className="p-4 rounded-2xl bg-[#1e293b]/60 border border-slate-700/60 space-y-4">
              <h3 className="text-sm font-bold text-slate-200">Startup and Close</h3>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-200">Start Aryavarta on system login</p>
                  <p className="text-[11px] text-slate-400">Launch silently in background upon startup</p>
                </div>
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-200">Close to notification area / system tray</p>
                  <p className="text-[11px] text-slate-400">Keep application running when window is closed</p>
                </div>
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#1e293b]/60 border border-slate-700/60 space-y-3">
              <h3 className="text-sm font-bold text-slate-200">Language & Region</h3>
              <select className="w-full py-2.5 px-3 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500">
                <option>English (United States)</option>
                <option>Hindi (हिन्दी)</option>
                <option>Sanskrit (संस्कृतम्)</option>
                <option>Bengali (বাংলা)</option>
                <option>Tamil (தமிழ்)</option>
                <option>Telugu (తెలుగు)</option>
              </select>
            </div>
          </div>
        )}

        {/* ================= PROFILE ================= */}
        {activeCategory === "profile" && (
          <form onSubmit={saveProfile} className="space-y-6 max-w-xl">
            {/* Avatar Row */}
            <div className="flex items-center gap-5 p-4 rounded-2xl bg-[#1e293b]/60 border border-slate-700/60">
              <img
                src={
                  authUser?.profilepic ||
                  `https://avatar.iran.liara.run/public/${authUser?.gender === "female" ? "girl" : "boy"}?username=${encodeURIComponent(authUser?.username || "user")}`
                }
                alt="Profile"
                className="w-20 h-20 rounded-full object-cover border-2 border-emerald-500 shadow-md"
              />
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white">{authUser?.fullname}</h4>
                <p className="text-xs text-slate-400">Profile photo is visible to your contacts</p>
                <button
                  type="button"
                  onClick={() => toast.success("Avatar selection ready!")}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-lg text-emerald-400 border border-slate-700"
                >
                  Change Photo
                </button>
              </div>
            </div>

            {/* Edit Inputs */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Your Name
                </label>
                <input
                  type="text"
                  value={fullname}
                  onChange={(e) => setFullname(e.target.value)}
                  className="w-full py-2.5 px-3.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full py-2.5 px-3.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  About / Status
                </label>
                <input
                  type="text"
                  value={about}
                  onChange={(e) => setAbout(e.target.value)}
                  className="w-full py-2.5 px-3.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="py-2.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 transition-all cursor-pointer"
            >
              Save Profile
            </button>
          </form>
        )}

        {/* ================= ACCOUNT & SECURITY ================= */}
        {activeCategory === "account" && (
          <div className="space-y-6 max-w-xl">
            {/* Security Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-indigo-950/40 border border-emerald-500/30 flex items-start gap-3.5">
              <ShieldCheck className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-white">End-to-End Encryption & Security</h4>
                <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                  Your messages, calls, and shared documents are secured with end-to-end encryption. Only you and the recipient can read or listen to them.
                </p>
              </div>
            </div>

            {/* Security Notifications Toggle */}
            <div className="p-4 rounded-2xl bg-[#1e293b]/60 border border-slate-700/60 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-200">Show security notifications on this computer</h4>
                  <p className="text-[11px] text-slate-400">
                    Get notified when your security code changes for a contact
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={securityNotifs}
                  onChange={(e) => setSecurityNotifs(e.target.checked)}
                  className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                />
              </div>

              <div className="h-px bg-slate-700/50" />

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-200">Two-step verification</h4>
                  <p className="text-[11px] text-slate-400">For extra security, require a PIN when registering your account again</p>
                </div>
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded-full">
                  ENABLED
                </span>
              </div>
            </div>

            {/* Account Info actions */}
            <div className="p-4 rounded-2xl bg-[#1e293b]/60 border border-slate-700/60 space-y-3">
              <h3 className="text-sm font-bold text-slate-200">Account Management</h3>
              <button
                type="button"
                onClick={() => toast.success("Account report requested. Ready in 3 days.")}
                className="w-full text-left py-2 px-3 rounded-xl hover:bg-slate-800 text-xs font-medium text-slate-300 transition-colors"
              >
                Request account info report
              </button>
              <button
                type="button"
                onClick={() => toast.error("Account deletion requires confirmation")}
                className="w-full text-left py-2 px-3 rounded-xl hover:bg-rose-950/40 text-xs font-semibold text-rose-400 transition-colors"
              >
                Delete my account
              </button>
            </div>
          </div>
        )}

        {/* ================= PRIVACY & APP LOCK ================= */}
        {activeCategory === "privacy" && (
          <div className="space-y-6 max-w-xl">
            {/* App Lock PIN protection */}
            <div className="p-4 rounded-2xl bg-[#1e293b]/60 border border-emerald-500/40 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Lock className="w-5 h-5 text-emerald-400" />
                  <div>
                    <h4 className="text-xs font-bold text-white">App Lock (PIN Protection)</h4>
                    <p className="text-[11px] text-slate-400">Require a PIN code to unlock Aryavarta</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={appLockEnabled}
                  onChange={(e) => {
                    setAppLockEnabled(e.target.checked);
                    toast(e.target.checked ? "App Lock Enabled 🔒" : "App Lock Disabled 🔓");
                  }}
                  className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                />
              </div>

              {appLockEnabled && (
                <div className="pt-2 border-t border-slate-700 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-300 font-medium">App Lock PIN</span>
                    <input
                      type="password"
                      maxLength={6}
                      value={appLockPin}
                      onChange={(e) => setAppLockPin(e.target.value)}
                      className="w-24 text-center py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-100 font-mono"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-300 font-medium">Auto-lock timer</span>
                    <select
                      value={autoLockTime}
                      onChange={(e) => setAutoLockTime(e.target.value)}
                      className="py-1 px-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200"
                    >
                      <option value="immediately">Immediately</option>
                      <option value="1min">After 1 minute</option>
                      <option value="15min">After 15 minutes</option>
                      <option value="1hr">After 1 hour</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Read Receipts & Last Seen */}
            <div className="p-4 rounded-2xl bg-[#1e293b]/60 border border-slate-700/60 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-200">Read receipts</h4>
                  <p className="text-[11px] text-slate-400">If turned off, you won't send or receive read receipts (blue ticks)</p>
                </div>
                <input
                  type="checkbox"
                  checked={readReceipts}
                  onChange={(e) => setReadReceipts(e.target.checked)}
                  className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                />
              </div>

              <div className="h-px bg-slate-700/50" />

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-200">Last seen and online</h4>
                  <p className="text-[11px] text-slate-400">Control who can see when you were last online</p>
                </div>
                <select
                  value={lastSeen}
                  onChange={(e) => setLastSeen(e.target.value)}
                  className="py-1 px-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200"
                >
                  <option value="everyone">Everyone</option>
                  <option value="contacts">My contacts</option>
                  <option value="nobody">Nobody</option>
                </select>
              </div>

              <div className="h-px bg-slate-700/50" />

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-200">Disappearing messages default timer</h4>
                  <p className="text-[11px] text-slate-400">Start new chats with disappearing messages set</p>
                </div>
                <select
                  value={disappearingTimer}
                  onChange={(e) => setDisappearingTimer(e.target.value)}
                  className="py-1 px-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200"
                >
                  <option value="off">Off</option>
                  <option value="24h">24 hours</option>
                  <option value="7d">7 days</option>
                  <option value="90d">90 days</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* ================= CHATS ================= */}
        {activeCategory === "chats" && (
          <div className="space-y-6 max-w-xl">
            <div className="p-4 rounded-2xl bg-[#1e293b]/60 border border-slate-700/60 space-y-4">
              <h3 className="text-sm font-bold text-slate-200">Display & Themes</h3>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "dark", label: "WhatsApp Dark" },
                  { id: "midnight", label: "Cyber Midnight" },
                  { id: "emerald", label: "Aryavarta Emerald" }
                ].map((w) => (
                  <button
                    key={w.id}
                    type="button"
                    onClick={() => {
                      setChatWallpaper(w.id);
                      toast.success(`Theme set to ${w.label}`);
                    }}
                    className={`p-2.5 rounded-xl border text-xs font-semibold text-center transition-all ${
                      chatWallpaper === w.id
                        ? "bg-emerald-950/50 border-emerald-500 text-white"
                        : "bg-slate-900 border-slate-700 text-slate-400"
                    }`}
                  >
                    {w.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between pt-2">
                <div>
                  <p className="text-xs font-semibold text-slate-200">Enter key sends message</p>
                  <p className="text-[11px] text-slate-400">Press Shift+Enter for new line</p>
                </div>
                <input
                  type="checkbox"
                  checked={enterIsSend}
                  onChange={(e) => setEnterIsSend(e.target.checked)}
                  className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {/* ================= VIDEO & VOICE ================= */}
        {activeCategory === "voice" && (
          <div className="space-y-6 max-w-xl">
            <div className="p-4 rounded-2xl bg-[#1e293b]/60 border border-slate-700/60 space-y-4">
              <h3 className="text-sm font-bold text-slate-200">Audio Devices</h3>
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Microphone Input
                </label>
                <select className="w-full py-2 px-3 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200">
                  <option>Default - Internal Microphone (Realtek)</option>
                  <option>Headset Microphone</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Speakers Output
                </label>
                <select className="w-full py-2 px-3 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200">
                  <option>Default - Speakers (Realtek Audio)</option>
                  <option>Headphones</option>
                </select>
              </div>

              <button
                type="button"
                onClick={() => toast.success("Speakers audio test: Playing sound chime 🔔")}
                className="py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-lg text-emerald-400"
              >
                Test Audio Speakers
              </button>
            </div>
          </div>
        )}

        {/* ================= NOTIFICATIONS ================= */}
        {activeCategory === "notifications" && (
          <div className="space-y-6 max-w-xl">
            <div className="p-4 rounded-2xl bg-[#1e293b]/60 border border-slate-700/60 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-200">Chat sound effects</h4>
                  <p className="text-[11px] text-slate-400">Play sounds for incoming and outgoing messages</p>
                </div>
                <input
                  type="checkbox"
                  checked={soundEnabled}
                  onChange={(e) => setSoundEnabled(e.target.checked)}
                  className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                />
              </div>

              <div className="h-px bg-slate-700/50" />

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-200">Message preview</h4>
                  <p className="text-[11px] text-slate-400">Show sender and message text in notifications</p>
                </div>
                <input
                  type="checkbox"
                  checked={showPreview}
                  onChange={(e) => setShowPreview(e.target.checked)}
                  className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {/* ================= SHORTCUTS ================= */}
        {activeCategory === "shortcuts" && (
          <div className="space-y-3 max-w-xl">
            {[
              { key: "Ctrl + N", desc: "Start new conversation" },
              { key: "Ctrl + Shift + M", desc: "Mute sound effects" },
              { key: "Ctrl + Shift + U", desc: "Mark chat as unread" },
              { key: "Ctrl + Shift + P", desc: "Open Aryavarta AI Assistant" },
              { key: "Esc", desc: "Close active conversation" }
            ].map((sc, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 rounded-xl bg-[#1e293b]/60 border border-slate-700/60"
              >
                <span className="text-xs font-semibold text-slate-200">{sc.desc}</span>
                <kbd className="px-2 py-1 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-emerald-400 shadow-inner">
                  {sc.key}
                </kbd>
              </div>
            ))}
          </div>
        )}

        {/* ================= HELP & ABOUT ================= */}
        {activeCategory === "help" && (
          <div className="space-y-6 max-w-xl">
            <div className="p-6 rounded-3xl bg-gradient-to-tr from-[#111b21] via-slate-900 to-emerald-950/40 border border-emerald-500/30 text-center space-y-3">
              <div className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-xl shadow-emerald-500/20">
                <Sparkles className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white">Aryavarta Chat Application</h3>
              <p className="text-xs text-emerald-400 font-semibold">Version 2.4.0 (Security & AI Edition)</p>
              <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                A state-of-the-art real-time messaging application with integrated **Aryavarta AI**, WebSockets, end-to-end security, group chats, and instant multimedia collaboration.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsDetailView;
