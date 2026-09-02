import { MessageSquare, Phone, Radio, Users2, Sparkles, Star, Settings, Calendar } from "lucide-react";
import { useAuthContext } from "../../context/AuthContext";
import { useChatContext } from "../../context/ChatContext";

const NavRail = ({ activeNav, setActiveNav, onOpenProfile }) => {
  const { authUser } = useAuthContext();
  const { conversations } = useChatContext();

  const totalUnread = conversations.length > 0 ? conversations.length : 0;

  return (
    <div className="w-14 md:w-16 h-full flex flex-col items-center justify-between py-3 bg-[#0d131f] border-r border-slate-800/80 flex-shrink-0 z-20 box-border">
      {/* Top Navigation Icons */}
      <div className="flex flex-col items-center gap-1.5 w-full">
        {/* Chats Tab */}
        <button
          onClick={() => setActiveNav("chats")}
          title="Chats"
          className={`relative p-2.5 rounded-xl transition-all ${
            activeNav === "chats"
              ? "bg-slate-800 text-emerald-400 shadow-md"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
          }`}
        >
          <MessageSquare className="w-5 h-5" />
          {totalUnread > 0 && (
            <span className="absolute -top-0.5 -right-0.5 bg-emerald-500 text-[#0b0f19] text-[10px] font-bold px-1.5 py-0.2 rounded-full min-w-[18px] text-center shadow">
              {totalUnread}
            </span>
          )}
        </button>

        {/* Meetings Tab (Matching Screenshot 1:1) */}
        <button
          onClick={() => setActiveNav("meetings")}
          title="Meetings"
          className={`p-2.5 rounded-xl transition-all ${
            activeNav === "meetings"
              ? "bg-[#25396e] text-white shadow-md ring-1 ring-blue-500/50"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
          }`}
        >
          <Calendar className="w-5 h-5" />
        </button>

        {/* Calls Tab */}
        <button
          onClick={() => setActiveNav("calls")}
          title="Calls"
          className={`p-2.5 rounded-xl transition-all ${
            activeNav === "calls"
              ? "bg-slate-800 text-emerald-400 shadow-md"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
          }`}
        >
          <Phone className="w-5 h-5" />
        </button>

        {/* Status / Stories Tab */}
        <button
          onClick={() => setActiveNav("status")}
          title="Status & Stories"
          className={`p-2.5 rounded-xl transition-all ${
            activeNav === "status"
              ? "bg-slate-800 text-emerald-400 shadow-md"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
          }`}
        >
          <Radio className="w-5 h-5" />
        </button>

        {/* Communities / Groups Tab */}
        <button
          onClick={() => setActiveNav("communities")}
          title="Communities"
          className={`p-2.5 rounded-xl transition-all ${
            activeNav === "communities"
              ? "bg-slate-800 text-emerald-400 shadow-md"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
          }`}
        >
          <Users2 className="w-5 h-5" />
        </button>

        {/* Aryavarta AI Sparkle (WhatsApp style purple glowing icon) */}
        <button
          onClick={() => setActiveNav("ai")}
          title="Ask Aryavarta AI Assistant"
          className={`relative p-2.5 rounded-xl transition-all my-1 group ${
            activeNav === "ai"
              ? "bg-purple-950/70 text-purple-300 ring-2 ring-purple-500/60 shadow-lg shadow-purple-500/30"
              : "text-purple-400 hover:bg-purple-950/40 hover:text-purple-300"
          }`}
        >
          <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-purple-500 via-pink-500 to-indigo-500 p-0.5 flex items-center justify-center animate-spin-slow">
            <div className="w-full h-full bg-[#0d131f] rounded-full flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-purple-300" />
            </div>
          </div>
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-purple-400 rounded-full animate-ping" />
        </button>

        {/* Starred Messages */}
        <button
          onClick={() => setActiveNav("starred")}
          title="Starred Messages"
          className={`p-2.5 rounded-xl transition-all ${
            activeNav === "starred"
              ? "bg-slate-800 text-amber-400 shadow-md"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
          }`}
        >
          <Star className="w-5 h-5" />
        </button>
      </div>

      {/* Bottom Icons */}
      <div className="flex flex-col items-center gap-2 w-full">
        {/* Settings Tab */}
        <button
          onClick={() => setActiveNav("settings")}
          title="Settings"
          className={`p-2.5 rounded-xl transition-all ${
            activeNav === "settings"
              ? "bg-slate-800 text-emerald-400 shadow-md"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
          }`}
        >
          <Settings className="w-5 h-5" />
        </button>

        {/* Profile Avatar */}
        <button
          onClick={onOpenProfile}
          title="Profile & Account"
          className="relative p-0.5 rounded-full ring-1 ring-slate-700 hover:ring-emerald-500 transition-all cursor-pointer"
        >
          <img
            src={
              authUser?.profilepic ||
              `https://avatar.iran.liara.run/public/${authUser?.gender === "female" ? "girl" : "boy"}?username=${encodeURIComponent(authUser?.username || "user")}`
            }
            alt="Profile"
            className="w-8 h-8 rounded-full object-cover bg-slate-800"
          />
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-[#0d131f] rounded-full" />
        </button>
      </div>
    </div>
  );
};

export default NavRail;
