import { useState, useEffect } from "react";
import { Phone, Video, X, PhoneIncoming, PhoneOutgoing, PhoneMissed, PhoneOff } from "lucide-react";
import { useAuthContext } from "../../context/AuthContext";
import toast from "react-hot-toast";

const CallsModal = ({ onClose }) => {
  const { authUser } = useAuthContext();
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCallLogs = async () => {
      try {
        setLoading(true);
        const headers = authUser?.token ? { Authorization: `Bearer ${authUser.token}` } : {};
        const res = await fetch("/api/calls", { headers });
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.calls)) {
            setCalls(data.calls);
            return;
          }
        }
        setCalls([]);
      } catch (err) {
        console.warn("Failed to fetch call logs:", err);
        setCalls([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCallLogs();
  }, [authUser]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div
        className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Phone className="w-5 h-5 text-emerald-400" />
            <h3 className="text-lg font-bold text-white">Call Logs & Audio/Video</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Calls List */}
        <div className="py-4 space-y-2 max-h-80 overflow-y-auto pr-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-10 text-slate-400">
              <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mb-2" />
              <p className="text-xs">Loading call logs...</p>
            </div>
          ) : calls.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400">
              <div className="w-14 h-14 rounded-full bg-slate-800/80 flex items-center justify-center mb-3 text-slate-500">
                <PhoneOff className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-slate-200">No call history yet</p>
              <p className="text-xs text-slate-500 mt-1 max-w-[220px]">
                Calls you make or receive with your contacts will appear here.
              </p>
            </div>
          ) : (
            calls.map((call) => (
              <div
                key={call._id}
                className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/40 border border-slate-700/40 hover:bg-slate-800 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 overflow-hidden">
                    {call.profilepic ? (
                      <img src={call.profilepic} alt={call.name} className="w-full h-full object-cover" />
                    ) : call.video ? (
                      <Video className="w-5 h-5 text-indigo-400" />
                    ) : (
                      <Phone className="w-5 h-5 text-emerald-400" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-200">{call.name}</h4>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      {call.type === "incoming" && <PhoneIncoming className="w-3.5 h-3.5 text-emerald-400" />}
                      {call.type === "outgoing" && <PhoneOutgoing className="w-3.5 h-3.5 text-indigo-400" />}
                      {call.type === "missed" && <PhoneMissed className="w-3.5 h-3.5 text-rose-400" />}
                      <span>{call.time}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toast.success(`Calling ${call.name}... 📞`)}
                    className="p-2 rounded-xl text-slate-400 hover:text-emerald-400 hover:bg-slate-700/60 transition-colors cursor-pointer"
                    title="Voice Call"
                  >
                    <Phone className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => toast.success(`Starting video call with ${call.name}... 📹`)}
                    className="p-2 rounded-xl text-slate-400 hover:text-indigo-400 hover:bg-slate-700/60 transition-colors cursor-pointer"
                    title="Video Call"
                  >
                    <Video className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="pt-2">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default CallsModal;
