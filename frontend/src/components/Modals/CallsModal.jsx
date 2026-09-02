import { Phone, Video, X, PhoneIncoming, PhoneOutgoing, PhoneMissed } from "lucide-react";

const SAMPLE_CALLS = [
  { name: "Dheeraj Sharma", time: "Today, 1:45 PM", type: "incoming", video: false },
  { name: "Pulse AI Assistant", time: "Yesterday, 6:12 PM", type: "outgoing", video: true },
  { name: "Alex Tech", time: "Aug 30, 11:20 AM", type: "missed", video: false }
];

const CallsModal = ({ onClose }) => {
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
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Calls List */}
        <div className="py-4 space-y-2">
          {SAMPLE_CALLS.map((call, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/40 border border-slate-700/40 hover:bg-slate-800 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-slate-300">
                  {call.video ? <Video className="w-5 h-5 text-indigo-400" /> : <Phone className="w-5 h-5 text-emerald-400" />}
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
                  onClick={() => alert(`Starting voice call with ${call.name}...`)}
                  className="p-2 rounded-xl text-slate-400 hover:text-emerald-400 hover:bg-slate-700/60 transition-colors"
                  title="Voice Call"
                >
                  <Phone className="w-4 h-4" />
                </button>
                <button
                  onClick={() => alert(`Starting video call with ${call.name}...`)}
                  className="p-2 rounded-xl text-slate-400 hover:text-indigo-400 hover:bg-slate-700/60 transition-colors"
                  title="Video Call"
                >
                  <Video className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
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

export default CallsModal;
