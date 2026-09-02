import { FileText, UserPlus, Sparkles, Lock } from "lucide-react";
import toast from "react-hot-toast";

const NoChatSelected = ({ onOpenAI, onAddContact }) => {
  const handleSendDocument = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        toast.success(`Document "${file.name}" selected. Choose a contact to send it! 📄`);
      }
    };
    input.click();
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-between h-full min-h-0 bg-[#111b21] p-6 text-center border-l border-slate-800/60 relative box-border select-none">
      {/* Top Spacer */}
      <div className="flex-shrink-0 h-10" />

      {/* Center WhatsApp Desktop Quick Actions */}
      <div className="flex flex-col items-center max-w-lg">
        {/* Quick Action Buttons Row matching screenshot 1:1 */}
        <div className="flex items-center justify-center gap-10 md:gap-14 my-8">
          {/* 1. Send Document */}
          <div className="flex flex-col items-center group cursor-pointer" onClick={handleSendDocument}>
            <button
              type="button"
              className="w-16 h-16 rounded-full bg-[#202c33] hover:bg-[#2a3942] flex items-center justify-center text-slate-300 hover:text-white shadow-lg transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <FileText className="w-6 h-6 text-slate-300" />
            </button>
            <span className="text-xs font-medium text-slate-300 mt-2.5 group-hover:text-white transition-colors">
              Send document
            </span>
          </div>

          {/* 2. Add Contact */}
          <div className="flex flex-col items-center group cursor-pointer" onClick={onAddContact}>
            <button
              type="button"
              className="w-16 h-16 rounded-full bg-[#202c33] hover:bg-[#2a3942] flex items-center justify-center text-slate-300 hover:text-white shadow-lg transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <UserPlus className="w-6 h-6 text-slate-300" />
            </button>
            <span className="text-xs font-medium text-slate-300 mt-2.5 group-hover:text-white transition-colors">
              Add contact
            </span>
          </div>

          {/* 3. Ask Meta AI / Aryavarta AI (Purple Swirling Ring Icon matching screenshot) */}
          <div className="flex flex-col items-center group cursor-pointer" onClick={onOpenAI}>
            <button
              type="button"
              className="w-16 h-16 rounded-full bg-[#202c33] hover:bg-[#2a3942] flex items-center justify-center shadow-lg transition-all hover:scale-110 active:scale-95 cursor-pointer relative"
            >
              {/* WhatsApp Purple Swirl Logo SVG matching screenshot */}
              <svg viewBox="0 0 100 100" className="w-7 h-7 animate-spin-slow">
                <circle cx="50" cy="18" r="8" fill="#a855f7" />
                <circle cx="73" cy="27" r="8" fill="#c084fc" />
                <circle cx="82" cy="50" r="8" fill="#d8b4fe" />
                <circle cx="73" cy="73" r="8" fill="#9333ea" />
                <circle cx="50" cy="82" r="8" fill="#7e22ce" />
                <circle cx="27" cy="73" r="8" fill="#a855f7" />
                <circle cx="18" cy="50" r="8" fill="#c084fc" />
                <circle cx="27" cy="27" r="8" fill="#e9d5ff" />
              </svg>
            </button>
            <span className="text-xs font-medium text-slate-300 mt-2.5 group-hover:text-purple-300 transition-colors">
              Ask Aryavarta AI
            </span>
          </div>
        </div>
      </div>

      {/* Encrypted Lock Notice */}
      <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 pb-2 flex-shrink-0">
        <Lock className="w-3.5 h-3.5 text-slate-500" />
        <span>Your personal messages in Aryavarta are end-to-end encrypted</span>
      </div>
    </div>
  );
};

export default NoChatSelected;
