import { useSocketContext } from "../../context/SocketContext";
import { formatMessageTime } from "../../utils/formatTime";
import { CheckCheck, Users } from "lucide-react";

const ConversationItem = ({ user, isSelected, onClick, onContextMenu, unreadCount }) => {
  const { onlineUsers } = useSocketContext();
  const isOnline = onlineUsers.includes(user._id);

  return (
    <div
      onClick={onClick}
      onContextMenu={onContextMenu}
      className={`group relative flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-all border-b border-slate-800/40 select-none ${
        isSelected
          ? "bg-[#2a3942] text-white"
          : "hover:bg-[#202c33] text-slate-300"
      }`}
    >
      {/* Avatar with Online/Group status */}
      <div className="relative flex-shrink-0">
        <img
          src={
            user.profilepic ||
            `https://avatar.iran.liara.run/public/${user.gender === "female" ? "girl" : "boy"}?username=${encodeURIComponent(user.username)}`
          }
          alt={user.fullname}
          className="w-12 h-12 rounded-full object-cover bg-slate-800 border border-slate-700/60"
        />
        {isOnline && !user.isGroup && (
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-[#111b21] rounded-full" />
        )}
        {user.isGroup && (
          <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-indigo-600 border-2 border-[#111b21] rounded-full flex items-center justify-center text-[9px] text-white">
            <Users className="w-2.5 h-2.5" />
          </span>
        )}
      </div>

      {/* User Info, Message Snippet & Unread Badge */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h4 className="text-sm font-semibold text-slate-100 truncate">
            {user.fullname}
          </h4>
          <span className="text-[11px] text-slate-400 flex-shrink-0">
            {user.lastMessageTime ? formatMessageTime(user.lastMessageTime) : "12:53 pm"}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 min-w-0 pr-2">
            {!user.isGroup && <CheckCheck className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />}
            <p className="text-xs text-slate-400 truncate">
              {user.lastMessage || (user.isGroup ? "Group created" : `@${user.username}`)}
            </p>
          </div>

          {/* WhatsApp Style Green Pill Badge */}
          {unreadCount && unreadCount > 0 ? (
            <span className="px-1.5 py-0.2 bg-[#00a884] text-[#111b21] font-bold text-[10px] rounded-full min-w-[18px] text-center flex-shrink-0">
              {unreadCount}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default ConversationItem;
