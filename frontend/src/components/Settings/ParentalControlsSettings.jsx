import { useState } from "react";
import {
  ArrowLeft,
  Shield,
  Lock,
  Clock,
  Eye,
  Check,
  AlertTriangle,
  Users
} from "lucide-react";
import toast from "react-hot-toast";

const ParentalControlsSettings = ({ onBack }) => {
  const [safeFilter, setSafeFilter] = useState(true);
  const [requirePinForStrangers, setRequirePinForStrangers] = useState(false);
  const [hideAdultAI, setHideAdultAI] = useState(true);
  const [screenTimeLimit, setScreenTimeLimit] = useState("2h");

  const Switch = ({ checked, onChange }) => (
    <label className="relative inline-flex items-center cursor-pointer flex-shrink-0 select-none">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only peer"
      />
      <div className="w-11 h-6 bg-[#374151] peer-focus:outline-none rounded-full peer peer-checked:bg-[#6366f1] transition-colors duration-200">
        <div
          className={`absolute top-[2px] left-[2px] bg-white rounded-full h-5 w-5 transition-transform duration-200 shadow-md ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </div>
    </label>
  );

  return (
    <div className="w-full flex flex-col h-full min-h-0 bg-[#0c1317] border-r border-slate-800/80 z-10 box-border text-slate-100 select-none">
      <div className="flex items-center gap-3 px-4 py-4 border-b border-slate-800/60 flex-shrink-0 bg-[#111b21]">
        <button
          onClick={onBack}
          className="p-1.5 rounded-full hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-bold text-slate-100">Parental controls</h2>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
        <div className="bg-[#1a222d] border border-slate-800/80 rounded-2xl p-4 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex-shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Family Safe Mode</h3>
            <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
              Guard chat content, enforce safe messaging, and protect underage family accounts.
            </p>
          </div>
        </div>

        <div className="bg-[#1a222d] border border-slate-800/80 rounded-2xl overflow-hidden divide-y divide-slate-800/60">
          <div className="p-4 flex items-center justify-between">
            <div className="pr-3">
              <h4 className="text-sm font-semibold text-white">Safe Chat & Sensitive Filter</h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Automatically blurs sensitive photos and blocks harmful language
              </p>
            </div>
            <Switch checked={safeFilter} onChange={setSafeFilter} />
          </div>

          <div className="p-4 flex items-center justify-between">
            <div className="pr-3">
              <h4 className="text-sm font-semibold text-white">Restrict Unknown Contacts</h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Only people in approved address book can initiate new direct chats
              </p>
            </div>
            <Switch checked={requirePinForStrangers} onChange={setRequirePinForStrangers} />
          </div>

          <div className="p-4 flex items-center justify-between">
            <div className="pr-3">
              <h4 className="text-sm font-semibold text-white">Family Safe AI Responses</h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Enforces family-friendly educational content for Arya AI interactions
              </p>
            </div>
            <Switch checked={hideAdultAI} onChange={setHideAdultAI} />
          </div>
        </div>

        <div className="bg-[#1a222d] border border-slate-800/80 rounded-2xl p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-400" />
            <h4 className="text-sm font-semibold text-white">Daily Screen Time Reminder</h4>
          </div>
          <p className="text-xs text-slate-400">
            Notify when daily active chat duration exceeds threshold
          </p>

          <div className="flex gap-2 pt-1 flex-wrap">
            {["1h", "2h", "3h", "Off"].map((t) => (
              <button
                key={t}
                onClick={() => setScreenTimeLimit(t)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  screenTimeLimit === t
                    ? "bg-[#6366f1] text-white shadow"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParentalControlsSettings;
