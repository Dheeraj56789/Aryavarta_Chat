import { useState, useEffect } from "react";
import {
  ArrowLeft,
  ChevronRight,
  Check,
  MoreVertical,
  Wrench,
  Volume2,
  VolumeX,
  Bell,
  BellOff,
  Moon,
  Play,
  RotateCcw,
  Sparkles,
  Users,
  MessageCircle,
  Radio,
  Smile,
  Briefcase,
  Layers,
  HelpCircle,
  Vibrate
} from "lucide-react";
import { useChatContext } from "../../context/ChatContext";
import { soundEffects } from "../../utils/sound";
import toast from "react-hot-toast";

const STORAGE_KEY = "aryavarta_notification_settings";

const DEFAULT_SETTINGS = {
  storeTones: true,
  direct: {
    enabled: true,
    preview: true,
    tone: "default",
    vibrate: "default"
  },
  group: {
    enabled: true,
    preview: true,
    tone: "chime",
    vibrate: "default"
  },
  channel: {
    enabled: true,
    preview: true,
    tone: "pop",
    vibrate: "short"
  },
  reactions: {
    enabled: true,
    preview: true,
    tone: "bell",
    vibrate: "default"
  },
  businessMessages: false,
  storyAlerts: {
    mode: "all", // "all" | "selected" | "none"
    selectedIds: []
  },
  storyReactions: true,
  dnd: {
    enabled: false,
    duration: "8h" // "1h" | "8h" | "24h" | "until_off"
  },
  messageTones: true
};

const TONE_OPTIONS = [
  { id: "default", name: "Aryavarta Pop", desc: "Default signature tone", toneKey: "default" },
  { id: "chime", name: "Aurora Chime", desc: "Harmonic dual chime", toneKey: "default" },
  { id: "bell", name: "Crystal Bell", desc: "High clarity crystal ping", toneKey: "bell" },
  { id: "ping", name: "Electronic Ping", desc: "Modern dynamic beep", toneKey: "ping" },
  { id: "pulse", name: "Gentle Pulse", desc: "Deep subtle notification", toneKey: "pulse" },
  { id: "silent", name: "Silent", desc: "No audible alert", toneKey: "silent" }
];

const VIBRATE_OPTIONS = [
  { id: "default", name: "Default", pattern: [200] },
  { id: "short", name: "Short", pattern: [100] },
  { id: "long", name: "Long", pattern: [500] },
  { id: "double", name: "Double pulse", pattern: [150, 100, 150] },
  { id: "off", name: "Off", pattern: [] }
];

