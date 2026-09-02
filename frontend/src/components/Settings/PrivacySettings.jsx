import { useState } from "react";
import { ArrowLeft, ChevronRight, Check, Plus, Trash2, Shield, Lock } from "lucide-react";
import toast from "react-hot-toast";

const PrivacySettings = ({ onBack }) => {
  const [subView, setSubView] = useState(null); // null | "last_seen" | "profile_pic" | "about" | "status" | "timer" | "groups" | "blocked" | "app_lock"

  // Privacy states matching screenshots
  const [lastSeen, setLastSeen] = useState("Nobody");
  const [profilePic, setProfilePic] = useState("My contacts");
  const [about, setAbout] = useState("My contacts");
  const [status, setStatus] = useState("My contacts");
  const [readReceipts, setReadReceipts] = useState(true);
  const [defaultTimer, setDefaultTimer] = useState("Off");
  const [groups, setGroups] = useState("Everyone");
  const [blockedCount, setBlockedCount] = useState(4);
  const [appLockEnabled, setAppLockEnabled] = useState(false);
  const [appLockPin, setAppLockPin] = useState("1234");

  // Advanced section states matching screenshot 2
  const [blockUnknown, setBlockUnknown] = useState(false);
  const [protectIP, setProtectIP] = useState(false);
  const [turnOffPreviews, setTurnOffPreviews] = useState(false);

  // Sample blocked contacts list
  const [blockedList, setBlockedList] = useState([
    { id: 1, name: "Spam Caller (+91 91234 56789)" },
    { id: 2, name: "Unknown Telemarketer (+91 80000 11111)" },
    { id: 3, name: "Crypto Bot (+1 555 0199)" },
    { id: 4, name: "Ad Promotion (+91 99999 88888)" }
  ]);

  // ================= 1. SUB-VIEW: LAST SEEN AND ONLINE =================
  if (subView === "last_seen") {
    return (
      <div className="w-full flex flex-col h-full min-h-0 bg-[#111b21] border-r border-slate-800/80 z-10 box-border text-slate-100 select-none animate-fade-in">
        <div className="flex items-center gap-4 px-4 py-4 border-b border-slate-800/60 flex-shrink-0">
          <button onClick={() => setSubView(null)} className="p-1.5 rounded-full hover:bg-slate-800 text-slate-300 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-bold text-slate-100">Last seen and online</h2>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
          <span className="text-xs font-semibold text-slate-400 block">Who can see my last seen</span>
          {["Everyone", "My contacts", "Nobody"].map((opt) => (
            <div
              key={opt}
              onClick={() => {
                setLastSeen(opt);
                toast.success(`Last seen set to ${opt}`);
              }}
              className="flex items-center justify-between p-3 rounded-2xl hover:bg-[#202c33] cursor-pointer transition-colors"
            >
              <span className="text-sm text-slate-200">{opt}</span>
              {lastSeen === opt && <Check className="w-4 h-4 text-emerald-400" />}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ================= 2. SUB-VIEW: PROFILE PICTURE =================
  if (subView === "profile_pic") {
    return (
      <div className="w-full flex flex-col h-full min-h-0 bg-[#111b21] border-r border-slate-800/80 z-10 box-border text-slate-100 select-none animate-fade-in">
        <div className="flex items-center gap-4 px-4 py-4 border-b border-slate-800/60 flex-shrink-0">
          <button onClick={() => setSubView(null)} className="p-1.5 rounded-full hover:bg-slate-800 text-slate-300 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-bold text-slate-100">Profile picture</h2>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
          <span className="text-xs font-semibold text-slate-400 block">Who can see my profile picture</span>
          {["Everyone", "My contacts", "Nobody"].map((opt) => (
            <div
              key={opt}
              onClick={() => {
                setProfilePic(opt);
                toast.success(`Profile picture visibility set to ${opt}`);
              }}
              className="flex items-center justify-between p-3 rounded-2xl hover:bg-[#202c33] cursor-pointer transition-colors"
            >
              <span className="text-sm text-slate-200">{opt}</span>
              {profilePic === opt && <Check className="w-4 h-4 text-emerald-400" />}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ================= 3. SUB-VIEW: ABOUT =================
  if (subView === "about") {
    return (
      <div className="w-full flex flex-col h-full min-h-0 bg-[#111b21] border-r border-slate-800/80 z-10 box-border text-slate-100 select-none animate-fade-in">
        <div className="flex items-center gap-4 px-4 py-4 border-b border-slate-800/60 flex-shrink-0">
          <button onClick={() => setSubView(null)} className="p-1.5 rounded-full hover:bg-slate-800 text-slate-300 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-bold text-slate-100">About</h2>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
          <span className="text-xs font-semibold text-slate-400 block">Who can see my about</span>
          {["Everyone", "My contacts", "Nobody"].map((opt) => (
            <div
              key={opt}
              onClick={() => {
                setAbout(opt);
                toast.success(`About status visibility set to ${opt}`);
              }}
              className="flex items-center justify-between p-3 rounded-2xl hover:bg-[#202c33] cursor-pointer transition-colors"
            >
              <span className="text-sm text-slate-200">{opt}</span>
              {about === opt && <Check className="w-4 h-4 text-emerald-400" />}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ================= 4. SUB-VIEW: STATUS =================
  if (subView === "status") {
    return (
      <div className="w-full flex flex-col h-full min-h-0 bg-[#111b21] border-r border-slate-800/80 z-10 box-border text-slate-100 select-none animate-fade-in">
        <div className="flex items-center gap-4 px-4 py-4 border-b border-slate-800/60 flex-shrink-0">
          <button onClick={() => setSubView(null)} className="p-1.5 rounded-full hover:bg-slate-800 text-slate-300 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-bold text-slate-100">Status privacy</h2>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
          <span className="text-xs font-semibold text-slate-400 block">Who can see my status updates</span>
          {["My contacts", "My contacts except...", "Only share with..."].map((opt) => (
            <div
              key={opt}
              onClick={() => {
                setStatus(opt);
                toast.success(`Status visibility set to ${opt}`);
              }}
              className="flex items-center justify-between p-3 rounded-2xl hover:bg-[#202c33] cursor-pointer transition-colors"
            >
              <span className="text-sm text-slate-200">{opt}</span>
              {status === opt && <Check className="w-4 h-4 text-emerald-400" />}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ================= 5. SUB-VIEW: DEFAULT MESSAGE TIMER =================
  if (subView === "timer") {
    return (
      <div className="w-full flex flex-col h-full min-h-0 bg-[#111b21] border-r border-slate-800/80 z-10 box-border text-slate-100 select-none animate-fade-in">
        <div className="flex items-center gap-4 px-4 py-4 border-b border-slate-800/60 flex-shrink-0">
          <button onClick={() => setSubView(null)} className="p-1.5 rounded-full hover:bg-slate-800 text-slate-300 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-bold text-slate-100">Default message timer</h2>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
          <span className="text-xs font-semibold text-slate-400 block">Start new chats with disappearing messages set to</span>
          {["24 hours", "7 days", "90 days", "Off"].map((opt) => (
            <div
              key={opt}
              onClick={() => {
                setDefaultTimer(opt);
                toast.success(`Default timer set to ${opt}`);
              }}
              className="flex items-center justify-between p-3 rounded-2xl hover:bg-[#202c33] cursor-pointer transition-colors"
            >
              <span className="text-sm text-slate-200">{opt}</span>
              {defaultTimer === opt && <Check className="w-4 h-4 text-emerald-400" />}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ================= 6. SUB-VIEW: BLOCKED CONTACTS =================
  if (subView === "blocked") {
    return (
      <div className="w-full flex flex-col h-full min-h-0 bg-[#111b21] border-r border-slate-800/80 z-10 box-border text-slate-100 select-none animate-fade-in">
        <div className="flex items-center gap-4 px-4 py-4 border-b border-slate-800/60 flex-shrink-0">
          <button onClick={() => setSubView(null)} className="p-1.5 rounded-full hover:bg-slate-800 text-slate-300 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-bold text-slate-100">Blocked contacts</h2>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3">
          <button
            onClick={() => toast.success("Select a contact to block")}
            className="w-full flex items-center gap-3 p-3 bg-[#202c33] hover:bg-[#2a3942] rounded-2xl text-xs font-semibold text-emerald-400 border border-slate-750 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add blocked contact</span>
          </button>

          <span className="text-xs font-semibold text-slate-400 block pt-2">
            Blocked list ({blockedList.length})
          </span>

          {blockedList.map((contact) => (
            <div
              key={contact.id}
              className="flex items-center justify-between p-3 bg-[#202c33] rounded-2xl border border-slate-700/60"
            >
              <span className="text-xs text-slate-200 font-medium truncate">{contact.name}</span>
              <button
                onClick={() => {
                  const updated = blockedList.filter((c) => c.id !== contact.id);
                  setBlockedList(updated);
                  setBlockedCount(updated.length);
                  toast.success("Contact unblocked 🔓");
                }}
                className="p-1.5 text-slate-400 hover:text-rose-400 transition-colors"
                title="Unblock"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ================= 7. SUB-VIEW: APP LOCK =================
  if (subView === "app_lock") {
    return (
      <div className="w-full flex flex-col h-full min-h-0 bg-[#111b21] border-r border-slate-800/80 z-10 box-border text-slate-100 select-none animate-fade-in">
        <div className="flex items-center gap-4 px-4 py-4 border-b border-slate-800/60 flex-shrink-0">
          <button onClick={() => setSubView(null)} className="p-1.5 rounded-full hover:bg-slate-800 text-slate-300 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-bold text-slate-100">App lock</h2>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto p-5 space-y-6">
          <div className="flex items-start justify-between">
            <div className="pr-4">
              <span className="text-sm font-medium text-slate-200 block">Require password to unlock Aryavarta</span>
              <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                When enabled, you will need to enter your 4-digit PIN to open Aryavarta.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer flex-shrink-0 mt-1">
              <input
                type="checkbox"
                checked={appLockEnabled}
                onChange={(e) => {
                  setAppLockEnabled(e.target.checked);
                  toast(e.target.checked ? "App Lock Enabled 🔒" : "App Lock Disabled 🔓");
                }}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00a884]"></div>
            </label>
          </div>

          {appLockEnabled && (
            <div className="p-4 bg-[#202c33] rounded-2xl border border-slate-700 space-y-3">
              <span className="text-xs font-semibold text-slate-300">Set 4-digit PIN:</span>
              <input
                type="password"
                maxLength={4}
                value={appLockPin}
                onChange={(e) => setAppLockPin(e.target.value)}
                className="w-full py-2 px-3 bg-slate-900 border border-slate-700 rounded-xl text-center text-sm text-slate-100 font-mono tracking-widest"
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  // ================= MAIN PRIVACY SCREEN (Matching Screenshots 1 & 2 Exactly) =================
  return (
    <div className="w-full flex flex-col h-full min-h-0 bg-[#111b21] border-r border-slate-800/80 z-10 box-border text-slate-100 select-none">
      {/* 1. Header: ← Privacy */}
      <div className="flex items-center gap-4 px-4 py-4 border-b border-slate-800/60 flex-shrink-0">
        <button
          onClick={onBack}
          className="p-1.5 rounded-full hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
          title="Back to Settings"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-bold text-slate-100">Privacy</h2>
      </div>

      {/* 2. Scrollable Content */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-6">
        {/* ================= SECTION 1: Who can see my personal info ================= */}
        <div className="space-y-1">
          <span className="text-xs font-semibold text-slate-400 block tracking-wide px-2 pb-1">
            Who can see my personal info
          </span>

          {/* Last seen and online */}
          <div
            onClick={() => setSubView("last_seen")}
            className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-[#202c33] cursor-pointer transition-colors"
          >
            <div>
              <span className="text-sm font-medium text-slate-200 block">Last seen and online</span>
              <span className="text-xs text-slate-400">{lastSeen}</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </div>

          {/* Profile picture */}
          <div
            onClick={() => setSubView("profile_pic")}
            className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-[#202c33] cursor-pointer transition-colors"
          >
            <div>
              <span className="text-sm font-medium text-slate-200 block">Profile picture</span>
              <span className="text-xs text-slate-400">{profilePic}</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </div>

          {/* About */}
          <div
            onClick={() => setSubView("about")}
            className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-[#202c33] cursor-pointer transition-colors"
          >
            <div>
              <span className="text-sm font-medium text-slate-200 block">About</span>
              <span className="text-xs text-slate-400">{about}</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </div>

          {/* Status */}
          <div
            onClick={() => setSubView("status")}
            className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-[#202c33] cursor-pointer transition-colors"
          >
            <div>
              <span className="text-sm font-medium text-slate-200 block">Status</span>
              <span className="text-xs text-slate-400">{status}</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </div>

          {/* Read receipts */}
          <div className="flex items-start justify-between p-2.5 pt-3">
            <div className="pr-4">
              <span className="text-sm font-medium text-slate-200 block">Read receipts</span>
              <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                If turned off, you won't send or receive read receipts. Read receipts are always sent for group chats.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer flex-shrink-0 mt-1">
              <input
                type="checkbox"
                checked={readReceipts}
                onChange={(e) => {
                  setReadReceipts(e.target.checked);
                  toast(e.target.checked ? "Read receipts enabled (blue ticks)" : "Read receipts disabled");
                }}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00a884]"></div>
            </label>
          </div>
        </div>

        {/* ================= SECTION 2: Disappearing messages ================= */}
        <div className="space-y-1 pt-2 border-t border-slate-800">
          <span className="text-xs font-semibold text-slate-400 block tracking-wide px-2 pb-1">
            Disappearing messages
          </span>

          {/* Default message timer */}
          <div
            onClick={() => setSubView("timer")}
            className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-[#202c33] cursor-pointer transition-colors"
          >
            <div>
              <span className="text-sm font-medium text-slate-200 block">Default message timer</span>
              <span className="text-xs text-slate-400">{defaultTimer}</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </div>

          {/* Groups */}
          <div
            onClick={() => {
              const next = groups === "Everyone" ? "My contacts" : "Everyone";
              setGroups(next);
              toast.success(`Group invitations set to ${next}`);
            }}
            className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-[#202c33] cursor-pointer transition-colors"
          >
            <div>
              <span className="text-sm font-medium text-slate-200 block">Groups</span>
              <span className="text-xs text-slate-400">{groups}</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </div>

          {/* Blocked contacts */}
          <div
            onClick={() => setSubView("blocked")}
            className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-[#202c33] cursor-pointer transition-colors"
          >
            <div>
              <span className="text-sm font-medium text-slate-200 block">Blocked contacts</span>
              <span className="text-xs text-slate-400">{blockedCount}</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </div>

          {/* App lock */}
          <div
            onClick={() => setSubView("app_lock")}
            className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-[#202c33] cursor-pointer transition-colors"
          >
            <div>
              <span className="text-sm font-medium text-slate-200 block">App lock</span>
              <span className="text-xs text-slate-400">
                {appLockEnabled ? "Enabled (PIN required)" : "Require password to unlock Aryavarta"}
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </div>
        </div>

        {/* ================= SECTION 3: Advanced (Matching Screenshot 2) ================= */}
        <div className="space-y-3 pt-2 border-t border-slate-800">
          <span className="text-xs font-semibold text-slate-400 block tracking-wide px-2 pb-1">
            Advanced
          </span>

          {/* 1. Block unknown account messages */}
          <div className="flex items-start justify-between p-2.5">
            <div className="pr-4">
              <span className="text-sm font-medium text-slate-200 block">
                Block unknown account messages
              </span>
              <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                To protect your account and improve device performance, Aryavarta will block messages from unknown accounts if they exceed a certain volume.{" "}
                <button
                  onClick={() => toast("Learn more about unknown account blocking")}
                  className="text-emerald-400 hover:text-emerald-300 underline"
                >
                  Learn more
                </button>
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer flex-shrink-0 mt-1">
              <input
                type="checkbox"
                checked={blockUnknown}
                onChange={(e) => {
                  setBlockUnknown(e.target.checked);
                  toast(e.target.checked ? "Block unknown messages enabled" : "Disabled");
                }}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00a884]"></div>
            </label>
          </div>

          {/* 2. Protect IP address in calls */}
          <div className="flex items-start justify-between p-2.5">
            <div className="pr-4">
              <span className="text-sm font-medium text-slate-200 block">
                Protect IP address in calls
              </span>
              <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                To make it harder for people to infer your location, calls on this device will be securely relayed through Aryavarta servers. This will reduce call quality.{" "}
                <button
                  onClick={() => toast("Learn more about IP relay protection")}
                  className="text-emerald-400 hover:text-emerald-300 underline"
                >
                  Learn more
                </button>
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer flex-shrink-0 mt-1">
              <input
                type="checkbox"
                checked={protectIP}
                onChange={(e) => {
                  setProtectIP(e.target.checked);
                  toast(e.target.checked ? "Protect IP in calls enabled" : "Disabled");
                }}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00a884]"></div>
            </label>
          </div>

          {/* 3. Turn off link previews */}
          <div className="flex items-start justify-between p-2.5">
            <div className="pr-4">
              <span className="text-sm font-medium text-slate-200 block">
                Turn off link previews
              </span>
              <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                To help protect your IP address from being inferred by third-party websites, previews for the links you share in chats will no longer be generated.{" "}
                <button
                  onClick={() => toast("Learn more about link previews privacy")}
                  className="text-emerald-400 hover:text-emerald-300 underline"
                >
                  Learn more
                </button>
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer flex-shrink-0 mt-1">
              <input
                type="checkbox"
                checked={turnOffPreviews}
                onChange={(e) => {
                  setTurnOffPreviews(e.target.checked);
                  toast(e.target.checked ? "Link previews turned off" : "Link previews enabled");
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

export default PrivacySettings;
