import { useState } from "react";
import {
  Video,
  ArrowRight,
  Calendar,
  Search,
  MoreVertical,
  Plus,
  Copy,
  Clock,
  Trash2,
  X,
  Sparkles,
  Users
} from "lucide-react";
import VideoMeetingRoomModal from "./VideoMeetingRoomModal";
import toast from "react-hot-toast";

const MeetingsView = () => {
  const [activeTab, setActiveTab] = useState("upcoming"); // "upcoming" | "previous"
  const [meetings, setMeetings] = useState([
    {
      id: "meet-1",
      title: "Aryavarta Tech Sync & Design Review",
      code: "ary-meet-492",
      date: "Tomorrow, 10:30 AM",
      duration: "45 mins",
      host: "Dheeraj Singh"
    }
  ]);

  // Modals state
  const [activeMeetingRoom, setActiveMeetingRoom] = useState(null); // { title, code }
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  // Form states
  const [joinCode, setJoinCode] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");

  const handleStartMeetNow = () => {
    const randomCode = `ary-meet-${Math.floor(100 + Math.random() * 900)}`;
    setActiveMeetingRoom({
      title: "Instant Video Meeting",
      code: randomCode
    });
    toast.success("Instant video meeting started! 🟢");
  };

  const handleJoinMeeting = (e) => {
    e.preventDefault();
    if (!joinCode.trim()) {
      toast.error("Please enter a meeting code or link");
      return;
    }
    setShowJoinModal(false);
    setActiveMeetingRoom({
      title: `Meeting (${joinCode.trim()})`,
      code: joinCode.trim()
    });
    toast.success(`Joined room: ${joinCode.trim()} 🚀`);
  };

  const handleScheduleSubmit = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newMeeting = {
      id: `meet-${Date.now()}`,
      title: newTitle.trim(),
      code: `ary-meet-${Math.floor(100 + Math.random() * 900)}`,
      date: `${newDate || "Today"}, ${newTime || "3:00 PM"}`,
      duration: "30 mins",
      host: "You"
    };

    setMeetings((prev) => [newMeeting, ...prev]);
    setShowScheduleModal(false);
    setNewTitle("");
    toast.success("Meeting scheduled successfully! 📅");
  };

  return (
    <div className="flex-1 flex flex-col h-full min-h-0 bg-[#000000] text-white select-none overflow-hidden relative box-border">
      {/* 1. Header matching screenshot */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-900 bg-black/80 flex-shrink-0 z-10">
        <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">Meetings</h1>
        <div className="flex items-center gap-1">
          <button
            onClick={() => toast("Search meetings 🔍")}
            className="p-2 rounded-full hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
            title="Search"
          >
            <Search className="w-5 h-5" />
          </button>
          <button
            onClick={() => toast("Meeting options menu")}
            className="p-2 rounded-full hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
            title="Menu"
          >
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 2. Main Scrollable Container */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 md:p-6 flex flex-col items-center">
        {/* Top 3 Action Buttons (Color-Coded Squircles matching screenshot 1:1) */}
        <div className="flex items-center justify-center gap-8 md:gap-14 my-6 w-full max-w-md">
          {/* 1. Meet now (Green 🟢) */}
          <div className="flex flex-col items-center group cursor-pointer" onClick={handleStartMeetNow}>
            <button
              type="button"
              className="w-16 h-16 rounded-3xl bg-[#00a884] hover:bg-[#02906f] flex items-center justify-center text-white shadow-xl shadow-[#00a884]/20 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Video className="w-7 h-7" />
            </button>
            <span className="text-xs font-semibold text-slate-200 mt-2.5 group-hover:text-white transition-colors">
              Meet now
            </span>
          </div>

          {/* 2. Join (Orange 🟠) */}
          <div className="flex flex-col items-center group cursor-pointer" onClick={() => setShowJoinModal(true)}>
            <button
              type="button"
              className="w-16 h-16 rounded-3xl bg-[#ff9900] hover:bg-[#e68a00] flex items-center justify-center text-white shadow-xl shadow-[#ff9900]/20 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <ArrowRight className="w-7 h-7" />
            </button>
            <span className="text-xs font-semibold text-slate-200 mt-2.5 group-hover:text-white transition-colors">
              Join
            </span>
          </div>

          {/* 3. Schedule (Blue 🔵) */}
          <div className="flex flex-col items-center group cursor-pointer" onClick={() => setShowScheduleModal(true)}>
            <button
              type="button"
              className="w-16 h-16 rounded-3xl bg-[#3b82f6] hover:bg-[#2563eb] flex items-center justify-center text-white shadow-xl shadow-[#3b82f6]/20 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Calendar className="w-7 h-7" />
            </button>
            <span className="text-xs font-semibold text-slate-200 mt-2.5 group-hover:text-white transition-colors">
              Schedule
            </span>
          </div>
        </div>

        {/* Tab Selector Pill Bar matching screenshot */}
        <div className="w-full max-w-md bg-[#161c24] p-1 rounded-full flex items-center my-4 border border-slate-800">
          <button
            onClick={() => setActiveTab("upcoming")}
            className={`flex-1 py-2.5 rounded-full text-xs font-bold transition-all ${
              activeTab === "upcoming"
                ? "bg-[#25396e] text-white shadow"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setActiveTab("previous")}
            className={`flex-1 py-2.5 rounded-full text-xs font-bold transition-all ${
              activeTab === "previous"
                ? "bg-[#25396e] text-white shadow"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Previous
          </button>
        </div>

        {/* Content Section (List or Mascot Empty State) */}
        {activeTab === "upcoming" && meetings.length > 0 ? (
          <div className="w-full max-w-md space-y-3 mt-4">
            {meetings.map((m) => (
              <div
                key={m.id}
                className="p-4 rounded-3xl bg-[#111822] border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col gap-3 shadow-lg"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white">{m.title}</h3>
                    <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
                      <Clock className="w-3.5 h-3.5 text-blue-400" />
                      <span>{m.date} ({m.duration})</span>
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Code: <span className="font-mono text-slate-300 font-bold">{m.code}</span>
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setMeetings(meetings.filter((item) => item.id !== m.id));
                      toast.success("Meeting removed");
                    }}
                    className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-800/60">
                  <button
                    onClick={() =>
                      setActiveMeetingRoom({
                        title: m.title,
                        code: m.code
                      })
                    }
                    className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white flex items-center justify-center gap-2 shadow"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Start Meeting</span>
                  </button>

                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`https://aryavarta.app/meet/${m.code}`);
                      toast.success("Link copied! 🔗");
                    }}
                    className="px-3 py-2 rounded-xl bg-[#202c33] hover:bg-[#2a3942] text-xs font-semibold text-slate-300 hover:text-white"
                    title="Copy Link"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Cute Mascot Illustration Empty State matching screenshot 1:1 */
          <div className="flex flex-col items-center justify-center text-center my-10 animate-fade-in max-w-sm">
            {/* SVG Mascot Character checking calendar with coffee cup matching screenshot */}
            <div className="w-44 h-44 relative flex items-center justify-center mb-4">
              <svg viewBox="0 0 200 200" className="w-full h-full">
                {/* Calendar Board on Wall */}
                <rect x="35" y="30" width="70" height="75" rx="6" fill="#2d3748" />
                <rect x="40" y="42" width="60" height="58" rx="4" fill="#1a202c" />
                {/* Rings */}
                <circle cx="48" cy="30" r="3" fill="#cbd5e0" />
                <circle cx="60" cy="30" r="3" fill="#cbd5e0" />
                <circle cx="72" cy="30" r="3" fill="#cbd5e0" />
                <circle cx="84" cy="30" r="3" fill="#cbd5e0" />
                {/* Highlight Circle on Date */}
                <circle cx="68" cy="62" r="10" stroke="#f56565" strokeWidth="2.5" fill="none" strokeDasharray="3,2" />

                {/* Yellow Cute Mascot Character */}
                {/* Hair */}
                <path d="M125,75 Q135,62 145,70 Q155,62 160,75 Z" fill="#2b6cb0" />
                {/* Body */}
                <path
                  d="M115,100 C115,75 165,75 165,100 L165,160 C165,175 155,185 145,185 C135,185 130,175 125,175 C120,175 115,185 105,185 C95,185 85,175 85,160 Z"
                  fill="#ecc94b"
                />
                {/* Glasses */}
                <rect x="110" y="90" width="18" height="14" rx="3" stroke="#1a202c" strokeWidth="2.5" fill="#fff" />
                <rect x="132" y="90" width="18" height="14" rx="3" stroke="#1a202c" strokeWidth="2.5" fill="#fff" />
                <line x1="128" y1="97" x2="132" y2="97" stroke="#1a202c" strokeWidth="2.5" />
                {/* Eyes Pupils looking at calendar */}
                <circle cx="116" cy="97" r="3" fill="#1a202c" />
                <circle cx="138" cy="97" r="3" fill="#1a202c" />
                {/* Mouth */}
                <path d="M118,112 Q125,116 132,112" stroke="#1a202c" strokeWidth="2" fill="none" />
                {/* Pointing Arm to Calendar */}
                <path d="M115,105 Q90,90 68,66" stroke="#ecc94b" strokeWidth="10" strokeLinecap="round" />
                <circle cx="68" cy="66" r="6" fill="#f56565" />
                {/* Hand holding Blue Coffee Cup */}
                <rect x="130" y="125" width="16" height="16" rx="2" fill="#3182ce" />
                <path d="M146,128 Q152,133 146,138" stroke="#3182ce" strokeWidth="2.5" fill="none" />
                {/* Ground Shadow */}
                <ellipse cx="120" cy="188" rx="50" ry="6" fill="#1a202c" opacity="0.6" />
              </svg>
            </div>

            <h3 className="text-base font-bold text-white mb-1">No meetings</h3>
            <p className="text-xs text-slate-400">
              All your {activeTab === "upcoming" ? "upcoming" : "previous"} meetings will be listed here
            </p>
          </div>
        )}
      </div>

      {/* 3. Floating Action Button (FAB) matching screenshot */}
      <button
        onClick={() => setShowScheduleModal(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-2xl bg-[#5c7cd8] hover:bg-[#4a6ac6] text-white shadow-2xl flex items-center justify-center transition-transform hover:scale-110 active:scale-90 cursor-pointer z-30"
        title="Schedule Meeting"
      >
        <Calendar className="w-6 h-6" />
      </button>

      {/* ================= MODAL: JOIN MEETING WITH CODE ================= */}
      {showJoinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-sm bg-[#111b21] border border-slate-800 rounded-3xl p-6 text-white space-y-4 shadow-2xl relative">
            <button
              onClick={() => setShowJoinModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#ff9900]/20 text-[#ff9900] flex items-center justify-center">
                <ArrowRight className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold">Join a Meeting</h3>
                <p className="text-xs text-slate-400">Enter code provided by the host</p>
              </div>
            </div>

            <form onSubmit={handleJoinMeeting} className="space-y-4 pt-2">
              <input
                type="text"
                placeholder="e.g. ary-meet-492"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                autoFocus
                required
                className="w-full py-2.5 px-3.5 bg-[#202c33] border border-slate-700 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-[#ff9900]"
              />

              <button
                type="submit"
                className="w-full py-2.5 bg-[#ff9900] hover:bg-[#e68a00] text-white font-bold text-xs rounded-xl shadow-lg transition-all"
              >
                Join Video Room
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: SCHEDULE NEW MEETING ================= */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md bg-[#111b21] border border-slate-800 rounded-3xl p-6 text-white space-y-4 shadow-2xl relative">
            <button
              onClick={() => setShowScheduleModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#3b82f6]/20 text-[#3b82f6] flex items-center justify-center">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold">Schedule Video Meeting</h3>
                <p className="text-xs text-slate-400">Create appointment with Aryavarta Video</p>
              </div>
            </div>

            <form onSubmit={handleScheduleSubmit} className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Meeting Title</label>
                <input
                  type="text"
                  placeholder="e.g. Weekly Standup / Project Demo"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                  className="w-full py-2 px-3 bg-[#202c33] border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Date</label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full py-2 px-3 bg-[#202c33] border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Time</label>
                  <input
                    type="time"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full py-2 px-3 bg-[#202c33] border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#3b82f6] hover:bg-[#2563eb] text-white font-bold text-xs rounded-xl shadow-lg transition-all mt-2"
              >
                Schedule & Generate Link
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ================= ACTIVE VIDEO MEETING ROOM MODAL ================= */}
      {activeMeetingRoom && (
        <VideoMeetingRoomModal
          roomTitle={activeMeetingRoom.title}
          roomCode={activeMeetingRoom.code}
          onClose={() => setActiveMeetingRoom(null)}
        />
      )}
    </div>
  );
};

export default MeetingsView;
