import { useState } from "react";
import { useChatContext } from "../../context/ChatContext";
import { useSocketContext } from "../../context/SocketContext";
import { ArrowLeft, Phone, Video, Search, MoreVertical } from "lucide-react";
import ChatMenuDropdown from "./ChatMenuDropdown";
import toast from "react-hot-toast";

const ChatHeader = ({ onOpenContactInfo, onToggleSelectMode }) => {
  const { selectedConversation, setSelectedConversation, isCurrentChatTyping } = useChatContext();
  const { onlineUsers } = useSocketContext();
  const [showMenu, setShowMenu] = useState(false);

  if (!selectedConversation) return null;

  const isOnline = onlineUsers.includes(selectedConversation._id);

  const startVoiceCall = () => {
    toast.success(`Voice call with ${selectedConversation.fullname}... 📞`);
  };

  const startVideoCall = () => {
    toast.success(`Video call with ${selectedConversation.fullname}... 📹`);
  };

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-[#202c33] border-b border-slate-700/50 flex-shrink-0 z-20 relative box-border">
      {/* Contact Profile (Clickable to open Contact Info Drawer) */}
      <div
        onClick={onOpenContactInfo}
        className="flex items-center gap-3 cursor-pointer group flex-1 min-w-0 mr-2"
      >
        {/* Mobile back button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setSelectedConversation(null);
          }}
          className="md:hidden p-1.5 -ml-1 rounded-xl text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          title="Back to chats"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Recipient Avatar */}
        <div className="relative flex-shrink-0">
          <img
            src={
              selectedConversation.profilepic ||
              `https://avatar.iran.liara.run/public/${selectedConversation.gender === "female" ? "girl" : "boy"}?username=${encodeURIComponent(selectedConversation.username)}`
            }
            alt={selectedConversation.fullname}
            className="w-10 h-10 rounded-full object-cover bg-slate-800"
          />
          {isOnline && !selectedConversation.isGroup && (
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-[#202c33] rounded-full" />
          )}
        </div>

        {/* Contact info & status */}
        <div className="min-w-0">
          <h3 className="text-sm md:text-base font-semibold text-slate-100 group-hover:text-emerald-400 transition-colors truncate leading-tight">
            {selectedConversation.fullname}
          </h3>
          <div className="mt-0.5">
            {isCurrentChatTyping ? (
              <span className="text-xs text-[#00a884] font-semibold animate-pulse">
                typing...
              </span>
            ) : (
              <span className="text-xs text-slate-400">
                {isOnline ? "online" : "last seen recently"}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons: Video, Call, Search, 3-dots Menu */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <button
          onClick={startVideoCall}
          className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-700/60 transition-colors"
          title="Video call"
        >
          <Video className="w-5 h-5" />
        </button>

        <button
          onClick={startVoiceCall}
          className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-700/60 transition-colors"
          title="Voice call"
        >
          <Phone className="w-5 h-5" />
        </button>

        <button
          onClick={() => toast("Search in chat activated 🔍")}
          className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-700/60 transition-colors"
          title="Search in chat"
        >
          <Search className="w-5 h-5" />
        </button>

        {/* 3-dots Kebab Menu Button */}
        <button
          onClick={() => setShowMenu(!showMenu)}
          className={`p-2 rounded-xl transition-colors ${
            showMenu ? "text-white bg-slate-700" : "text-slate-300 hover:text-white hover:bg-slate-700/60"
          }`}
          title="Menu"
        >
          <MoreVertical className="w-5 h-5" />
        </button>

        {/* Dropdown Menu */}
        {showMenu && (
          <ChatMenuDropdown
            onClose={() => setShowMenu(false)}
            onOpenContactInfo={onOpenContactInfo}
            onToggleSelectMode={onToggleSelectMode}
          />
        )}
      </div>
    </div>
  );
};

export default ChatHeader;
