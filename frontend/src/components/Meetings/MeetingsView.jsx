import { useState, useEffect, useCallback } from "react";
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
  Users,
  CheckCircle2,
  Play,
  RotateCcw,
  CalendarCheck
} from "lucide-react";
import VideoMeetingRoomModal from "./VideoMeetingRoomModal";
import { useAuthContext } from "../../context/AuthContext";
import toast from "react-hot-toast";

const MeetingsView = () => {
  const { authUser } = useAuthContext();
  const [activeTab, setActiveTab] = useState("upcoming"); // "upcoming" | "previous"

  const [upcomingMeetings, setUpcomingMeetings] = useState([]);
  const [previousMeetings, setPreviousMeetings] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modals state
  const [activeMeetingRoom, setActiveMeetingRoom] = useState(null); // { title, code }
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  // Form states
  const [joinCode, setJoinCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Check URL query param or path on mount e.g. ?meet=ary-meet-492 or /meet/ary-meet-492
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const meetFromQuery = params.get("meet");
    const pathMatch = window.location.pathname.match(/\/meet\/([a-zA-Z0-9-_]+)/);
    const targetCode = meetFromQuery || (pathMatch ? pathMatch[1] : null);

    if (targetCode) {
      setJoinCode(targetCode);
      setShowJoinModal(true);
    }
  }, []);

  // =========================================================================
  // 🔄 FETCH MEETINGS (UPCOMING & PREVIOUS)
  // =========================================================================
  const fetchMeetings = useCallback(async () => {
    try {
      setLoading(true);
      const headers = authUser?.token ? { Authorization: `Bearer ${authUser.token}` } : {};
      const res = await fetch("/api/meeting", { headers });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setUpcomingMeetings(data.upcoming || []);
          setPreviousMeetings(data.previous || []);
          return;
        }
      }
    } catch (err) {
      console.warn("Error fetching meetings:", err);
    } finally {
      setLoading(false);
    }
  }, [authUser]);

  useEffect(() => {
    fetchMeetings();
  }, [fetchMeetings]);

  // =========================================================================
  // ⚡ INSTANT MEETING ("MEET NOW")
  // =========================================================================
  const handleStartMeetNow = () => {
    // Generate collision-resistant 6-character random alphanumeric code e.g. "ary-meet-k8x2q9"
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const randomCode = `ary-meet-${randomSuffix}`;
    setActiveMeetingRoom({
      title: "Instant Video Meeting",
      code: randomCode
    });
    toast.success("Instant video meeting launched! 🟢");
  };

  // =========================================================================
  // 🚪 JOIN MEETING BY CODE OR LINK (VERIFIED VIA BACKEND)
  // =========================================================================
  const handleJoinMeeting = async (e) => {
    e.preventDefault();
    if (!joinCode.trim()) {
      toast.error("Please enter a meeting code or link");
      return;
    }

    try {
      setIsJoining(true);
      const headers = {
        "Content-Type": "application/json",
        ...(authUser?.token ? { Authorization: `Bearer ${authUser.token}` } : {})
      };

      const res = await fetch("/api/meeting/join", {
        method: "POST",
        headers,
        body: JSON.stringify({ code: joinCode.trim() })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Unable to join meeting");
      }

      setShowJoinModal(false);
      setActiveMeetingRoom({
        title: data.title || `Meeting (${data.code})`,
        code: data.code
      });
      toast.success(data.message || `Joined room: ${data.code} 🚀`);
      setJoinCode("");
    } catch (err) {
      toast.error(err.message || "Failed to join meeting");
    } finally {
      setIsJoining(false);
    }
  };

  // =========================================================================
  // 📅 SCHEDULE NEW MEETING
  // =========================================================================
  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const scheduledDateTime = `${newDate || "Today"}, ${newTime || "3:00 PM"}`;
    try {
      const headers = {
        "Content-Type": "application/json",
        ...(authUser?.token ? { Authorization: `Bearer ${authUser.token}` } : {})
      };
      const res = await fetch("/api/meeting/schedule", {
        method: "POST",
        headers,
        body: JSON.stringify({
          title: newTitle.trim(),
          scheduledDate: scheduledDateTime
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Meeting scheduled successfully! 📅");
        await fetchMeetings();
      } else {
        throw new Error(data.message || "Failed to schedule meeting");
      }
    } catch (err) {
      toast.error(err.message || "Could not schedule meeting");
    } finally {
      setShowScheduleModal(false);
      setNewTitle("");
      setNewDate("");
      setNewTime("");
    }
  };

  // =========================================================================
  // 🗑️ DELETE MEETING FROM HISTORY
  // =========================================================================
  const handleDeleteMeeting = async (meetingId) => {
    try {
      const headers = authUser?.token ? { Authorization: `Bearer ${authUser.token}` } : {};
      await fetch(`/api/meeting/${meetingId}`, {
        method: "DELETE",
        headers
      });
      setUpcomingMeetings((prev) => prev.filter((m) => m._id !== meetingId && m.code !== meetingId));
      setPreviousMeetings((prev) => prev.filter((m) => m._id !== meetingId && m.code !== meetingId));
      toast.success("Meeting record removed 🗑️");
    } catch (err) {
      toast.error("Failed to delete meeting");
    }
  };

  const handleCopyLink = (code) => {
    const shareableUrl = `${window.location.origin}/meet/${code}`;
    navigator.clipboard.writeText(shareableUrl);
    toast.success("Meeting link copied to clipboard! 🔗");
  };

  // Filter lists by search query
  const displayedUpcoming = upcomingMeetings.filter(
    (m) =>
      !searchQuery ||
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const displayedPrevious = previousMeetings.filter(
    (m) =>
      !searchQuery ||
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col h-full min-h-0 bg-[#000000] text-white select-none overflow-hidden relative box-border">
      {/* 1. Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-900 bg-black/80 flex-shrink-0 z-10">
        <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">Meetings</h1>
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              const q = prompt("Search meetings by title or code:");
              if (q !== null) setSearchQuery(q.trim());
            }}
            className="p-2 rounded-full hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Search"
          >
            <Search className="w-5 h-5" />
          </button>
          <button
            onClick={() => fetchMeetings()}
            className="p-2 rounded-full hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Refresh"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 2. Main Scrollable Container */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 md:p-6 flex flex-col items-center">
        {/* Top 3 Action Buttons (Squircles matching professional video app design) */}
        <div className="flex items-center justify-center gap-8 md:gap-14 my-5 w-full max-w-md">
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

        {/* Tab Selector Pill Bar */}
        <div className="w-full max-w-md bg-[#161c24] p-1 rounded-full flex items-center my-3 border border-slate-800">
          <button
            onClick={() => setActiveTab("upcoming")}
            className={`flex-1 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === "upcoming"
                ? "bg-[#25396e] text-white shadow-md"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <span>Upcoming</span>
            {displayedUpcoming.length > 0 && (
              <span className="px-1.5 py-0.2 bg-blue-500/30 text-blue-300 text-[10px] rounded-full">
                {displayedUpcoming.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("previous")}
            className={`flex-1 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === "previous"
                ? "bg-[#25396e] text-white shadow-md"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <span>Previous</span>
            {displayedPrevious.length > 0 && (
              <span className="px-1.5 py-0.2 bg-slate-700 text-slate-300 text-[10px] rounded-full">
                {displayedPrevious.length}
              </span>
            )}
          </button>
        </div>

        {/* ================================================================= */}
        {/* UPCOMING TAB CONTENT                                              */}
        {/* ================================================================= */}
        {activeTab === "upcoming" && (
          <div className="w-full max-w-md">
            {displayedUpcoming.length > 0 ? (
              <div className="space-y-3 mt-3">
                {displayedUpcoming.map((m) => {
                  const isLive = m.status === "live";
                  return (
                    <div
                      key={m._id || m.code}
                      className={`p-4 rounded-3xl bg-[#111822] border transition-all flex flex-col gap-3 shadow-lg ${
                        isLive ? "border-emerald-500/60 shadow-emerald-900/20" : "border-slate-800/80 hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-white">{m.title}</h3>
                            {isLive && (
                              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded-full animate-pulse">
                                LIVE NOW
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
                            <Clock className="w-3.5 h-3.5 text-blue-400" />
                            <span>{m.scheduledDate || "Scheduled Meeting"}</span>
                          </p>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Code: <span className="font-mono text-slate-300 font-bold">{m.code}</span>
                          </p>
                        </div>

                        <button
                          onClick={() => handleDeleteMeeting(m._id || m.code)}
                          className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                          title="Delete meeting"
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
                          className={`flex-1 py-2.5 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-2 shadow cursor-pointer transition-all ${
                            isLive
                              ? "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30"
                              : "bg-[#00a884] hover:bg-[#02906f]"
                          }`}
                        >
                          <Video className="w-3.5 h-3.5" />
                          <span>{isLive ? "Join Live Meeting 🟢" : "Start Meeting"}</span>
                        </button>

                        <button
                          onClick={() => handleCopyLink(m.code)}
                          className="px-3 py-2.5 rounded-xl bg-[#202c33] hover:bg-[#2a3942] text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer"
                          title="Copy Link"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Empty State for Upcoming */
              <div className="flex flex-col items-center justify-center text-center my-8 animate-fade-in">
                <div className="w-40 h-40 relative flex items-center justify-center mb-3">
                  <svg viewBox="0 0 200 200" className="w-full h-full">
                    <rect x="35" y="30" width="70" height="75" rx="6" fill="#2d3748" />
                    <rect x="40" y="42" width="60" height="58" rx="4" fill="#1a202c" />
                    <circle cx="48" cy="30" r="3" fill="#cbd5e0" />
                    <circle cx="60" cy="30" r="3" fill="#cbd5e0" />
                    <circle cx="72" cy="30" r="3" fill="#cbd5e0" />
                    <circle cx="84" cy="30" r="3" fill="#cbd5e0" />
                    <circle cx="68" cy="62" r="10" stroke="#00a884" strokeWidth="2.5" fill="none" strokeDasharray="3,2" />
                    <path d="M125,75 Q135,62 145,70 Q155,62 160,75 Z" fill="#2b6cb0" />
                    <path
                      d="M115,100 C115,75 165,75 165,100 L165,160 C165,175 155,185 145,185 C135,185 130,175 125,175 C120,175 115,185 105,185 C95,185 85,175 85,160 Z"
                      fill="#ecc94b"
                    />
                    <rect x="110" y="90" width="18" height="14" rx="3" stroke="#1a202c" strokeWidth="2.5" fill="#fff" />
                    <rect x="132" y="90" width="18" height="14" rx="3" stroke="#1a202c" strokeWidth="2.5" fill="#fff" />
                    <circle cx="116" cy="97" r="3" fill="#1a202c" />
                    <circle cx="138" cy="97" r="3" fill="#1a202c" />
                    <path d="M118,112 Q125,116 132,112" stroke="#1a202c" strokeWidth="2" fill="none" />
                    <ellipse cx="120" cy="188" rx="50" ry="6" fill="#1a202c" opacity="0.6" />
                  </svg>
                </div>
                <h3 className="text-sm font-bold text-white mb-0.5">No upcoming meetings</h3>
                <p className="text-xs text-slate-400 max-w-[240px]">
                  Schedule a meeting or start one instantly using the buttons above!
                </p>
              </div>
            )}
          </div>
        )}

        {/* ================================================================= */}
        {/* PREVIOUS TAB CONTENT (BUG 2 FIX)                                 */}
        {/* Displays past meetings with title, date, real duration, & people */}
        {/* ================================================================= */}
        {activeTab === "previous" && (
          <div className="w-full max-w-md">
            {displayedPrevious.length > 0 ? (
              <div className="space-y-3 mt-3">
                {displayedPrevious.map((m) => {
                  const meetingDateStr = m.endedAt
                    ? new Date(m.endedAt).toLocaleString([], {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      })
                    : m.startedAt
                    ? new Date(m.startedAt).toLocaleString([], {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      })
                    : "Recently Concluded";

                  const participantsList = m.participants || [];

                  return (
                    <div
                      key={m._id || m.code}
                      className="p-4 rounded-3xl bg-[#111822] border border-slate-800 hover:border-slate-700 transition-all flex flex-col gap-3 shadow-lg"
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-white">{m.title}</h3>
                            <span className="px-2 py-0.5 bg-slate-800 text-slate-300 text-[10px] font-semibold rounded-full flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              <span>Ended</span>
                            </span>
                          </div>

                          <p className="text-xs text-slate-400 flex items-center gap-2">
                            <span className="flex items-center gap-1">
                              <CalendarCheck className="w-3.5 h-3.5 text-slate-400" />
                              <span>{meetingDateStr}</span>
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1 text-emerald-400 font-medium">
                              <Clock className="w-3.5 h-3.5" />
                              <span>Duration: {m.duration || "10 mins"}</span>
                            </span>
                          </p>

                          <p className="text-[11px] text-slate-500">
                            Code: <span className="font-mono text-slate-300">{m.code}</span>
                            {m.hostName && <span> • Hosted by {m.hostName}</span>}
                          </p>
                        </div>

                        <button
                          onClick={() => handleDeleteMeeting(m._id || m.code)}
                          className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                          title="Delete from history"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Participants who joined */}
                      {participantsList.length > 0 && (
                        <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="flex -space-x-2 overflow-hidden">
                              {participantsList.slice(0, 4).map((p, idx) => (
                                <img
                                  key={idx}
                                  src={
                                    p.profilepic ||
                                    `https://avatar.iran.liara.run/public/boy?username=${p.username || "user"}`
                                  }
                                  alt={p.fullname}
                                  title={p.fullname}
                                  className="inline-block w-6 h-6 rounded-full ring-2 ring-[#111822] object-cover bg-slate-800"
                                />
                              ))}
                            </div>
                            <span className="text-[11px] text-slate-400 font-medium">
                              {participantsList.length === 1
                                ? `${participantsList[0].fullname} attended`
                                : `${participantsList[0].fullname} & ${participantsList.length - 1} other${
                                    participantsList.length > 2 ? "s" : ""
                                  } joined`}
                            </span>
                          </div>

                          <button
                            onClick={() =>
                              setActiveMeetingRoom({
                                title: m.title,
                                code: m.code
                              })
                            }
                            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Start Again</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Empty State for Previous */
              <div className="flex flex-col items-center justify-center text-center my-8 animate-fade-in">
                <div className="w-40 h-40 relative flex items-center justify-center mb-3">
                  <svg viewBox="0 0 200 200" className="w-full h-full">
                    <rect x="35" y="30" width="70" height="75" rx="6" fill="#2d3748" />
                    <rect x="40" y="42" width="60" height="58" rx="4" fill="#1a202c" />
                    <circle cx="48" cy="30" r="3" fill="#cbd5e0" />
                    <circle cx="60" cy="30" r="3" fill="#cbd5e0" />
                    <circle cx="72" cy="30" r="3" fill="#cbd5e0" />
                    <circle cx="84" cy="30" r="3" fill="#cbd5e0" />
                    <circle cx="68" cy="62" r="10" stroke="#f56565" strokeWidth="2.5" fill="none" strokeDasharray="3,2" />
                    <path d="M125,75 Q135,62 145,70 Q155,62 160,75 Z" fill="#2b6cb0" />
                    <path
                      d="M115,100 C115,75 165,75 165,100 L165,160 C165,175 155,185 145,185 C135,185 130,175 125,175 C120,175 115,185 105,185 C95,185 85,175 85,160 Z"
                      fill="#ecc94b"
                    />
                    <rect x="110" y="90" width="18" height="14" rx="3" stroke="#1a202c" strokeWidth="2.5" fill="#fff" />
                    <rect x="132" y="90" width="18" height="14" rx="3" stroke="#1a202c" strokeWidth="2.5" fill="#fff" />
                    <circle cx="116" cy="97" r="3" fill="#1a202c" />
                    <circle cx="138" cy="97" r="3" fill="#1a202c" />
                    <path d="M118,112 Q125,116 132,112" stroke="#1a202c" strokeWidth="2" fill="none" />
                    <ellipse cx="120" cy="188" rx="50" ry="6" fill="#1a202c" opacity="0.6" />
                  </svg>
                </div>
                <h3 className="text-sm font-bold text-white mb-0.5">No past meetings</h3>
                <p className="text-xs text-slate-400 max-w-[240px]">
                  Concluded meetings with durations and attendees will be logged here.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Floating Action Button (Schedule) */}
      <button
        onClick={() => setShowScheduleModal(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-2xl bg-[#5c7cd8] hover:bg-[#4a6ac6] text-white shadow-2xl flex items-center justify-center transition-transform hover:scale-110 active:scale-95 cursor-pointer z-30"
        title="Schedule Meeting"
      >
        <Calendar className="w-6 h-6" />
      </button>

      {/* ================= MODAL: JOIN MEETING ================= */}
      {showJoinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-sm bg-[#111b21] border border-slate-800 rounded-3xl p-6 text-white space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ArrowRight className="w-4 h-4 text-orange-400" />
                <span>Join a Meeting</span>
              </h3>
              <button
                onClick={() => setShowJoinModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleJoinMeeting} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Meeting Code or Link
                </label>
                <input
                  type="text"
                  placeholder="e.g. ary-meet-492"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                  autoFocus
                  className="w-full py-2.5 px-3.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-orange-500 font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={isJoining}
                className={`w-full py-2.5 bg-[#ff9900] hover:bg-[#e68a00] text-white font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  isJoining ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                <span>{isJoining ? "Connecting..." : "Join Meeting Now"}</span>
                {!isJoining && <ArrowRight className="w-3.5 h-3.5" />}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: SCHEDULE MEETING ================= */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-sm bg-[#111b21] border border-slate-800 rounded-3xl p-6 text-white space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-400" />
                <span>Schedule Meeting</span>
              </h3>
              <button
                onClick={() => setShowScheduleModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleScheduleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Meeting Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Weekly Team Standup"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                  autoFocus
                  className="w-full py-2.5 px-3.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Date</label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full py-2 px-3 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Time</label>
                  <input
                    type="time"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full py-2 px-3 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#3b82f6] hover:bg-[#2563eb] text-white font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 mt-2"
              >
                <span>Save & Schedule</span>
                <Calendar className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Active Fullscreen Live Video Meeting Room Modal */}
      {activeMeetingRoom && (
        <VideoMeetingRoomModal
          roomTitle={activeMeetingRoom.title}
          roomCode={activeMeetingRoom.code}
          onClose={() => setActiveMeetingRoom(null)}
          onMeetingEnded={() => {
            fetchMeetings();
          }}
        />
      )}
    </div>
  );
};

export default MeetingsView;
