import { useState } from "react";
import {
  ArrowLeft,
  ChevronRight,
  Check,
  Plus,
  Trash2,
  Shield,
  Lock,
  Smartphone,
  Users,
  Phone,
  Eye,
  Video,
  FileText,
  UserX,
  ExternalLink
} from "lucide-react";
import toast from "react-hot-toast";

const PRIVACY_OPTIONS = ["Everybody", "My contacts", "Nobody"];

const PrivacySettings = ({ onBack }) => {
  const [subView, setSubView] = useState(null); // null | "app_lock" | "blocked" | "phone" | "last_seen" | "new_chat" | "calls" | "meetings" | "groups" | "profile" | "stories" | "terms" | "privacy_doc"

  // Privacy states matching exact screenshot model
  const [appLockEnabled, setAppLockEnabled] = useState(true);
  const [appLockPin, setAppLockPin] = useState("1234");
  const [blockedList, setBlockedList] = useState([]);
  
  const [phoneNumberVisibility, setPhoneNumberVisibility] = useState("My contacts");
  const [lastSeenVisibility, setLastSeenVisibility] = useState("Everybody");
  const [newChatVisibility, setNewChatVisibility] = useState("Everybody");
  const [callsVisibility, setCallsVisibility] = useState("My contacts");
  const [meetingsVisibility, setMeetingsVisibility] = useState("Everybody");
  const [groupsVisibility, setGroupsVisibility] = useState("My contacts");
  const [profilePhotoVisibility, setProfilePhotoVisibility] = useState("My contacts");
  const [storiesVisibility, setStoriesVisibility] = useState("My contacts");

  // Toggles matching screenshot 2
  const [readReceipts, setReadReceipts] = useState(true);
  const [syncContacts, setSyncContacts] = useState(false);
  const [screenSecurity, setScreenSecurity] = useState(true);
  const [protectIP, setProtectIP] = useState(false);
  const [shareDiagnostics, setShareDiagnostics] = useState(true);

  // Sub-view helper renderer for standard visibility options
  const renderVisibilitySubView = (title, currentValue, onSelect) => (
    <div className="w-full flex flex-col h-full min-h-0 bg-[#111b21] border-r border-slate-800/80 z-10 box-border text-slate-100 select-none animate-fade-in">
      <div className="flex items-center gap-4 px-4 py-4 border-b border-slate-800/60 flex-shrink-0">
        <button
          onClick={() => setSubView(null)}
          className="p-1.5 rounded-full hover:bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-bold text-slate-100">{title}</h2>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3">
        <span className="text-xs font-semibold text-slate-400 block px-1">Who can see my {title.toLowerCase()}</span>
        {PRIVACY_OPTIONS.map((opt) => (
          <div
            key={opt}
            onClick={() => {
              onSelect(opt);
              toast.success(`${title} set to ${opt}`);
              setSubView(null);
            }}
            className="flex items-center justify-between p-3.5 rounded-2xl hover:bg-[#202c33] cursor-pointer transition-colors bg-[#182229] border border-slate-800"
          >
            <span className="text-sm font-medium text-slate-200">{opt}</span>
            {currentValue === opt && <Check className="w-4 h-4 text-[#5c7cd8]" />}
          </div>
        ))}
      </div>
    </div>
  );

  // ================= 1. SUB-VIEWS =================
  if (subView === "phone") {
    return renderVisibilitySubView("Phone number", phoneNumberVisibility, setPhoneNumberVisibility);
  }
  if (subView === "last_seen") {
    return renderVisibilitySubView("Last seen & online", lastSeenVisibility, setLastSeenVisibility);
  }
  if (subView === "new_chat") {
    return renderVisibilitySubView("New chat", newChatVisibility, setNewChatVisibility);
  }
  if (subView === "calls") {
    return renderVisibilitySubView("Calls", callsVisibility, setCallsVisibility);
  }
  if (subView === "meetings") {
    return renderVisibilitySubView("Meetings", meetingsVisibility, setMeetingsVisibility);
  }
  if (subView === "groups") {
    return renderVisibilitySubView("Add to groups", groupsVisibility, setGroupsVisibility);
  }
  if (subView === "profile") {
    return renderVisibilitySubView("Profile photo", profilePhotoVisibility, setProfilePhotoVisibility);
  }
  if (subView === "stories") {
    return renderVisibilitySubView("Stories", storiesVisibility, setStoriesVisibility);
  }

  // ================= APP LOCK SUB-VIEW =================
  if (subView === "app_lock") {
    return (
      <div className="w-full flex flex-col h-full min-h-0 bg-[#111b21] border-r border-slate-800/80 z-10 box-border text-slate-100 select-none animate-fade-in">
        <div className="flex items-center gap-4 px-4 py-4 border-b border-slate-800/60 flex-shrink-0">
          <button onClick={() => setSubView(null)} className="p-1.5 rounded-full hover:bg-slate-800 text-slate-300 hover:text-white cursor-pointer">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-bold text-slate-100">App lock</h2>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
          <div className="flex items-center justify-between p-4 bg-[#182229] rounded-2xl border border-slate-800">
            <div>
              <span className="text-sm font-bold text-slate-100 block">Require PIN / Biometrics</span>
              <p className="text-xs text-slate-400 mt-0.5">Lock app when inactive</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={appLockEnabled}
                onChange={(e) => {
                  setAppLockEnabled(e.target.checked);
                  toast(e.target.checked ? "App lock enabled 🔒" : "App lock disabled 🔓");
                }}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#5c7cd8]"></div>
            </label>
          </div>

          {appLockEnabled && (
            <div className="p-4 bg-[#182229] rounded-2xl border border-slate-800 space-y-3">
              <span className="text-xs font-semibold text-slate-300 block">Change 4-digit PIN</span>
              <div className="flex gap-2">
                <input
                  type="password"
                  maxLength={4}
                  value={appLockPin}
                  onChange={(e) => setAppLockPin(e.target.value)}
                  className="w-32 py-2 px-3 bg-[#202c33] border border-slate-700 rounded-xl text-center text-sm font-mono tracking-widest text-white focus:outline-none focus:border-[#5c7cd8]"
                />
                <button
                  onClick={() => toast.success("PIN updated successfully! 🔑")}
                  className="px-4 py-2 bg-[#5c7cd8] hover:bg-[#4a6ac6] text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  Save PIN
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ================= BLOCKED CONTACTS SUB-VIEW =================
  if (subView === "blocked") {
    return (
      <div className="w-full flex flex-col h-full min-h-0 bg-[#111b21] border-r border-slate-800/80 z-10 box-border text-slate-100 select-none animate-fade-in">
        <div className="flex items-center gap-4 px-4 py-4 border-b border-slate-800/60 flex-shrink-0">
          <button onClick={() => setSubView(null)} className="p-1.5 rounded-full hover:bg-slate-800 text-slate-300 hover:text-white cursor-pointer">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-bold text-slate-100">Blocked contacts</h2>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3">
          {blockedList.length === 0 ? (
            <div className="text-center py-12 text-slate-400 space-y-2">
              <UserX className="w-10 h-10 mx-auto text-slate-500" />
              <p className="text-sm font-medium text-slate-300">No blocked contacts</p>
              <p className="text-xs text-slate-500">Blocked contacts will no longer be able to call you or send you messages.</p>
            </div>
          ) : (
            blockedList.map((contact) => (
              <div key={contact.id} className="flex items-center justify-between p-3.5 bg-[#182229] border border-slate-800 rounded-2xl">
                <span className="text-xs font-semibold text-slate-200">{contact.name}</span>
                <button
                  onClick={() => {
                    setBlockedList(blockedList.filter((c) => c.id !== contact.id));
                    toast.success("Contact unblocked");
                  }}
                  className="text-xs text-rose-400 hover:underline cursor-pointer"
                >
                  Unblock
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  // ================= TERMS & POLICY SUB-VIEWS =================
  if (subView === "terms" || subView === "privacy_doc") {
    const isTerms = subView === "terms";
    return (
      <div className="w-full flex flex-col h-full min-h-0 bg-[#111b21] border-r border-slate-800/80 z-10 box-border text-slate-100 select-none animate-fade-in">
        <div className="flex items-center gap-4 px-4 py-4 border-b border-slate-800/60 flex-shrink-0">
          <button onClick={() => setSubView(null)} className="p-1.5 rounded-full hover:bg-slate-800 text-slate-300 hover:text-white cursor-pointer">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-bold text-slate-100">{isTerms ? "Terms of service" : "Privacy policy"}</h2>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3 text-xs text-slate-300 leading-relaxed">
          <p>
            <strong>Aryavarta Messenger</strong> is built with end-to-end encryption by default. Your private messages, voice calls, video meetings, and media files are encrypted and cannot be accessed by any third party.
          </p>
          <p>
            We do not sell your personal data or track your communication contents. All security keys are generated on-device.
          </p>
          <div className="p-3 bg-[#182229] rounded-xl border border-slate-800 text-slate-400 text-[11px]">
            Official document version: 2026.4.1 • Verified Secure
          </div>
        </div>
      </div>
    );
  }

  // ================= MAIN SCREEN (Exact match of both screenshots 1 & 2) =================
  return (
    <div className="w-full flex flex-col h-full min-h-0 bg-[#111b21] border-r border-slate-800/80 z-10 box-border text-slate-100 select-none">
      {/* 1. Top Header: ← Security & privacy */}
      <div className="flex items-center gap-4 px-4 py-4 border-b border-slate-800/60 flex-shrink-0">
        <button
          onClick={onBack}
          className="p-1.5 rounded-full hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
          title="Back to Settings"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-bold text-slate-100">Security & privacy</h2>
      </div>

      {/* 2. Scrollable Body matching card model */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3">
        {/* ================= CARD 1: App lock ================= */}
        <div
          onClick={() => setSubView("app_lock")}
          className="p-4 bg-[#182229] hover:bg-[#202c33] border border-slate-800/80 rounded-2xl flex items-center justify-between cursor-pointer transition-colors"
        >
          <div>
            <span className="text-sm font-semibold text-slate-100 block">App lock</span>
            <span className="text-xs text-slate-400 mt-0.5 block">{appLockEnabled ? "On" : "Off"}</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500" />
        </div>

        {/* ================= CARD 2: Granular Privacy List ================= */}
        <div className="bg-[#182229] border border-slate-800/80 rounded-2xl divide-y divide-slate-800/60 overflow-hidden">
          {/* Blocked contacts */}
          <div
            onClick={() => setSubView("blocked")}
            className="p-3.5 hover:bg-[#202c33] flex items-center justify-between cursor-pointer transition-colors"
          >
            <div>
              <span className="text-sm font-semibold text-slate-100 block">Blocked contacts</span>
              <span className="text-xs text-slate-400 mt-0.5 block">
                {blockedList.length === 0 ? "Nobody" : `${blockedList.length} contacts`}
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </div>

          {/* Phone number */}
          <div
            onClick={() => setSubView("phone")}
            className="p-3.5 hover:bg-[#202c33] flex items-center justify-between cursor-pointer transition-colors"
          >
            <div>
              <span className="text-sm font-semibold text-slate-100 block">Phone number</span>
              <span className="text-xs text-slate-400 mt-0.5 block">{phoneNumberVisibility}</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </div>

          {/* Last seen & online */}
          <div
            onClick={() => setSubView("last_seen")}
            className="p-3.5 hover:bg-[#202c33] flex items-center justify-between cursor-pointer transition-colors"
          >
            <div>
              <span className="text-sm font-semibold text-slate-100 block">Last seen & online</span>
              <span className="text-xs text-slate-400 mt-0.5 block">{lastSeenVisibility}</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </div>

          {/* New chat */}
          <div
            onClick={() => setSubView("new_chat")}
            className="p-3.5 hover:bg-[#202c33] flex items-center justify-between cursor-pointer transition-colors"
          >
            <div>
              <span className="text-sm font-semibold text-slate-100 block">New chat</span>
              <span className="text-xs text-slate-400 mt-0.5 block">{newChatVisibility}</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </div>

          {/* Calls */}
          <div
            onClick={() => setSubView("calls")}
            className="p-3.5 hover:bg-[#202c33] flex items-center justify-between cursor-pointer transition-colors"
          >
            <div>
              <span className="text-sm font-semibold text-slate-100 block">Calls</span>
              <span className="text-xs text-slate-400 mt-0.5 block">{callsVisibility}</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </div>

          {/* Meetings */}
          <div
            onClick={() => setSubView("meetings")}
            className="p-3.5 hover:bg-[#202c33] flex items-center justify-between cursor-pointer transition-colors"
          >
            <div>
              <span className="text-sm font-semibold text-slate-100 block">Meetings</span>
              <span className="text-xs text-slate-400 mt-0.5 block">{meetingsVisibility}</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </div>

          {/* Add to groups */}
          <div
            onClick={() => setSubView("groups")}
            className="p-3.5 hover:bg-[#202c33] flex items-center justify-between cursor-pointer transition-colors"
          >
            <div>
              <span className="text-sm font-semibold text-slate-100 block">Add to groups</span>
              <span className="text-xs text-slate-400 mt-0.5 block">{groupsVisibility}</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </div>

          {/* Profile photo */}
          <div
            onClick={() => setSubView("profile")}
            className="p-3.5 hover:bg-[#202c33] flex items-center justify-between cursor-pointer transition-colors"
          >
            <div>
              <span className="text-sm font-semibold text-slate-100 block">Profile photo</span>
              <span className="text-xs text-slate-400 mt-0.5 block">{profilePhotoVisibility}</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </div>

          {/* Stories */}
          <div
            onClick={() => setSubView("stories")}
            className="p-3.5 hover:bg-[#202c33] flex items-center justify-between cursor-pointer transition-colors"
          >
            <div>
              <span className="text-sm font-semibold text-slate-100 block">Stories</span>
              <span className="text-xs text-slate-400 mt-0.5 block">{storiesVisibility}</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </div>
        </div>

        {/* ================= CARD 3: Read receipts ================= */}
        <div className="p-4 bg-[#182229] border border-slate-800/80 rounded-2xl flex items-start justify-between">
          <div className="pr-4">
            <span className="text-sm font-semibold text-slate-100 block">Read receipts</span>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Message sent and received will display a double tick and the message read time.
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer flex-shrink-0 mt-0.5">
            <input
              type="checkbox"
              checked={readReceipts}
              onChange={(e) => {
                setReadReceipts(e.target.checked);
                toast(e.target.checked ? "Read receipts enabled" : "Read receipts disabled");
              }}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#5c7cd8]"></div>
          </label>
        </div>

        {/* ================= CARD 4: Sync contacts ================= */}
        <div className="p-4 bg-[#182229] border border-slate-800/80 rounded-2xl flex items-start justify-between">
          <div className="pr-4">
            <span className="text-sm font-semibold text-slate-100 block">Sync contacts</span>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Once turned off, any contacts you add to the device will no longer sync with the Aryavarta server.
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer flex-shrink-0 mt-0.5">
            <input
              type="checkbox"
              checked={syncContacts}
              onChange={(e) => {
                setSyncContacts(e.target.checked);
                toast(e.target.checked ? "Contacts sync enabled" : "Contacts sync paused");
              }}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#5c7cd8]"></div>
          </label>
        </div>

        {/* ================= CARD 5: Screen security ================= */}
        <div className="p-4 bg-[#182229] border border-slate-800/80 rounded-2xl flex items-start justify-between">
          <div className="pr-4">
            <span className="text-sm font-semibold text-slate-100 block">Screen security</span>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Prevents Aryavarta content from appearing in the app switcher.
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer flex-shrink-0 mt-0.5">
            <input
              type="checkbox"
              checked={screenSecurity}
              onChange={(e) => {
                setScreenSecurity(e.target.checked);
                toast(e.target.checked ? "Screen security enabled" : "Screen security disabled");
              }}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#5c7cd8]"></div>
          </label>
        </div>

        {/* ================= CARD 6: Protect IP address in calls ================= */}
        <div className="p-4 bg-[#182229] border border-slate-800/80 rounded-2xl flex items-start justify-between">
          <div className="pr-4">
            <span className="text-sm font-semibold text-slate-100 block">Protect IP address in calls</span>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Relay all calls through the Aryavarta server to mask your IP address. Enabling this may reduce call quality.
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer flex-shrink-0 mt-0.5">
            <input
              type="checkbox"
              checked={protectIP}
              onChange={(e) => {
                setProtectIP(e.target.checked);
                toast(e.target.checked ? "IP relay protection enabled 🛡️" : "Direct P2P calls enabled");
              }}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#5c7cd8]"></div>
          </label>
        </div>

        {/* ================= CARD 7: Diagnostics ================= */}
        <div className="p-4 bg-[#182229] border border-slate-800/80 rounded-2xl space-y-2">
          <span className="text-xs font-semibold text-slate-400 block">Diagnostics</span>
          <div className="flex items-start justify-between">
            <div className="pr-4">
              <span className="text-sm font-semibold text-slate-100 block">Share diagnostic data</span>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Send debug logs, crash reports, and critical failure information to help identify and fix issues.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer flex-shrink-0 mt-0.5">
              <input
                type="checkbox"
                checked={shareDiagnostics}
                onChange={(e) => {
                  setShareDiagnostics(e.target.checked);
                  toast(e.target.checked ? "Diagnostic sharing enabled" : "Diagnostic sharing disabled");
                }}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#5c7cd8]"></div>
            </label>
          </div>
        </div>

        {/* ================= CARD 8: Terms & Privacy Policies ================= */}
        <div className="bg-[#182229] border border-slate-800/80 rounded-2xl divide-y divide-slate-800/60 overflow-hidden mb-6">
          <div
            onClick={() => setSubView("terms")}
            className="p-3.5 hover:bg-[#202c33] flex items-center justify-between cursor-pointer transition-colors"
          >
            <span className="text-sm font-semibold text-slate-100">Terms of service</span>
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </div>

          <div
            onClick={() => setSubView("privacy_doc")}
            className="p-3.5 hover:bg-[#202c33] flex items-center justify-between cursor-pointer transition-colors"
          >
            <span className="text-sm font-semibold text-slate-100">Privacy policy</span>
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacySettings;
