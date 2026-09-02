import { useState } from "react";
import { ArrowLeft, Bell } from "lucide-react";
import { useChatContext } from "../../context/ChatContext";
import toast from "react-hot-toast";

const NotificationsSettings = ({ onBack }) => {
  const { soundEnabled, setSoundEnabled } = useChatContext();
  const [showPreview, setShowPreview] = useState(true);

  return (
    <div className="w-full flex flex-col h-full min-h-0 bg-[#111b21] border-r border-slate-800/80 z-10 box-border text-slate-100 select-none">
      <div className="flex items-center gap-4 px-4 py-4 border-b border-slate-800/60 flex-shrink-0">
        <button
          onClick={onBack}
          className="p-1.5 rounded-full hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-bold text-slate-100">Notifications</h2>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-6">
        <div className="space-y-4">
          <span className="text-xs font-semibold text-slate-400 block tracking-wide">
            Messages
          </span>

          <div className="flex items-start justify-between">
            <div className="pr-4">
              <span className="text-sm font-medium text-slate-200 block">Sounds</span>
              <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                Play sounds for incoming and outgoing messages
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer flex-shrink-0 mt-1">
              <input
                type="checkbox"
                checked={soundEnabled}
                onChange={(e) => {
                  setSoundEnabled(e.target.checked);
                  toast(e.target.checked ? "Sounds enabled 🔔" : "Sounds muted 🔕");
                }}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00a884]"></div>
            </label>
          </div>

          <div className="flex items-start justify-between pt-1">
            <div className="pr-4">
              <span className="text-sm font-medium text-slate-200 block">Show preview</span>
              <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                Display sender and message text in notifications
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer flex-shrink-0 mt-1">
              <input
                type="checkbox"
                checked={showPreview}
                onChange={(e) => setShowPreview(e.target.checked)}
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

export default NotificationsSettings;
