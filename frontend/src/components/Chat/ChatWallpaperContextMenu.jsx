import { useEffect, useRef } from "react";
import { CheckSquare, X, Eraser, Info, MessageSquare } from "lucide-react";
import { useChatContext } from "../../context/ChatContext";
import toast from "react-hot-toast";

const ChatWallpaperContextMenu = ({ x, y, onClose, onOpenContactInfo, onToggleSelectMode }) => {
  const { setSelectedConversation, setMessages } = useChatContext();
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  // Adjust coordinates if menu would overflow window boundaries
  const adjustedX = Math.min(x, window.innerWidth - 200);
  const adjustedY = Math.min(y, window.innerHeight - 180);

  return (
    <div
      ref={menuRef}
      style={{ top: `${adjustedY}px`, left: `${adjustedX}px` }}
      className="fixed bg-[#233138] border border-slate-700/80 rounded-2xl shadow-2xl py-2 z-50 animate-fade-in text-slate-200 min-w-[180px] box-border"
    >
      {/* 1. Select messages */}
      <button
        onClick={() => {
          onClose();
          if (onToggleSelectMode) onToggleSelectMode();
          toast("Message selection enabled 🔘");
        }}
        className="w-full px-4 py-2 flex items-center gap-3 text-xs font-semibold hover:bg-[#182229] transition-colors"
      >
        <CheckSquare className="w-4 h-4 text-slate-300" />
        <span>Select messages</span>
      </button>

      {/* 2. Close chat */}
      <button
        onClick={() => {
          onClose();
          setSelectedConversation(null);
          toast("Chat closed");
        }}
        className="w-full px-4 py-2 flex items-center gap-3 text-xs font-semibold hover:bg-[#182229] transition-colors"
      >
        <X className="w-4 h-4 text-slate-300" />
        <span>Close chat</span>
      </button>

      <div className="h-px bg-slate-700/60 my-1" />

      {/* 3. Contact info */}
      <button
        onClick={() => {
          onClose();
          if (onOpenContactInfo) onOpenContactInfo();
        }}
        className="w-full px-4 py-2 flex items-center gap-3 text-xs font-semibold hover:bg-[#182229] transition-colors"
      >
        <Info className="w-4 h-4 text-emerald-400" />
        <span>Contact info</span>
      </button>

      {/* 4. Clear chat */}
      <button
        onClick={() => {
          onClose();
          setMessages([]);
          toast.success("Chat cleared 🧹");
        }}
        className="w-full px-4 py-2 flex items-center gap-3 text-xs font-semibold text-rose-400 hover:bg-rose-950/30 transition-colors"
      >
        <Eraser className="w-4 h-4" />
        <span>Clear chat</span>
      </button>
    </div>
  );
};

export default ChatWallpaperContextMenu;
