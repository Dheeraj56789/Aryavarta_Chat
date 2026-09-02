import { FileText, UserPlus, Sparkles, Lock } from "lucide-react";

const NoChatSelected = ({ onOpenAI, onAddContact }) => {
  const handleSendDocument = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        alert(`Document selected: ${file.name}. Select a contact to send it!`);
      }
    };
    input.click();
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-between h-full min-h-0 bg-[#111b21] p-6 text-center border-l border-slate-800/60 relative box-border">
      {/* Spacer */}
      <div className="flex-shrink-0 h-10" />

      {/* Center WhatsApp Desktop Quick Actions */}
      <div className="flex flex-col items-center max-w-lg">
        {/* Quick Action Buttons Row matching screenshot */}
        <div className="flex items-center justify-center gap-10 md:gap-14 my-8">
          {/* 1. Send Document */}
          <div className="flex flex-col items-center group cursor-pointer" onClick={handleSendDocument}>
            <button
              type="button"
              className="w-16 h-16 rounded-full bg-[#202c33] hover:bg-[#2a3942] flex items-center justify-center text-slate-300 hover:text-white shadow-lg transition-all hover:scale-105"
            >
              <FileText className="w-7 h-7" />
            </button>
            <span className="text-xs font-medium text-slate-300 mt-2.5 group-hover:text-white transition-colors">
              Send document
            </span>
          </div>

          {/* 2. Add Contact */}
          <div className="flex flex-col items-center group cursor-pointer" onClick={onAddContact}>
            <button
              type="button"
              className="w-16 h-16 rounded-full bg-[#202c33] hover:bg-[#2a3942] flex items-center justify-center text-slate-300 hover:text-white shadow-lg transition-all hover:scale-105"
            >
              <UserPlus className="w-7 h-7" />
            </button>
            <span className="text-xs font-medium text-slate-300 mt-2.5 group-hover:text-white transition-colors">
              Add contact
            </span>
          </div>

          {/* 3. Ask Aryavarta AI */}
          <div className="flex flex-col items-center group cursor-pointer" onClick={onOpenAI}>
            <button
              type="button"
              className="w-16 h-16 rounded-full bg-gradient-to-tr from-purple-600 via-pink-600 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-purple-600/30 transition-all hover:scale-110 active:scale-95"
            >
              <Sparkles className="w-7 h-7 animate-pulse" />
            </button>
            <span className="text-xs font-medium text-purple-300 mt-2.5 group-hover:text-purple-200 transition-colors">
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
