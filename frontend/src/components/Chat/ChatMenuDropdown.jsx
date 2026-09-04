import { useState, useRef, useEffect } from "react";
import {
  Info,
  Search,
  CheckSquare,
  BellOff,
  Clock,
  Star,
  FolderPlus,
  Download,
  X,
  Link,
  Calendar,
  Users,
  ThumbsDown,
  Slash,
  Eraser,
  Trash2,
  ChevronRight
} from "lucide-react";
import { useChatContext } from "../../context/ChatContext";
import toast from "react-hot-toast";

const ChatMenuDropdown = ({ onClose, onOpenContactInfo, onToggleSelectMode }) => {
  const {
    selectedConversation,
    setSelectedConversation,
    setMessages,
    messages,
    deleteConversation
  } = useChatContext();
  const [showMuteSubmenu, setShowMuteSubmenu] = useState(false);
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

  const handleMute = (duration) => {
    toast(`Notifications muted for ${duration} 🔕`);
    onClose();
  };

  const handleExportChat = () => {
    if (!selectedConversation) return;
    const chatText = messages
      .map((m) => `[${new Date(m.createdAt || Date.now()).toLocaleString()}] ${m.senderId === selectedConversation._id ? selectedConversation.fullname : "Me"}: ${m.message}`)
      .join("\n");
    const blob = new Blob([chatText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Aryavarta_Chat_${selectedConversation.username}.txt`;
    a.click();
    toast.success("Chat exported successfully 📥");
    onClose();
  };

  const handleClearChat = () => {
    setMessages([]);
    toast.success("Chat messages cleared 🧹");
    onClose();
  };

  const handleDeleteChat = async () => {
    if (selectedConversation?._id && deleteConversation) {
      await deleteConversation(selectedConversation._id);
    } else {
      setSelectedConversation(null);
      toast.success("Chat deleted 🗑️");
    }
    onClose();
  };

  return (
    <div
      ref={menuRef}
      className="absolute right-3 top-14 w-60 bg-[#233138] border border-slate-700/80 rounded-2xl shadow-2xl py-2 z-50 animate-fade-in text-slate-200"
    >
      {/* 1. Contact info */}
      <button
        onClick={() => {
          onClose();
          onOpenContactInfo();
        }}
        className="w-full px-4 py-2 flex items-center gap-3 text-xs font-semibold hover:bg-[#182229] transition-colors"
      >
        <Info className="w-4 h-4 text-emerald-400" />
        <span>Contact info</span>
      </button>

      {/* 2. Search */}
      <button
        onClick={() => {
          onClose();
          toast("Search in chat activated 🔍");
        }}
        className="w-full px-4 py-2 flex items-center gap-3 text-xs font-semibold hover:bg-[#182229] transition-colors"
      >
        <Search className="w-4 h-4 text-slate-400" />
        <span>Search</span>
      </button>

      {/* 3. Select messages */}
      <button
        onClick={() => {
          onClose();
          if (onToggleSelectMode) onToggleSelectMode();
          toast("Message selection enabled");
        }}
        className="w-full px-4 py-2 flex items-center gap-3 text-xs font-semibold hover:bg-[#182229] transition-colors"
      >
        <CheckSquare className="w-4 h-4 text-indigo-400" />
        <span>Select messages</span>
      </button>

      {/* 4. Mute notifications */}
      <div className="relative">
        <button
          onClick={() => setShowMuteSubmenu(!showMuteSubmenu)}
          className="w-full px-4 py-2 flex items-center justify-between text-xs font-semibold hover:bg-[#182229] transition-colors"
        >
          <div className="flex items-center gap-3">
            <BellOff className="w-4 h-4 text-slate-400" />
            <span>Mute notifications</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        </button>

        {showMuteSubmenu && (
          <div className="pl-9 pr-3 py-1 space-y-1 bg-[#182229]">
            {["8 hours", "1 week", "Always"].map((dur) => (
              <button
                key={dur}
                onClick={() => handleMute(dur)}
                className="w-full text-left py-1 text-[11px] text-slate-300 hover:text-emerald-400"
              >
                {dur}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 5. Disappearing messages */}
      <button
        onClick={() => {
          onClose();
          toast("Disappearing messages timer toggled (24h) ⏱️");
        }}
        className="w-full px-4 py-2 flex items-center gap-3 text-xs font-semibold hover:bg-[#182229] transition-colors"
      >
        <Clock className="w-4 h-4 text-amber-400" />
        <span>Disappearing messages</span>
      </button>

      {/* 6. Add to favourites */}
      <button
        onClick={() => {
          onClose();
          toast.success("Added to favourites ⭐");
        }}
        className="w-full px-4 py-2 flex items-center gap-3 text-xs font-semibold hover:bg-[#182229] transition-colors"
      >
        <Star className="w-4 h-4 text-amber-400" />
        <span>Add to favourites</span>
      </button>

      {/* 7. Add to list */}
      <button
        onClick={() => {
          onClose();
          toast("Added to custom contact list");
        }}
        className="w-full px-4 py-2 flex items-center gap-3 text-xs font-semibold hover:bg-[#182229] transition-colors"
      >
        <FolderPlus className="w-4 h-4 text-cyan-400" />
        <span>Add to list</span>
      </button>

      {/* 8. Export chat */}
      <button
        onClick={handleExportChat}
        className="w-full px-4 py-2 flex items-center gap-3 text-xs font-semibold hover:bg-[#182229] transition-colors"
      >
        <Download className="w-4 h-4 text-emerald-400" />
        <span>Export chat</span>
      </button>

      {/* 9. Close chat */}
      <button
        onClick={() => {
          onClose();
          setSelectedConversation(null);
        }}
        className="w-full px-4 py-2 flex items-center gap-3 text-xs font-semibold hover:bg-[#182229] transition-colors"
      >
        <X className="w-4 h-4 text-slate-400" />
        <span>Close chat</span>
      </button>

      <div className="h-px bg-slate-700/60 my-1" />

      {/* 10. Send call link */}
      <button
        onClick={() => {
          navigator.clipboard.writeText(`https://aryavarta.app/call/${selectedConversation?._id}`);
          toast.success("Call link copied to clipboard! 🔗");
          onClose();
        }}
        className="w-full px-4 py-2 flex items-center gap-3 text-xs font-semibold hover:bg-[#182229] transition-colors"
      >
        <Link className="w-4 h-4 text-indigo-400" />
        <span>Send call link</span>
      </button>

      {/* 11. Schedule call */}
      <button
        onClick={() => {
          toast("Call scheduled for tomorrow at 10:00 AM 📅");
          onClose();
        }}
        className="w-full px-4 py-2 flex items-center gap-3 text-xs font-semibold hover:bg-[#182229] transition-colors"
      >
        <Calendar className="w-4 h-4 text-purple-400" />
        <span>Schedule call</span>
      </button>

      {/* 12. New group call */}
      <button
        onClick={() => {
          toast.success("Starting group call with selected participants... 👥");
          onClose();
        }}
        className="w-full px-4 py-2 flex items-center gap-3 text-xs font-semibold hover:bg-[#182229] transition-colors"
      >
        <Users className="w-4 h-4 text-pink-400" />
        <span>New group call</span>
      </button>

      <div className="h-px bg-slate-700/60 my-1" />

      {/* 13. Report */}
      <button
        onClick={() => {
          toast.error("Contact reported");
          onClose();
        }}
        className="w-full px-4 py-2 flex items-center gap-3 text-xs font-semibold text-rose-400 hover:bg-rose-950/30 transition-colors"
      >
        <ThumbsDown className="w-4 h-4" />
        <span>Report</span>
      </button>

      {/* 14. Block */}
      <button
        onClick={() => {
          toast.error(`Blocked ${selectedConversation?.fullname}`);
          onClose();
        }}
        className="w-full px-4 py-2 flex items-center gap-3 text-xs font-semibold text-rose-400 hover:bg-rose-950/30 transition-colors"
      >
        <Slash className="w-4 h-4" />
        <span>Block</span>
      </button>

      {/* 15. Clear chat */}
      <button
        onClick={handleClearChat}
        className="w-full px-4 py-2 flex items-center gap-3 text-xs font-semibold text-rose-400 hover:bg-rose-950/30 transition-colors"
      >
        <Eraser className="w-4 h-4" />
        <span>Clear chat</span>
      </button>

      {/* 16. Delete chat */}
      <button
        onClick={handleDeleteChat}
        className="w-full px-4 py-2 flex items-center gap-3 text-xs font-semibold text-rose-400 hover:bg-rose-950/30 transition-colors"
      >
        <Trash2 className="w-4 h-4" />
        <span>Delete chat</span>
      </button>
    </div>
  );
};

export default ChatMenuDropdown;