const NotificationsSettings = ({ onBack }) => {
  const { soundEnabled, setSoundEnabled, allUsers } = useChatContext();

  // Load persisted settings
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn("Could not read notification settings:", e);
    }
    return DEFAULT_SETTINGS;
  });

  // Current active sub-view: null | "sound_vibrate" | "story_alerts" | "fix_it"
  const [activeSubView, setActiveSubView] = useState(null);
  const [soundVibrateTarget, setSoundVibrateTarget] = useState("direct"); // "direct" | "group" | "channel" | "reactions"

  // Dropdown menu state
  const [showMenu, setShowMenu] = useState(false);

  // Search filter for story alerts
  const [storySearch, setStorySearch] = useState("");

  // Sync state changes to localStorage
  const updateSettings = (updater) => {
    setSettings((prev) => {
      const updated = typeof updater === "function" ? updater(prev) : { ...prev, ...updater };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn("Failed to persist notification settings:", e);
      }
      return updated;
    });
  };

  // Keep message tones in sync with global ChatContext sound
  useEffect(() => {
    if (typeof soundEnabled === "boolean" && soundEnabled !== settings.messageTones) {
      updateSettings((prev) => ({ ...prev, messageTones: soundEnabled }));
    }
  }, [soundEnabled]);

  // Handle message tones toggle
  const handleToggleMessageTones = (val) => {
    updateSettings({ messageTones: val });
    if (setSoundEnabled) setSoundEnabled(val);
    soundEffects.enabled = val;
    toast(val ? "Message tones enabled 🔔" : "Message tones muted 🔕");
  };

  // Preview tone playback
  const previewTone = (toneKey) => {
    if (!toneKey || toneKey === "silent") return;
    soundEffects.playTone(toneKey);
  };

  // Preview vibrate
  const previewVibrate = (pattern) => {
    if (typeof navigator !== "undefined" && navigator.vibrate && pattern.length > 0) {
      navigator.vibrate(pattern);
    }
  };

  // Reset to defaults
  const handleResetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SETTINGS));
    if (setSoundEnabled) setSoundEnabled(true);
    soundEffects.enabled = true;
    setShowMenu(false);
    toast.success("Notification settings reset to default ✨");
  };

  // Send a test notification
  const handleTestNotification = () => {
    setShowMenu(false);
    soundEffects.playReceive();

    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("Aryavarta", {
        body: "Test notification: Real-time messaging alerts are working perfectly!",
        icon: "/favicon.ico"
      });
    } else if ("Notification" in window && Notification.permission !== "denied") {
      Notification.requestPermission().then((perm) => {
        if (perm === "granted") {
          new Notification("Aryavarta", {
            body: "Notifications enabled! You will receive new message alerts.",
            icon: "/favicon.ico"
          });
        }
      });
    }

    toast.success("Test notification triggered! 🔔", {
      icon: "✨",
      duration: 3000
    });
  };

  // Reusable Pill Switch Toggle matching mobile screenshot style
  const Switch = ({ checked, onChange, disabled = false }) => (
    <label className={`relative inline-flex items-center cursor-pointer flex-shrink-0 select-none ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => !disabled && onChange(e.target.checked)}
        className="sr-only peer"
      />
      <div className="w-12 h-6 bg-[#374151] peer-focus:outline-none rounded-full peer peer-checked:bg-[#6366f1] transition-colors duration-200">
        <div
          className={`absolute top-[2px] left-[2px] bg-white rounded-full h-5 w-5 transition-transform duration-200 shadow-md ${
            checked ? "translate-x-6" : "translate-x-0"
          }`}
        />
      </div>
    </label>
  );

  // Reusable Checkbox matching mobile screenshot style
  const Checkbox = ({ checked, onChange, disabled = false }) => (
    <button
      type="button"
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={`w-5 h-5 rounded flex items-center justify-center transition-colors cursor-pointer ${
        disabled
          ? "border border-slate-700 bg-slate-800 opacity-50 cursor-not-allowed"
          : checked
          ? "bg-[#6366f1] text-white"
          : "border-2 border-slate-500 hover:border-slate-400 bg-transparent"
      }`}
    >
      {checked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
    </button>
  );

  // =========================================================================
  // SUB-VIEW: Sound & Vibrate Selector
  // =========================================================================
  if (activeSubView === "sound_vibrate") {
    const targetConfig = settings[soundVibrateTarget] || {
      tone: "default",
      vibrate: "default"
    };

    const targetTitle =
      soundVibrateTarget === "direct"
        ? "Direct messages"
        : soundVibrateTarget === "group"
        ? "Group"
        : soundVibrateTarget === "channel"
        ? "Channel"
        : "Message reactions";

    return (
      <div className="w-full flex flex-col h-full min-h-0 bg-[#0c1317] border-r border-slate-800/80 z-10 box-border text-slate-100 select-none animate-fadeIn">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-slate-800/60 flex-shrink-0 bg-[#111b21]">
          <button
            onClick={() => setActiveSubView(null)}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-base font-bold text-slate-100">Sound & vibrate</h2>
            <p className="text-xs text-slate-400">{targetTitle}</p>
          </div>
        </div>

        {/* Options List */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-6">
          {/* Notification Tone */}
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-3 px-1">
              Notification tone
            </span>
            <div className="bg-[#16202a] border border-slate-800/80 rounded-2xl overflow-hidden divide-y divide-slate-800/60">
              {TONE_OPTIONS.map((item) => {
                const isSelected = targetConfig.tone === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      previewTone(item.toneKey);
                      updateSettings((prev) => ({
                        ...prev,
                        [soundVibrateTarget]: {
                          ...prev[soundVibrateTarget],
                          tone: item.id
                        }
                      }));
                    }}
                    className="flex items-center justify-between p-3.5 hover:bg-slate-800/40 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0 pr-3">
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 ${
                          isSelected
                            ? "border-[#6366f1] bg-[#6366f1]"
                            : "border-slate-500"
                        }`}
                      >
                        {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                      </div>
                      <div className="truncate">
                        <span className="text-sm font-medium text-slate-200 block truncate">
                          {item.name}
                        </span>
                        <span className="text-xs text-slate-400 block truncate">
                          {item.desc}
                        </span>
                      </div>
                    </div>

                    {item.toneKey !== "silent" && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          previewTone(item.toneKey);
                        }}
                        className="p-2 rounded-lg bg-slate-800/70 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                        title="Play preview"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Vibrate Pattern */}
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-3 px-1">
              Vibrate
            </span>
            <div className="bg-[#16202a] border border-slate-800/80 rounded-2xl overflow-hidden divide-y divide-slate-800/60">
              {VIBRATE_OPTIONS.map((item) => {
                const isSelected = targetConfig.vibrate === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      previewVibrate(item.pattern);
                      updateSettings((prev) => ({
                        ...prev,
                        [soundVibrateTarget]: {
                          ...prev[soundVibrateTarget],
                          vibrate: item.id
                        }
                      }));
                    }}
                    className="flex items-center justify-between p-3.5 hover:bg-slate-800/40 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 ${
                          isSelected
                            ? "border-[#6366f1] bg-[#6366f1]"
                            : "border-slate-500"
                        }`}
                      >
                        {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                      </div>
                      <span className="text-sm font-medium text-slate-200">
                        {item.name}
                      </span>
                    </div>

                    <Vibrate className="w-4 h-4 text-slate-500" />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // SUB-VIEW: Fix It / Troubleshooting Diagnostics
  // =========================================================================
  if (activeSubView === "fix_it") {
    const permissionStatus =
      typeof window !== "undefined" && "Notification" in window
        ? Notification.permission
        : "unsupported";

    const requestPermission = async () => {
      if ("Notification" in window) {
        const res = await Notification.requestPermission();
        if (res === "granted") {
          toast.success("Notification permission granted! 🚀");
          new Notification("Aryavarta", {
            body: "Notifications are now fully enabled!"
          });
        } else {
          toast.error("Notification permission was denied in browser settings");
        }
      } else {
        toast.error("Notifications not supported on this browser");
      }
    };

    return (
      <div className="w-full flex flex-col h-full min-h-0 bg-[#0c1317] border-r border-slate-800/80 z-10 box-border text-slate-100 select-none animate-fadeIn">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-slate-800/60 flex-shrink-0 bg-[#111b21]">
          <button
            onClick={() => setActiveSubView(null)}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-base font-bold text-slate-100">Fix Notifications</h2>
            <p className="text-xs text-slate-400">Diagnostic & Resolution Assistant</p>
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
          {/* Status Diagnostic Card */}
          <div className="bg-[#16202a] border border-slate-800/80 rounded-2xl p-4 space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Wrench className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">System Permission Status</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Check if your device/browser allows alerts from Aryavarta
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-xs text-slate-300">Browser Permission</span>
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded-full uppercase ${
                  permissionStatus === "granted"
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : permissionStatus === "denied"
                    ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                    : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                }`}
              >
                {permissionStatus}
              </span>
            </div>

            {permissionStatus !== "granted" && (
              <button
                onClick={requestPermission}
                className="w-full py-2.5 px-4 rounded-xl bg-[#6366f1] hover:bg-[#5254cf] text-white font-medium text-xs transition-colors flex items-center justify-center gap-2"
              >
                <Bell className="w-4 h-4" />
                Request Notification Permission
              </button>
            )}

            <button
              onClick={handleTestNotification}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs transition-colors flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-indigo-400" />
              Send Test Alert Tone & Notification
            </button>
          </div>

          {/* Quick Troubleshooting Checklist */}
          <div className="bg-[#16202a] border border-slate-800/80 rounded-2xl p-4 space-y-3">
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Common Solutions
            </h4>

            <div className="space-y-2 text-xs text-slate-400">
              <div className="flex items-start gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 flex-shrink-0" />
                <p>
                  <strong className="text-slate-200">Device Battery Saver:</strong> Some mobile systems kill background connections when power saving is active.
                </p>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 flex-shrink-0" />
                <p>
                  <strong className="text-slate-200">Site Permissions:</strong> Tap the lock or tune icon in your browser URL bar and ensure "Notifications" & "Sound" are set to Allow.
                </p>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 flex-shrink-0" />
                <p>
                  <strong className="text-slate-200">Do Not Disturb:</strong> Check that Do Not Disturb is not currently toggled on below.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // SUB-VIEW: Manage Story Alerts
  // =========================================================================
  if (activeSubView === "story_alerts") {
    const contacts = Array.isArray(allUsers) ? allUsers : [];
    const filteredContacts = contacts.filter((u) => {
      const name = u.fullname || u.username || "";
      return name.toLowerCase().includes(storySearch.toLowerCase());
    });

    const isAll = settings.storyAlerts.mode === "all";
    const isNone = settings.storyAlerts.mode === "none";

    return (
      <div className="w-full flex flex-col h-full min-h-0 bg-[#0c1317] border-r border-slate-800/80 z-10 box-border text-slate-100 select-none animate-fadeIn">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-slate-800/60 flex-shrink-0 bg-[#111b21]">
          <button
            onClick={() => setActiveSubView(null)}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-base font-bold text-slate-100">Manage story alerts</h2>
            <p className="text-xs text-slate-400">Receive alerts when contacts share stories</p>
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
          {/* Mode Selector */}
          <div className="bg-[#16202a] border border-slate-800/80 rounded-2xl p-2 space-y-1">
            {[
              { id: "all", label: "All contacts", desc: "Notify when any contact adds a story" },
              { id: "selected", label: "Selected contacts", desc: "Only notify for chosen people" },
              { id: "none", label: "Mute all story alerts", desc: "Do not send any story alerts" }
            ].map((m) => {
              const active = settings.storyAlerts.mode === m.id;
              return (
                <div
                  key={m.id}
                  onClick={() => {
                    updateSettings((prev) => ({
                      ...prev,
                      storyAlerts: { ...prev.storyAlerts, mode: m.id }
                    }));
                  }}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-800/40 cursor-pointer transition-colors"
                >
                  <div>
                    <span className="text-sm font-medium text-slate-200 block">{m.label}</span>
                    <span className="text-xs text-slate-400 block">{m.desc}</span>
                  </div>
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      active ? "border-[#6366f1] bg-[#6366f1]" : "border-slate-500"
                    }`}
                  >
                    {active && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Contact Picker if Selected Contacts Mode */}
          {settings.storyAlerts.mode === "selected" && (
            <div className="bg-[#16202a] border border-slate-800/80 rounded-2xl p-4 space-y-3">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                Choose Contacts ({settings.storyAlerts.selectedIds.length} selected)
              </span>

              <input
                type="text"
                placeholder="Search contacts..."
                value={storySearch}
                onChange={(e) => setStorySearch(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-900/80 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />

              <div className="max-h-60 overflow-y-auto space-y-1 divide-y divide-slate-800/50">
                {filteredContacts.length === 0 ? (
                  <p className="text-xs text-slate-500 py-3 text-center">No contacts found</p>
                ) : (
                  filteredContacts.map((user) => {
                    const isChecked = settings.storyAlerts.selectedIds.includes(user._id);
                    return (
                      <div
                        key={user._id}
                        onClick={() => {
                          updateSettings((prev) => {
                            const list = prev.storyAlerts.selectedIds || [];
                            const nextList = isChecked
                              ? list.filter((id) => id !== user._id)
                              : [...list, user._id];
                            return {
                              ...prev,
                              storyAlerts: { ...prev.storyAlerts, selectedIds: nextList }
                            };
                          });
                        }}
                        className="flex items-center justify-between py-2.5 px-2 hover:bg-slate-800/40 rounded-lg cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={user.profilePic || "/default-avatar.png"}
                            alt=""
                            className="w-7 h-7 rounded-full object-cover bg-slate-800"
                            onError={(e) => {
                              e.target.src =
                                "https://api.dicebear.com/7.x/bottts/svg?seed=" + (user.username || "User");
                            }}
                          />
                          <span className="text-xs font-medium text-slate-200">
                            {user.fullname || user.username}
                          </span>
                        </div>
                        <Checkbox checked={isChecked} onChange={() => {}} />
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // =========================================================================
  // MAIN NOTIFICATIONS VIEW (Matching exact user screenshots)
  // =========================================================================
  return (
    <div className="w-full flex flex-col h-full min-h-0 bg-[#0c1317] border-r border-slate-800/80 z-10 box-border text-slate-100 select-none">
      {/* 1. App Bar / Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-slate-800/60 flex-shrink-0 bg-[#111b21] relative">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-bold text-slate-100">Notifications</h2>
        </div>

        {/* 3-dots Menu Button */}
        <div className="relative">
          <button
            onClick={() => setShowMenu((prev) => !prev)}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <MoreVertical className="w-5 h-5" />
          </button>

          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-20"
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 top-10 w-56 bg-[#1f2937] border border-slate-700/80 rounded-2xl shadow-2xl py-2 z-30 animate-fadeIn text-xs">
                <button
                  onClick={handleTestNotification}
                  className="w-full px-4 py-2.5 text-left text-slate-200 hover:bg-slate-700/60 flex items-center gap-2.5 transition-colors"
                >
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  Send test notification
                </button>
                <button
                  onClick={() => {
                    setShowMenu(false);
                    setActiveSubView("fix_it");
                  }}
                  className="w-full px-4 py-2.5 text-left text-slate-200 hover:bg-slate-700/60 flex items-center gap-2.5 transition-colors"
                >
                  <Wrench className="w-4 h-4 text-indigo-400" />
                  Fix notification issues
                </button>
                <div className="my-1 border-t border-slate-700/60" />
                <button
                  onClick={handleResetSettings}
                  className="w-full px-4 py-2.5 text-left text-rose-400 hover:bg-rose-500/10 flex items-center gap-2.5 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset notification settings
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 2. Scrollable Body */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3.5 scrollbar-thin scrollbar-thumb-slate-800">
        {/* Banner: "Not receiving notification ? Fix it >" */}
        <div
          onClick={() => setActiveSubView("fix_it")}
          className="bg-[#1a222d] border border-slate-800/80 hover:border-slate-700 rounded-2xl p-4 flex items-center justify-between cursor-pointer transition-all shadow-sm group"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 group-hover:text-indigo-400 transition-colors">
              <Wrench className="w-4 h-4" />
            </div>
            <span className="text-sm font-medium text-slate-100">
              Not receiving notification ?
            </span>
          </div>

          <div className="flex items-center gap-1 text-sm font-semibold text-[#818cf8] group-hover:text-indigo-300 transition-colors">
            <span>Fix it</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>

        {/* Card 1: Store notification tones */}
        <div className="bg-[#1a222d] border border-slate-800/80 rounded-2xl p-4 flex items-center justify-between gap-4">
          <div className="pr-2">
            <h3 className="text-sm font-semibold text-slate-100">
              Store notification tones
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Aryavarta tones will be saved to your device, allowing you to set custom notification sounds for different alerts.
            </p>
          </div>
          <Switch
            checked={settings.storeTones}
            onChange={(val) => {
              updateSettings({ storeTones: val });
              toast(val ? "Custom tones active 🎵" : "Default tones active");
            }}
          />
        </div>

        {/* Card 2: Direct messages (Grouped Box matching screenshot 1) */}
        <div className="bg-[#1a222d] border border-slate-800/80 rounded-2xl overflow-hidden divide-y divide-slate-800/60">
          {/* Main Direct Messages Toggle */}
          <div className="p-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-100">
              Direct messages
            </h3>
            <Switch
              checked={settings.direct.enabled}
              onChange={(val) =>
                updateSettings((prev) => ({
                  ...prev,
                  direct: { ...prev.direct, enabled: val }
                }))
              }
            />
          </div>

          {/* Sub-items (Message preview & Sound & vibrate) */}
          <div className={`divide-y divide-slate-800/60 ${!settings.direct.enabled ? "opacity-40" : ""}`}>
            {/* Message preview checkbox */}
            <div className="p-4 flex items-center justify-between">
              <span className="text-sm font-normal text-slate-200">
                Message preview
              </span>
              <Checkbox
                checked={settings.direct.preview}
                disabled={!settings.direct.enabled}
                onChange={(val) =>
                  updateSettings((prev) => ({
                    ...prev,
                    direct: { ...prev.direct, preview: val }
                  }))
                }
              />
            </div>

            {/* Sound & vibrate clickable row */}
            <div
              onClick={() => {
                if (settings.direct.enabled) {
                  setSoundVibrateTarget("direct");
                  setActiveSubView("sound_vibrate");
                }
              }}
              className={`p-4 flex items-center justify-between ${
                settings.direct.enabled
                  ? "hover:bg-slate-800/40 cursor-pointer transition-colors"
                  : "cursor-not-allowed"
              }`}
            >
              <span className="text-sm font-normal text-slate-200">
                Sound & vibrate
              </span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>
          </div>
        </div>

        {/* Card 3: Group (Grouped Box matching screenshot 1) */}
        <div className="bg-[#1a222d] border border-slate-800/80 rounded-2xl overflow-hidden divide-y divide-slate-800/60">
          <div className="p-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-100">
              Group
            </h3>
            <Switch
              checked={settings.group.enabled}
              onChange={(val) =>
                updateSettings((prev) => ({
                  ...prev,
                  group: { ...prev.group, enabled: val }
                }))
              }
            />
          </div>

          <div className={`divide-y divide-slate-800/60 ${!settings.group.enabled ? "opacity-40" : ""}`}>
            <div className="p-4 flex items-center justify-between">
              <span className="text-sm font-normal text-slate-200">
                Message preview
              </span>
              <Checkbox
                checked={settings.group.preview}
                disabled={!settings.group.enabled}
                onChange={(val) =>
                  updateSettings((prev) => ({
                    ...prev,
                    group: { ...prev.group, preview: val }
                  }))
                }
              />
            </div>

            <div
              onClick={() => {
                if (settings.group.enabled) {
                  setSoundVibrateTarget("group");
                  setActiveSubView("sound_vibrate");
                }
              }}
              className={`p-4 flex items-center justify-between ${
                settings.group.enabled
                  ? "hover:bg-slate-800/40 cursor-pointer transition-colors"
                  : "cursor-not-allowed"
              }`}
            >
              <span className="text-sm font-normal text-slate-200">
                Sound & vibrate
              </span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>
          </div>
        </div>

        {/* Card 4: Channel (Grouped Box matching screenshot 1) */}
        <div className="bg-[#1a222d] border border-slate-800/80 rounded-2xl overflow-hidden divide-y divide-slate-800/60">
          <div className="p-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-100">
              Channel
            </h3>
            <Switch
              checked={settings.channel.enabled}
              onChange={(val) =>
                updateSettings((prev) => ({
                  ...prev,
                  channel: { ...prev.channel, enabled: val }
                }))
              }
            />
          </div>

          <div className={`divide-y divide-slate-800/60 ${!settings.channel.enabled ? "opacity-40" : ""}`}>
            <div className="p-4 flex items-center justify-between">
              <span className="text-sm font-normal text-slate-200">
                Message preview
              </span>
              <Checkbox
                checked={settings.channel.preview}
                disabled={!settings.channel.enabled}
                onChange={(val) =>
                  updateSettings((prev) => ({
                    ...prev,
                    channel: { ...prev.channel, preview: val }
                  }))
                }
              />
            </div>

            <div
              onClick={() => {
                if (settings.channel.enabled) {
                  setSoundVibrateTarget("channel");
                  setActiveSubView("sound_vibrate");
                }
              }}
              className={`p-4 flex items-center justify-between ${
                settings.channel.enabled
                  ? "hover:bg-slate-800/40 cursor-pointer transition-colors"
                  : "cursor-not-allowed"
              }`}
            >
              <span className="text-sm font-normal text-slate-200">
                Sound & vibrate
              </span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>
          </div>
        </div>

        {/* Card 5: Message reactions (Grouped Box matching screenshot 2) */}
        <div className="bg-[#1a222d] border border-slate-800/80 rounded-2xl overflow-hidden divide-y divide-slate-800/60">
          <div className="p-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-100">
              Message reactions
            </h3>
            <Switch
              checked={settings.reactions.enabled}
              onChange={(val) =>
                updateSettings((prev) => ({
                  ...prev,
                  reactions: { ...prev.reactions, enabled: val }
                }))
              }
            />
          </div>

          <div className={`divide-y divide-slate-800/60 ${!settings.reactions.enabled ? "opacity-40" : ""}`}>
            <div className="p-4 flex items-center justify-between">
              <span className="text-sm font-normal text-slate-200">
                Message preview
              </span>
              <Checkbox
                checked={settings.reactions.preview}
                disabled={!settings.reactions.enabled}
                onChange={(val) =>
                  updateSettings((prev) => ({
                    ...prev,
                    reactions: { ...prev.reactions, preview: val }
                  }))
                }
              />
            </div>

            <div
              onClick={() => {
                if (settings.reactions.enabled) {
                  setSoundVibrateTarget("reactions");
                  setActiveSubView("sound_vibrate");
                }
              }}
              className={`p-4 flex items-center justify-between ${
                settings.reactions.enabled
                  ? "hover:bg-slate-800/40 cursor-pointer transition-colors"
                  : "cursor-not-allowed"
              }`}
            >
              <span className="text-sm font-normal text-slate-200">
                Sound & vibrate
              </span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>
          </div>
        </div>

        {/* Card 6: Business messages (matching screenshot 2) */}
        <div className="bg-[#1a222d] border border-slate-800/80 rounded-2xl p-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-100">
            Business messages
          </h3>
          <Switch
            checked={settings.businessMessages}
            onChange={(val) => updateSettings({ businessMessages: val })}
          />
        </div>

        {/* Card 7: Manage story alerts (matching screenshot 2) */}
        <div
          onClick={() => setActiveSubView("story_alerts")}
          className="bg-[#1a222d] border border-slate-800/80 hover:border-slate-700 rounded-2xl p-4 flex items-center justify-between cursor-pointer transition-colors"
        >
          <div className="pr-4">
            <h3 className="text-sm font-semibold text-slate-100">
              Manage story alerts
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Select contacts to receive notifications when they share stories.
            </p>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400 flex-shrink-0" />
        </div>

        {/* Card 8: Story reaction notification (matching screenshot 2) */}
        <div className="bg-[#1a222d] border border-slate-800/80 rounded-2xl p-4 flex items-center justify-between gap-4">
          <div className="pr-2">
            <h3 className="text-sm font-semibold text-slate-100">
              Story reaction notification
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Get notified when someone reacts to your story.
            </p>
          </div>
          <Switch
            checked={settings.storyReactions}
            onChange={(val) => updateSettings({ storyReactions: val })}
          />
        </div>

        {/* Card 9: Do not disturb (matching screenshot 2) */}
        <div className="bg-[#1a222d] border border-slate-800/80 rounded-2xl p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="pr-2">
              <h3 className="text-sm font-semibold text-slate-100">
                Do not disturb
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Turn off notifications for a period of time.
              </p>
            </div>
            <Switch
              checked={settings.dnd.enabled}
              onChange={(val) => {
                updateSettings((prev) => ({
                  ...prev,
                  dnd: { ...prev.dnd, enabled: val }
                }));
                toast(val ? "Do Not Disturb enabled 🌙" : "Do Not Disturb disabled ☀️");
              }}
            />
          </div>

          {/* DND Duration Options when enabled */}
          {settings.dnd.enabled && (
            <div className="mt-3 pt-3 border-t border-slate-800/60 flex items-center gap-2 flex-wrap animate-fadeIn">
              <span className="text-[11px] text-slate-400 font-medium mr-1">Duration:</span>
              {[
                { id: "1h", label: "1 hour" },
                { id: "8h", label: "8 hours" },
                { id: "24h", label: "24 hours" },
                { id: "until_off", label: "Until turned off" }
              ].map((d) => {
                const active = settings.dnd.duration === d.id;
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() =>
                      updateSettings((prev) => ({
                        ...prev,
                        dnd: { ...prev.dnd, duration: d.id }
                      }))
                    }
                    className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors ${
                      active
                        ? "bg-[#6366f1] text-white"
                        : "bg-slate-800 hover:bg-slate-700 text-slate-300"
                    }`}
                  >
                    {d.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Card 10: Message tones (matching screenshot 2) */}
        <div className="bg-[#1a222d] border border-slate-800/80 rounded-2xl p-4 flex items-center justify-between gap-4">
          <div className="pr-2">
            <h3 className="text-sm font-semibold text-slate-100">
              Message tones
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Hear sounds when you send and receive messages while the chat window is open.
            </p>
          </div>
          <Switch
            checked={settings.messageTones}
            onChange={handleToggleMessageTones}
          />
        </div>
      </div>
    </div>
  );
};

export default NotificationsSettings;
