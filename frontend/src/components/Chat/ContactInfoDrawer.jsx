import { useState } from "react";
import { useChatContext } from "../../context/ChatContext";
import { useSocketContext } from "../../context/SocketContext";
import {
  X,
  Phone,
  Video,
  Search,
  Lock,
  Star,
  Clock,
  Shield,
  Users,
  Slash,
  ThumbsDown,
  Trash2,
  ChevronRight,
  Edit2,
  Image as ImageIcon
} from "lucide-react";
import toast from "react-hot-toast";

const SAMPLE_MEDIA = [
  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=200&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=200&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=200&auto=format&fit=crop&q=60"
];

const ContactInfoDrawer = ({ onClose }) => {
  const { selectedConversation } = useChatContext();
  const { onlineUsers } = useSocketContext();
  const [disappearingTimer, setDisappearingTimer] = useState("off");
  const [isMuted, setIsMuted] = useState(false);
  const [isStarred, setIsStarred] = useState(false);

  if (!selectedConversation) return null;

  const isOnline = onlineUsers.includes(selectedConversation._id);

  const startVoiceCall = () => {
    toast.success(`Voice call initiated with ${selectedConversation.fullname} 📞`);
  };

  const startVideoCall = () => {
    toast.success(`Video call initiated with ${selectedConversation.fullname} 📹`);
  };

  return (
    <div className="w-full md:w-80 lg:w-[340px] h-full flex flex-col bg-[#111b21] border-l border-slate-800/80 z-20 flex-shrink-0 animate-fade-in overflow-hidden box-border">
      {/* Drawer Header */}
      <div className="flex items-center justify-between px-4 py-3.5 bg-[#202c33] border-b border-slate-700/50 flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <h3 className="text-sm font-semibold text-slate-100">Contact info</h3>
        </div>

        <button
          onClick={() => toast("Editing contact details")}
          className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
        >
          <Edit2 className="w-4 h-4" />
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 min-h-0 overflow-y-auto space-y-2 p-3">
        {/* Profile Card matching Screenshot 2 */}
        <div className="flex flex-col items-center text-center p-5 bg-[#111b21] rounded-2xl border border-slate-800/60 shadow">
          <div className="relative mb-3">
            <img
              src={
                selectedConversation.profilepic ||
                `https://avatar.iran.liara.run/public/${selectedConversation.gender === "female" ? "girl" : "boy"}?username=${encodeURIComponent(selectedConversation.username)}`
              }
              alt={selectedConversation.fullname}
              className="w-28 h-28 rounded-full object-cover border-2 border-slate-700 shadow-xl"
            />
            {isOnline && (
              <span className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 border-2 border-[#111b21] rounded-full" />
            )}
          </div>

          <h2 className="text-base font-bold text-slate-100">{selectedConversation.fullname}</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {selectedConversation.email || `+91 95597 ${Math.floor(10000 + Math.random() * 90000)}`}
          </p>
          <p className="text-[11px] text-emerald-400 font-medium mt-0.5">@{selectedConversation.username}</p>

          {/* Quick Action Buttons (Voice, Video, Search) */}
          <div className="flex items-center justify-center gap-6 mt-4 pt-3 border-t border-slate-800/80 w-full">
            <div className="flex flex-col items-center gap-1 cursor-pointer group" onClick={startVoiceCall}>
              <div className="w-10 h-10 rounded-full bg-[#202c33] group-hover:bg-[#2a3942] flex items-center justify-center text-emerald-400 transition-colors">
                <Phone className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-medium text-slate-300">Voice</span>
            </div>

            <div className="flex flex-col items-center gap-1 cursor-pointer group" onClick={startVideoCall}>
              <div className="w-10 h-10 rounded-full bg-[#202c33] group-hover:bg-[#2a3942] flex items-center justify-center text-indigo-400 transition-colors">
                <Video className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-medium text-slate-300">Video</span>
            </div>

            <div
              className="flex flex-col items-center gap-1 cursor-pointer group"
              onClick={() => toast("Search messages in this chat")}
            >
              <div className="w-10 h-10 rounded-full bg-[#202c33] group-hover:bg-[#2a3942] flex items-center justify-center text-slate-300 transition-colors">
                <Search className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-medium text-slate-300">Search</span>
            </div>
          </div>
        </div>

        {/* About Section */}
        <div className="p-4 bg-[#111b21] rounded-2xl border border-slate-800/60">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">About</span>
          <p className="text-sm font-medium text-slate-200 mt-1">
            {selectedConversation.about || `Available | Using Aryavarta 🚀`}
          </p>
        </div>

        {/* Media, links and docs matching Screenshot 2 */}
        <div className="p-4 bg-[#111b21] rounded-2xl border border-slate-800/60 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
              <ImageIcon className="w-4 h-4 text-slate-400" />
              <span>Media, links and docs</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-slate-400 hover:text-white cursor-pointer">
              <span>39</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {SAMPLE_MEDIA.map((src, i) => (
              <div key={i} className="aspect-square rounded-xl overflow-hidden bg-slate-800 border border-slate-700/60">
                <img src={src} alt="media" className="w-full h-full object-cover hover:scale-110 transition-transform cursor-pointer" />
              </div>
            ))}
          </div>
        </div>

        {/* Action Items List */}
        <div className="p-2 bg-[#111b21] rounded-2xl border border-slate-800/60 space-y-1">
          {/* Starred */}
          <div
            onClick={() => {
              setIsStarred(!isStarred);
              toast(isStarred ? "Removed from favourites" : "Added to favourites ⭐");
            }}
            className="flex items-center justify-between p-3 rounded-xl hover:bg-[#202c33] cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-3">
              <Star className={`w-4 h-4 ${isStarred ? "text-amber-400 fill-amber-400" : "text-slate-400"}`} />
              <span className="text-xs font-semibold text-slate-200">Starred messages</span>
            </div>
            <span className="text-xs text-slate-500">None</span>
          </div>

          {/* Disappearing Messages */}
          <div
            onClick={() => {
              const next = disappearingTimer === "off" ? "24h" : disappearingTimer === "24h" ? "7d" : "off";
              setDisappearingTimer(next);
              toast.success(`Disappearing messages set to: ${next.toUpperCase()}`);
            }}
            className="flex items-center justify-between p-3 rounded-xl hover:bg-[#202c33] cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-slate-400" />
              <div>
                <p className="text-xs font-semibold text-slate-200">Disappearing messages</p>
                <p className="text-[10px] text-slate-400">{disappearingTimer.toUpperCase()}</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </div>

          {/* Encryption */}
          <div
            onClick={() => toast("End-to-end 256-bit encryption verified with this contact 🔒")}
            className="flex items-center justify-between p-3 rounded-xl hover:bg-[#202c33] cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-3">
              <Lock className="w-4 h-4 text-emerald-400" />
              <div>
                <p className="text-xs font-semibold text-slate-200">Encryption</p>
                <p className="text-[10px] text-slate-400">Messages are end-to-end encrypted</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </div>

          {/* Common Groups */}
          <div
            onClick={() => toast("1 group in common: Coding Club India")}
            className="flex items-center justify-between p-3 rounded-xl hover:bg-[#202c33] cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-3">
              <Users className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-semibold text-slate-200">Groups in common</span>
            </div>
            <span className="text-xs text-slate-400">1</span>
          </div>
        </div>

        {/* Block and Report Buttons */}
        <div className="p-2 bg-[#111b21] rounded-2xl border border-slate-800/60 space-y-1">
          <button
            onClick={() => toast.error(`Blocked ${selectedConversation.fullname}`)}
            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-rose-950/30 text-rose-400 transition-colors text-xs font-bold"
          >
            <Slash className="w-4 h-4" />
            <span>Block {selectedConversation.fullname}</span>
          </button>

          <button
            onClick={() => toast.error(`Reported ${selectedConversation.fullname}`)}
            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-rose-950/30 text-rose-400 transition-colors text-xs font-bold"
          >
            <ThumbsDown className="w-4 h-4" />
            <span>Report contact</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContactInfoDrawer;
