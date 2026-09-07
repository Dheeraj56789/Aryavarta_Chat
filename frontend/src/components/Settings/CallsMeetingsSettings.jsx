import { useState } from "react";
import {
  ArrowLeft,
  ChevronRight,
  Play,
  Volume2,
  Check,
  Video,
  Mic,
  Shield,
  Disc,
  LogOut,
  Bell
} from "lucide-react";
import { soundEffects } from "../../utils/sound";
import toast from "react-hot-toast";

const STORAGE_KEY = "aryavarta_calls_meetings_settings";

const CALLER_TUNES = [
  { id: "ringing", name: "Ringing", desc: "Default ringing cadence", tone: "ringing" },
  { id: "harmony", name: "Aryavarta Harmony", desc: "Warm acoustic arpeggio", tone: "harmony" },
  { id: "flute", name: "Zen Flute", desc: "Serene meditative flute", tone: "flute" },
  { id: "guitar", name: "Guitar Breeze", desc: "Gentle acoustic guitar pluck", tone: "guitar" },
  { id: "cosmic", name: "Cosmic Pulse", desc: "Ambient synthwave groove", tone: "cosmic" }
];

const NOTIFICATION_DURING_MEETING_OPTIONS = [
  { id: "none", label: "None", desc: "No notifications will interrupt your meeting" },
  { id: "silent", label: "Silent banner alerts", desc: "Show silent notification banners on top" },
  { id: "audio_muted", label: "Mute audio alerts", desc: "Play only haptic vibration if enabled" }
];

const DEFAULT_SETTINGS = {
  callerTune: "ringing",
  meetingNotification: "none",
  meetingVideo: true,
  meetingAudio: true,
  alwaysShowControls: false,
  recordings: false,
  confirmLeave: true
};

