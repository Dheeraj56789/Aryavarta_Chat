import { useAuthContext } from "../../context/AuthContext";
import { useChatContext } from "../../context/ChatContext";
import { LogOut, Volume2, VolumeX, User as UserIcon } from "lucide-react";

const UserProfileBar = ({ onOpenProfile }) => {
  const { authUser, logout } = useAuthContext();
  const { soundEnabled, setSoundEnabled } = useChatContext();

  if (!authUser) return null;

  return (
    <div className="flex items-center justify-between p-3 bg-slate-900/70 border border-slate-800/80 rounded-2xl mt-auto">
      {/* User Info & Avatar */}
      <div
        onClick={onOpenProfile}
        className="flex items-center gap-3 cursor-pointer group flex-1 min-w-0 mr-2"
      >
        <div className="relative flex-shrink-0">
          <img
            src={
              authUser.profilepic ||
              `https://avatar.iran.liara.run/public/${authUser.gender === "female" ? "girl" : "boy"}?username=${encodeURIComponent(authUser.username)}`
            }
            alt={authUser.fullname}
            className="w-10 h-10 rounded-xl object-cover bg-slate-800 border border-slate-700 group-hover:border-indigo-500 transition-colors"
          />
          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-[#0f172a] rounded-full glow-emerald" />
        </div>

        <div className="min-w-0">
          <h4 className="text-sm font-semibold text-slate-200 truncate group-hover:text-indigo-300 transition-colors">
            {authUser.fullname}
          </h4>
          <p className="text-xs text-slate-500 truncate">@{authUser.username}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        {/* Sound Toggle */}
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          title={soundEnabled ? "Mute sound effects" : "Enable sound effects"}
          className={`p-2 rounded-xl transition-all ${
            soundEnabled
              ? "text-indigo-400 hover:bg-indigo-950/50"
              : "text-slate-500 hover:bg-slate-800"
          }`}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* Profile Details */}
        <button
          onClick={onOpenProfile}
          title="Account Details"
          className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-all"
        >
          <UserIcon className="w-4 h-4" />
        </button>

        {/* Logout */}
        <button
          onClick={logout}
          title="Log out"
          className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-all"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default UserProfileBar;
