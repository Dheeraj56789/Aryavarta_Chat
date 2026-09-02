import { useState } from "react";
import { useAuthContext } from "../../context/AuthContext";
import {
  Laptop,
  User,
  KeyRound,
  Lock,
  MessageSquare,
  Video,
  Bell,
  Keyboard,
  HelpCircle,
  Search,
  ChevronRight,
  ShieldCheck
} from "lucide-react";

const SETTINGS_CATEGORIES = [
  { id: "general", label: "General", desc: "Startup and close", icon: Laptop },
  { id: "profile", label: "Profile", desc: "Name, profile picture, username", icon: User },
  { id: "account", label: "Account", desc: "Security notifications, account info", icon: KeyRound },
  { id: "privacy", label: "Privacy", desc: "Blocked contacts, disappearing messages, lock", icon: Lock },
  { id: "chats", label: "Chats", desc: "Theme, wallpaper, chat settings", icon: MessageSquare },
  { id: "voice", label: "Video & voice", desc: "Camera, microphone & speakers", icon: Video },
  { id: "notifications", label: "Notifications", desc: "Messages, groups, sounds", icon: Bell },
  { id: "shortcuts", label: "Keyboard shortcuts", desc: "Quick navigation hotkeys", icon: Keyboard },
  { id: "help", label: "Help & About", desc: "Aryavarta Chat Application details", icon: HelpCircle }
];

const SettingsSidebar = ({ activeCategory, setActiveCategory }) => {
  const { authUser } = useAuthContext();
  const [search, setSearch] = useState("");

  const filtered = SETTINGS_CATEGORIES.filter(
    (c) =>
      c.label.toLowerCase().includes(search.toLowerCase()) ||
      c.desc.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <aside className="w-full md:w-80 lg:w-[350px] flex flex-col h-full min-h-0 bg-[#111b21] border-r border-slate-800/80 z-10 box-border">
      {/* Settings Header */}
      <div className="px-4 pt-4 pb-2 flex-shrink-0">
        <h1 className="text-xl font-bold text-slate-100 tracking-tight mb-3">Settings</h1>

        {/* User Card */}
        <div
          onClick={() => setActiveCategory("profile")}
          className="flex items-center gap-3.5 p-3 rounded-2xl bg-[#202c33] hover:bg-[#2a3942] cursor-pointer transition-all border border-slate-750/50 mb-3"
        >
          <div className="relative flex-shrink-0">
            <img
              src={
                authUser?.profilepic ||
                `https://avatar.iran.liara.run/public/${authUser?.gender === "female" ? "girl" : "boy"}?username=${encodeURIComponent(authUser?.username || "user")}`
              }
              alt={authUser?.fullname}
              className="w-12 h-12 rounded-full object-cover bg-slate-800 border-2 border-emerald-500/50 shadow"
            />
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-[#111b21] rounded-full" />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-slate-100 truncate">{authUser?.fullname || "User Profile"}</h3>
            <p className="text-xs text-emerald-400 font-medium truncate">@{authUser?.username || "username"}</p>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </div>

        {/* Search Settings Input */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search settings"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#202c33] rounded-xl text-sm text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
          />
        </div>
      </div>

      {/* Settings Menu List */}
      <div className="flex-1 min-h-0 overflow-y-auto px-2 py-2 space-y-1">
        {filtered.map((cat) => {
          const Icon = cat.icon;
          const isSelected = activeCategory === cat.id;
          return (
            <div
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-3.5 px-3 py-3 rounded-2xl cursor-pointer transition-all ${
                isSelected
                  ? "bg-[#2a3942] text-white shadow"
                  : "hover:bg-[#202c33] text-slate-300"
              }`}
            >
              <div
                className={`p-2 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  isSelected
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "bg-slate-800/60 text-slate-400 group-hover:text-slate-200"
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="text-xs md:text-sm font-semibold truncate leading-tight">{cat.label}</h4>
                <p className="text-[11px] text-slate-400 truncate mt-0.5">{cat.desc}</p>
              </div>

              {isSelected && (
                <div className="w-1.5 h-6 bg-emerald-500 rounded-full flex-shrink-0" />
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
};

export default SettingsSidebar;