const CallsMeetingsSettings = ({ onBack }) => {
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    } catch (e) {
      console.warn("Failed to load calls & meetings settings:", e);
    }
    return DEFAULT_SETTINGS;
  });

  // Sub-view: null | "caller_tunes" | "meeting_notifications"
  const [activeSubView, setActiveSubView] = useState(null);

  const updateSettings = (patch) => {
    setSettings((prev) => {
      const updated = { ...prev, ...patch };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn("Failed to save calls & meetings settings:", e);
      }
      return updated;
    });
  };

  // Switch component matching mobile screenshot style
  const Switch = ({ checked, onChange }) => (
    <label className="relative inline-flex items-center cursor-pointer flex-shrink-0 select-none">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
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

  // Sub-view: Caller Tunes Picker
  if (activeSubView === "caller_tunes") {
    return (
      <div className="w-full flex flex-col h-full min-h-0 bg-[#0c1317] border-r border-slate-800/80 z-10 box-border text-slate-100 select-none animate-fadeIn">
        <div className="flex items-center gap-3 px-4 py-4 border-b border-slate-800/60 flex-shrink-0 bg-[#111b21]">
          <button
            onClick={() => setActiveSubView(null)}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-base font-bold text-slate-100">Caller Tunes</h2>
            <p className="text-xs text-slate-400">Select what callers hear when calling you</p>
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3">
          <div className="bg-[#16202a] border border-slate-800/80 rounded-2xl overflow-hidden divide-y divide-slate-800/60">
            {CALLER_TUNES.map((item) => {
              const isSelected = settings.callerTune === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    soundEffects.playCallerTune(item.tone);
                    updateSettings({ callerTune: item.id });
                  }}
                  className="flex items-center justify-between p-4 hover:bg-slate-800/40 cursor-pointer transition-colors"
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

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      soundEffects.playCallerTune(item.tone);
                    }}
                    className="p-2 rounded-xl bg-slate-800/70 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors flex-shrink-0"
                    title="Play preview"
                  >
                    <Play className="w-4 h-4 fill-current" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Sub-view: Notification During Meeting Picker
  if (activeSubView === "meeting_notifications") {
    return (
      <div className="w-full flex flex-col h-full min-h-0 bg-[#0c1317] border-r border-slate-800/80 z-10 box-border text-slate-100 select-none animate-fadeIn">
        <div className="flex items-center gap-3 px-4 py-4 border-b border-slate-800/60 flex-shrink-0 bg-[#111b21]">
          <button
            onClick={() => setActiveSubView(null)}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-base font-bold text-slate-100">Meeting Notifications</h2>
            <p className="text-xs text-slate-400">Choose behavior while on calls or meetings</p>
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3">
          <div className="bg-[#16202a] border border-slate-800/80 rounded-2xl overflow-hidden divide-y divide-slate-800/60">
            {NOTIFICATION_DURING_MEETING_OPTIONS.map((item) => {
              const isSelected = settings.meetingNotification === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    updateSettings({ meetingNotification: item.id });
                    setActiveSubView(null);
                  }}
                  className="flex items-center justify-between p-4 hover:bg-slate-800/40 cursor-pointer transition-colors"
                >
                  <div className="min-w-0 pr-3">
                    <span className="text-sm font-medium text-slate-200 block">
                      {item.label}
                    </span>
                    <span className="text-xs text-slate-400 block mt-0.5">
                      {item.desc}
                    </span>
                  </div>
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 ${
                      isSelected
                        ? "border-[#6366f1] bg-[#6366f1]"
                        : "border-slate-500"
                    }`}
                  >
                    {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  const currentCallerTune =
    CALLER_TUNES.find((t) => t.id === settings.callerTune)?.name || "Ringing";

  const currentMeetingNotification =
    NOTIFICATION_DURING_MEETING_OPTIONS.find(
      (o) => o.id === settings.meetingNotification
    )?.label || "None";

  // Main Calls & Meetings View (matching Screenshot 2)
  return (
    <div className="w-full flex flex-col h-full min-h-0 bg-[#0c1317] border-r border-slate-800/80 z-10 box-border text-slate-100 select-none">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-slate-800/60 flex-shrink-0 bg-[#111b21]">
        <button
          onClick={onBack}
          className="p-1.5 rounded-full hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-bold text-slate-100">Calls & Meetings</h2>
      </div>

      {/* Body */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
        {/* Caller Tunes Card */}
        <div>
          <div
            onClick={() => setActiveSubView("caller_tunes")}
            className="bg-[#1a222d] border border-slate-800/80 hover:border-slate-700 rounded-2xl p-4 flex items-center justify-between cursor-pointer transition-colors shadow-sm"
          >
            <div>
              <h3 className="text-sm font-semibold text-slate-100">Caller Tunes</h3>
              <p className="text-xs text-[#818cf8] font-medium mt-0.5">
                {currentCallerTune}
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400" />
          </div>
          <p className="text-xs text-slate-400 mt-2 px-1 leading-relaxed">
            Other users will hear this tune when they call you in Aryavarta
          </p>
        </div>

        {/* Meetings Grouped Box (Matching Screenshot 2) */}
        <div className="bg-[#1a222d] border border-slate-800/80 rounded-2xl overflow-hidden divide-y divide-slate-800/60 shadow-sm">
          {/* Section Header */}
          <div className="px-4 pt-4 pb-2">
            <span className="text-sm font-bold text-slate-100">Meetings</span>
          </div>

          {/* 1. Notification during meeting */}
          <div
            onClick={() => setActiveSubView("meeting_notifications")}
            className="p-4 flex items-center justify-between hover:bg-slate-800/40 cursor-pointer transition-colors"
          >
            <div>
              <h4 className="text-sm font-normal text-slate-100">
                Notification during meeting
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                {currentMeetingNotification}
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </div>

          {/* 2. Meeting video */}
          <div className="p-4 flex items-center justify-between gap-4">
            <div className="pr-2">
              <h4 className="text-sm font-normal text-slate-100">Meeting video</h4>
              <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                Start or join meeting with video turned on.
              </p>
            </div>
            <Switch
              checked={settings.meetingVideo}
              onChange={(val) => updateSettings({ meetingVideo: val })}
            />
          </div>

          {/* 3. Meeting audio */}
          <div className="p-4 flex items-center justify-between gap-4">
            <div className="pr-2">
              <h4 className="text-sm font-normal text-slate-100">Meeting audio</h4>
              <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                Start or join meeting with audio turned on.
              </p>
            </div>
            <Switch
              checked={settings.meetingAudio}
              onChange={(val) => updateSettings({ meetingAudio: val })}
            />
          </div>

          {/* 4. Always show meeting controls */}
          <div className="p-4 flex items-center justify-between gap-4">
            <div className="pr-2">
              <h4 className="text-sm font-normal text-slate-100">
                Always show meeting controls
              </h4>
              <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                Show meeting controls even during screen inactivity.
              </p>
            </div>
            <Switch
              checked={settings.alwaysShowControls}
              onChange={(val) => updateSettings({ alwaysShowControls: val })}
            />
          </div>

          {/* 5. Recordings */}
          <div className="p-4 flex items-center justify-between gap-4">
            <div className="pr-2">
              <h4 className="text-sm font-normal text-slate-100">Recordings</h4>
              <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                Record meetings you host.
              </p>
            </div>
            <Switch
              checked={settings.recordings}
              onChange={(val) => updateSettings({ recordings: val })}
            />
          </div>

          {/* 6. Confirmation to leave */}
          <div className="p-4 flex items-center justify-between gap-4">
            <div className="pr-2">
              <h4 className="text-sm font-normal text-slate-100">
                Confirmation to leave
              </h4>
              <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                Ask me to confirm when I leave a meeting.
              </p>
            </div>
            <Switch
              checked={settings.confirmLeave}
              onChange={(val) => updateSettings({ confirmLeave: val })}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CallsMeetingsSettings;
