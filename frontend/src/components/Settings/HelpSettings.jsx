import { ArrowLeft, HelpCircle, FileText, Sparkles } from "lucide-react";
import toast from "react-hot-toast";

const HelpSettings = ({ onBack }) => {
  return (
    <div className="w-full flex flex-col h-full min-h-0 bg-[#111b21] border-r border-slate-800/80 z-10 box-border text-slate-100 select-none">
      <div className="flex items-center gap-4 px-4 py-4 border-b border-slate-800/60 flex-shrink-0">
        <button
          onClick={onBack}
          className="p-1.5 rounded-full hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-bold text-slate-100">Help</h2>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-6">
        <div className="flex flex-col items-center text-center p-5 bg-[#202c33] rounded-2xl border border-slate-700/60 space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-lg">
            <Sparkles className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-white">Aryavarta Chat Application</h3>
          <p className="text-xs text-emerald-400 font-semibold">Version 2.5.0</p>
          <p className="text-xs text-slate-400 leading-relaxed pt-1">
            Real-Time Messaging with Integrated Aryavarta AI & End-to-End Security
          </p>
        </div>

        <div className="space-y-1">
          <button
            onClick={() => toast("Opening Help Centre")}
            className="w-full text-left p-3.5 rounded-2xl hover:bg-[#202c33] text-xs font-semibold text-slate-200 transition-colors flex items-center justify-between"
          >
            <span>Help Centre</span>
            <span className="text-slate-500">↗</span>
          </button>

          <button
            onClick={() => toast("Terms and Privacy policy")}
            className="w-full text-left p-3.5 rounded-2xl hover:bg-[#202c33] text-xs font-semibold text-slate-200 transition-colors flex items-center justify-between"
          >
            <span>Terms and Privacy Policy</span>
            <span className="text-slate-500">↗</span>
          </button>

          <button
            onClick={() => toast("Licenses & Credits")}
            className="w-full text-left p-3.5 rounded-2xl hover:bg-[#202c33] text-xs font-semibold text-slate-200 transition-colors flex items-center justify-between"
          >
            <span>Licenses</span>
            <span className="text-slate-500">↗</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default HelpSettings;
