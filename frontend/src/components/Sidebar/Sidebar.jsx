import { useState, useRef, useEffect } from "react";
import SearchInput from "./SearchInput";
import Conversations from "./Conversations";
import NewGroupModal from "../Modals/NewGroupModal";
import LinkedDevicesModal from "../Modals/LinkedDevicesModal";
import BroadcastModal from "../Modals/BroadcastModal";
import ShareAppModal from "../Modals/ShareAppModal";
import ChannelsModal from "../Modals/ChannelsModal";
import CameraCaptureModal from "../Modals/CameraCaptureModal";
import {
  MoreVertical,
  Plus,
  Users,
  Camera,
  User,
  Megaphone,
  Radio,
  Laptop,
  Share2,
  Settings,
  Heart,
  ChevronRight,
  MessageSquarePlus,
  Lock
} from "lucide-react";
import { useAuthContext } from "../../context/AuthContext";
import { useChatContext } from "../../context/ChatContext";
import toast from "react-hot-toast";

const Sidebar = ({ onOpenNewChat, onLockApp, onSelectAI, isAISelected, onOpenSettings, onOpenProfile }) => {
  const [search, setSearch] = useState("");
  const [filterChip, setFilterChip] = useState("chats"); // "chats" | "channels"
  const [showMenu, setShowMenu] = useState(false);

  // Modals state
  const [showNewGroupModal, setShowNewGroupModal] = useState(false);
  const [showLinkedDevices, setShowLinkedDevices] = useState(false);
  const [showBroadcast, setShowBroadcast] = useState(false);
  const [showShareApp, setShowShareApp] = useState(false);
  const [showChannels, setShowChannels] = useState(false);
  const [showCamera, setShowCamera] = useState(false);

  const { authUser } = useAuthContext();
  const { sendMessage } = useChatContext();
  const menuRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <aside className="w-full md:w-80 lg:w-[350px] flex flex-col h-full min-h-0 bg-[#111b21] border-r border-slate-800/80 z-10 box-border select-none relative">
      {/* 1. Header matching screenshot: Aryavarta title + Camera + Profile + 3-dots Menu */}
      <div className="flex items-center justify-between px-4 py-3.5 flex-shrink-0">
        <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Aryavarta</h1>

        <div className="flex items-center gap-1.5 relative">
          {/* Camera Button */}
          <button
            onClick={() => setShowCamera(true)}
            className="p-2 rounded-full hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Camera"
          >
            <Camera className="w-5 h-5" />
          </button>

          {/* Profile Button */}
          <button
            onClick={onOpenProfile}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Profile"
          >
            <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-200">
              {authUser?.fullname?.[0] || <User className="w-3.5 h-3.5" />}
            </div>
          </button>

          {/* 3-dots Menu Button */}
          <button
            onClick={() => setShowMenu(!showMenu)}
            className={`p-2 rounded-full transition-colors cursor-pointer ${
              showMenu ? "text-white bg-slate-800" : "text-slate-300 hover:text-white hover:bg-slate-800"
            }`}
            title="Menu"
          >
            <MoreVertical className="w-5 h-5" />
          </button>

          {/* 3-dots Dropdown Menu matching screenshot 1:1 */}
          {showMenu && (
            <div
              ref={menuRef}
              className="absolute right-0 top-12 w-56 bg-[#1f2c34] border border-slate-700/80 rounded-2xl shadow-2xl py-2 z-50 animate-fade-in text-slate-200"
            >
              {/* 1. New group */}
              <button
                onClick={() => {
                  setShowMenu(false);
                  setShowNewGroupModal(true);
                }}
                className="w-full px-4 py-2.5 flex items-center gap-3.5 text-xs font-semibold hover:bg-[#111b21] transition-colors cursor-pointer"
              >
                <Users className="w-4 h-4 text-slate-300" />
                <span>New group</span>
              </button>

              {/* 2. Channels */}
              <button
                onClick={() => {
                  setShowMenu(false);
                  setShowChannels(true);
                }}
                className="w-full px-4 py-2.5 flex items-center gap-3.5 text-xs font-semibold hover:bg-[#111b21] transition-colors cursor-pointer"
              >
                <Megaphone className="w-4 h-4 text-slate-300" />
                <span>Channels</span>
              </button>

              {/* 3. Broadcasts */}
              <button
                onClick={() => {
                  setShowMenu(false);
                  setShowBroadcast(true);
                }}
                className="w-full px-4 py-2.5 flex items-center gap-3.5 text-xs font-semibold hover:bg-[#111b21] transition-colors cursor-pointer"
              >
                <Radio className="w-4 h-4 text-slate-300" />
                <span>Broadcasts</span>
              </button>

              {/* 4. Linked devices */}
              <button
                onClick={() => {
                  setShowMenu(false);
                  setShowLinkedDevices(true);
                }}
                className="w-full px-4 py-2.5 flex items-center gap-3.5 text-xs font-semibold hover:bg-[#111b21] transition-colors cursor-pointer"
              >
                <Laptop className="w-4 h-4 text-slate-300" />
                <span>Linked devices</span>
              </button>

              {/* 5. Share Aryavarta */}
              <button
                onClick={() => {
                  setShowMenu(false);
                  setShowShareApp(true);
                }}
                className="w-full px-4 py-2.5 flex items-center gap-3.5 text-xs font-semibold hover:bg-[#111b21] transition-colors cursor-pointer"
              >
                <Share2 className="w-4 h-4 text-slate-300" />
                <span>Share Aryavarta</span>
              </button>

              {/* 6. Settings */}
              <button
                onClick={() => {
                  setShowMenu(false);
                  if (onOpenSettings) onOpenSettings();
                }}
                className="w-full px-4 py-2.5 flex items-center gap-3.5 text-xs font-semibold hover:bg-[#111b21] transition-colors cursor-pointer"
              >
                <Settings className="w-4 h-4 text-slate-300" />
                <span>Settings</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 2. Search Input */}
      <div className="px-3 pb-2 flex-shrink-0">
        <SearchInput search={search} setSearch={setSearch} />
      </div>

      {/* 3. Filter Pills matching screenshot (Chats vs Channels) */}
      <div className="px-3 pb-2 flex items-center gap-2 flex-shrink-0">
        <button
          onClick={() => setFilterChip("chats")}
          className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
            filterChip === "chats"
              ? "bg-[#25396e] text-white shadow"
              : "bg-[#202c33] text-slate-400 hover:text-slate-200"
          }`}
        >
          Chats
        </button>

        <button
          onClick={() => {
            setFilterChip("channels");
            setShowChannels(true);
          }}
          className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
            filterChip === "channels"
              ? "bg-[#25396e] text-white shadow"
              : "bg-[#202c33] text-slate-400 hover:text-slate-200"
          }`}
        >
          Channels
        </button>
      </div>

      {/* 4. Conversations List */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <Conversations
          searchQuery={search}
          filterChip="all"
          onSelectAI={onSelectAI}
          isAISelected={isAISelected}
        />

        {/* 5. "Invite friends" Card matching screenshot */}
        <div
          onClick={() => setShowShareApp(true)}
          className="m-3 p-3.5 bg-[#182229] hover:bg-[#202c33] border border-slate-750/70 rounded-2xl flex items-center justify-between cursor-pointer transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#5c7cd8]/20 text-[#8ba3c7] flex items-center justify-center">
              <Heart className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Invite friends</h4>
              <p className="text-[11px] text-slate-400">Connect with your friends on Aryavarta</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500" />
        </div>
      </div>

      {/* 6. Floating Action Button (FAB) matching screenshot */}
      <button
        onClick={onOpenNewChat}
        className="absolute bottom-6 right-6 w-14 h-14 rounded-2xl bg-[#5c7cd8] hover:bg-[#4a6ac6] text-white shadow-2xl flex items-center justify-center transition-transform hover:scale-110 active:scale-90 cursor-pointer z-20"
        title="Start New Chat"
      >
        <MessageSquarePlus className="w-6 h-6" />
      </button>

      {/* Modals */}
      {showNewGroupModal && (
        <NewGroupModal onClose={() => setShowNewGroupModal(false)} />
      )}

      {showLinkedDevices && (
        <LinkedDevicesModal onClose={() => setShowLinkedDevices(false)} />
      )}

      {showBroadcast && (
        <BroadcastModal onClose={() => setShowBroadcast(false)} />
      )}

      {showShareApp && (
        <ShareAppModal onClose={() => setShowShareApp(false)} />
      )}

      {showChannels && (
        <ChannelsModal onClose={() => setShowChannels(false)} />
      )}

      {showCamera && (
        <CameraCaptureModal
          onDirectSend={(photoUrl) => {
            setShowCamera(false);
            sendMessage(`🖼️ [Image]: ${photoUrl}`);
            toast.success("Photo clicked & sent! 📸⚡");
          }}
          onClose={() => setShowCamera(false)}
        />
      )}
    </aside>
  );
};

export default Sidebar;
