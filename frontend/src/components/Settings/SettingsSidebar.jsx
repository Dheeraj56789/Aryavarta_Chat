import { useState, useRef, useEffect } from "react";
import { useAuthContext } from "../../context/AuthContext";
import {
  ArrowLeft,
  Search,
  QrCode,
  Pencil,
  PlusCircle,
  IndianRupee,
  Diamond,
  Laptop,
  KeyRound,
  Lock,
  Users,
  MessageSquare,
  Palette,
  Radio,
  Bell,
  HardDrive,
  Shield,
  PersonStanding,
  Globe,
  HelpCircle,
  UserPlus,
  PhoneCall,
  ChevronRight,
  X
} from "lucide-react";
import UserQRCodeModal from "../Modals/UserQRCodeModal";
import StatusMoodModal from "../Modals/StatusMoodModal";
import LinkedDevicesModal from "../Modals/LinkedDevicesModal";
import PaymentsModal from "../Modals/PaymentsModal";
import SubscriptionsModal from "../Modals/SubscriptionsModal";
import ListsModal from "../Modals/ListsModal";
import BroadcastModal from "../Modals/BroadcastModal";
import ShareAppModal from "../Modals/ShareAppModal";

const SettingsSidebar = ({ activeCategory, setActiveCategory, onBack }) => {
  const { authUser, setAuthUser } = useAuthContext();

  // Scroll detection for dynamic title in top bar
  const scrollRef = useRef(null);
  const [isScrolled, setIsScrolled] = useState(false);

  // Search state
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Modals state
  const [showQRModal, setShowQRModal] = useState(false);
  const [showMoodModal, setShowMoodModal] = useState(false);
  const [showLinkedDevicesModal, setShowLinkedDevicesModal] = useState(false);
  const [showPaymentsModal, setShowPaymentsModal] = useState(false);
  const [showSubscriptionsModal, setShowSubscriptionsModal] = useState(false);
  const [showListsModal, setShowListsModal] = useState(false);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  // Status text matching screenshot ("I'm feeling...")
  const [userStatus, setUserStatus] = useState(() => {
    return authUser?.status || localStorage.getItem("aryavarta_user_status") || "I'm feeling...";
  });

  const handleSaveStatus = (newStatus) => {
    setUserStatus(newStatus);
    localStorage.setItem("aryavarta_user_status", newStatus);
    if (authUser) {
      const updated = { ...authUser, status: newStatus };
      setAuthUser(updated);
      localStorage.setItem("chat-user", JSON.stringify(updated));
    }
  };

  const handleScroll = () => {
    if (scrollRef.current) {
      setIsScrolled(scrollRef.current.scrollTop > 90);
    }
  };

  // Full menu list matching screenshots exactly
  const MENU_ITEMS = [
    {
      id: "payments",
      title: "Payments",
      subtitle: "",
      icon: IndianRupee,
      iconBg: "bg-slate-700 text-slate-200",
      action: () => setShowPaymentsModal(true)
    },
    {
      id: "subscriptions",
      title: "Subscriptions",
      subtitle: "Explore premium benefits",
      icon: Diamond,
      iconBg: "bg-indigo-500/20 text-indigo-400",
      action: () => setShowSubscriptionsModal(true)
    },
    {
      id: "linked_devices",
      title: "Linked devices",
      subtitle: "Use Aryavarta on other devices",
      icon: Laptop,
      iconBg: "bg-slate-800 text-slate-300",
      action: () => setShowLinkedDevicesModal(true)
    },
    {
      id: "account",
      title: "Account",
      subtitle: "Security notifications, change number",
      icon: KeyRound,
      iconBg: "bg-slate-800 text-slate-300",
      action: () => setActiveCategory("account")
    },
    {
      id: "privacy",
      title: "Privacy",
      subtitle: "Blocked accounts, disappearing messages",
      icon: Lock,
      iconBg: "bg-slate-800 text-slate-300",
      action: () => setActiveCategory("privacy")
    },
    {
      id: "lists",
      title: "Lists",
      subtitle: "Manage people and groups",
      icon: Users,
      iconBg: "bg-slate-800 text-slate-300",
      action: () => setShowListsModal(true)
    },
    {
      id: "chats",
      title: "Chats",
      subtitle: "Chat history, backup",
      icon: MessageSquare,
      iconBg: "bg-slate-800 text-slate-300",
      action: () => setActiveCategory("chats")
    },
    {
      id: "appearance",
      title: "Appearance",
      subtitle: "Chat theme, app icon, app theme",
      icon: Palette,
      iconBg: "bg-purple-500/20 text-purple-400",
      action: () => setActiveCategory("appearance")
    },
    {
      id: "broadcasts",
      title: "Broadcasts",
      subtitle: "Manage lists and send broadcasts",
      icon: Radio,
      iconBg: "bg-cyan-500/20 text-cyan-400",
      action: () => setShowBroadcastModal(true)
    },
    {
      id: "calls_meetings",
      title: "Calls & Meetings",
      subtitle: "Caller tunes, video & meeting preferences",
      icon: PhoneCall,
      iconBg: "bg-blue-500/20 text-blue-400",
      action: () => setActiveCategory("calls_meetings")
    },
    {
      id: "notifications",
      title: "Notifications",
      subtitle: "Message, group & call tones",
      icon: Bell,
      iconBg: "bg-slate-800 text-slate-300",
      action: () => setActiveCategory("notifications")
    },
    {
      id: "storage",
      title: "Storage and data",
      subtitle: "Network usage, auto-download",
      icon: HardDrive,
      iconBg: "bg-slate-800 text-slate-300",
      action: () => setActiveCategory("storage")
    },
    {
      id: "parental",
      title: "Parental controls",
      subtitle: "Settings for your family",
      icon: Shield,
      iconBg: "bg-slate-800 text-slate-300",
      action: () => setActiveCategory("parental")
    },
    {
      id: "accessibility",
      title: "Accessibility",
      subtitle: "Increase contrast, animation",
      icon: PersonStanding,
      iconBg: "bg-slate-800 text-slate-300",
      action: () => setActiveCategory("accessibility")
    },
    {
      id: "language",
      title: "App language",
      subtitle: "English (device's language)",
      icon: Globe,
      iconBg: "bg-slate-800 text-slate-300",
      action: () => setActiveCategory("language")
    },
    {
      id: "help",
      title: "Help and feedback",
      subtitle: "Help center, contact us, privacy policy",
      icon: HelpCircle,
      iconBg: "bg-slate-800 text-slate-300",
      action: () => setActiveCategory("help")
    },
    {
      id: "invite",
      title: "Invite a friend",
      subtitle: "",
      icon: UserPlus,
      iconBg: "bg-pink-500/20 text-pink-400",
      action: () => setShowShareModal(true)
    }
  ];

  const filteredItems = MENU_ITEMS.filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <aside className="w-full md:w-80 lg:w-[350px] flex flex-col h-full min-h-0 bg-[#0c1317] border-r border-slate-800/80 z-10 box-border select-none">
      {/* 1. Upper Top Bar (Matching Screenshot 1 & 2) */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/50 bg-[#111b21] flex-shrink-0">
        {/* Left: Back button + Dynamic title on scroll */}
        <div className="flex items-center gap-3 min-w-0 pr-2">
          <button
            onClick={onBack}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer flex-shrink-0"
            title="Back to chats"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          {/* Name appears on scroll like in Screenshot 1 */}
          <h2
            className={`text-base font-bold text-white tracking-tight truncate transition-opacity duration-200 ${
              isScrolled ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            {authUser?.fullname || "Dheeraj Singh"}
          </h2>
        </div>

        {/* Right Action Icons: Search, QR Code, Edit Pencil */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={() => setSearchOpen((prev) => !prev)}
            className={`p-2 rounded-full transition-colors cursor-pointer ${
              searchOpen
                ? "bg-emerald-500/20 text-emerald-400"
                : "text-slate-300 hover:text-white hover:bg-slate-800"
            }`}
            title="Search settings"
          >
            <Search className="w-5 h-5" />
          </button>

          <button
            onClick={() => setShowQRModal(true)}
            className="p-2 rounded-full text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="My QR Code"
          >
            <QrCode className="w-5 h-5" />
          </button>

          <button
            onClick={() => setActiveCategory("profile")}
            className="p-2 rounded-full text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Edit Profile"
          >
            <Pencil className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Optional Search Bar Input */}
      {searchOpen && (
        <div className="px-4 py-2 bg-[#111b21] border-b border-slate-800/60 flex items-center gap-2 animate-fadeIn flex-shrink-0">
          <input
            type="text"
            autoFocus
            placeholder="Search settings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
          <button
            onClick={() => {
              setSearchQuery("");
              setSearchOpen(false);
            }}
            className="p-1 rounded-lg text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 2. Scrollable Body */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 min-h-0 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800"
      >
        {/* Profile & Status Header with Doodle Pattern */}
        <div className="relative pt-6 pb-6 px-4 flex flex-col items-center bg-gradient-to-b from-[#18232c] via-[#10171d] to-[#0c1317] border-b border-slate-800/60 overflow-hidden">
          {/* Subtle chat doodle background overlay */}
          <div
            className="absolute inset-0 opacity-[0.07] pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(#ffffff 1px, transparent 1px)`,
              backgroundSize: "16px 16px"
            }}
          />

          {/* Thought Bubble ("I'm feeling...") */}
          <div
            onClick={() => setShowMoodModal(true)}
            className="relative mb-2 cursor-pointer group animate-fadeIn"
            title="Click to change your feeling / status"
          >
            <div className="bg-white text-slate-900 px-4 py-1.5 rounded-full text-xs font-semibold shadow-md flex items-center gap-1.5 hover:bg-slate-100 transition-all transform group-hover:scale-105 border border-slate-200/50">
              <span className="truncate max-w-[200px]">{userStatus}</span>
            </div>
            {/* Pointer tail */}
            <div className="w-2.5 h-2.5 bg-white rounded-full mx-auto -mt-0.5 shadow-sm" />
            <div className="w-1.5 h-1.5 bg-white rounded-full mx-auto mt-0.5 shadow-sm" />
          </div>

          {/* Large Round Avatar */}
          <div className="relative mt-1 mb-3">
            <img
              src={
                authUser?.profilepic ||
                `https://avatar.iran.liara.run/public/${
                  authUser?.gender === "female" ? "girl" : "boy"
                }?username=${encodeURIComponent(authUser?.username || "user")}`
              }
              alt={authUser?.fullname || "User"}
              onClick={() => setActiveCategory("profile")}
              className="w-24 h-24 rounded-full object-cover border-4 border-[#1e2a32] shadow-xl bg-slate-800 cursor-pointer hover:opacity-95 transition-opacity"
              onError={(e) => {
                e.target.src =
                  "https://api.dicebear.com/7.x/bottts/svg?seed=" +
                  (authUser?.username || "user");
              }}
            />
          </div>

          {/* User Name with Green Circled Plus Icon */}
          <div className="flex items-center justify-center gap-2">
            <h2 className="text-lg md:text-xl font-bold text-white tracking-tight text-center">
              {authUser?.fullname || "Dheeraj Singh"}
            </h2>
            <button
              onClick={() => setShowMoodModal(true)}
              className="text-[#00a884] hover:text-emerald-400 transition-colors p-0.5 cursor-pointer"
              title="Add status / story"
            >
              <PlusCircle className="w-5 h-5 fill-emerald-500/10 stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* 3. Settings Menu List (Matching Screenshots 1 & 2 in exact order) */}
        <div className="py-2">
          {filteredItems.map((item) => {
            const Icon = item.icon;
            const isSelected = activeCategory === item.id;
            return (
              <div
                key={item.id}
                onClick={item.action}
                className={`flex items-center gap-4 px-5 py-3.5 hover:bg-[#16202a] cursor-pointer transition-colors border-b border-slate-800/30 group ${
                  isSelected ? "bg-[#16202a]" : ""
                }`}
              >
                {/* Icon in clean circle */}
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${item.iconBg}`}
                >
                  <Icon className="w-5 h-5 stroke-[2]" />
                </div>

                {/* Text labels */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-slate-100 group-hover:text-white transition-colors truncate">
                    {item.title}
                  </h3>
                  {item.subtitle && (
                    <p className="text-xs text-slate-400 truncate mt-0.5 leading-normal">
                      {item.subtitle}
                    </p>
                  )}
                </div>

                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300 transition-colors flex-shrink-0" />
              </div>
            );
          })}
        </div>
      </div>

      {/* Modals */}
      {showQRModal && (
        <UserQRCodeModal onClose={() => setShowQRModal(false)} />
      )}

      {showMoodModal && (
        <StatusMoodModal
          currentStatus={userStatus}
          onSave={handleSaveStatus}
          onClose={() => setShowMoodModal(false)}
        />
      )}

      {showPaymentsModal && (
        <PaymentsModal onClose={() => setShowPaymentsModal(false)} />
      )}

      {showSubscriptionsModal && (
        <SubscriptionsModal onClose={() => setShowSubscriptionsModal(false)} />
      )}

      {showLinkedDevicesModal && (
        <LinkedDevicesModal onClose={() => setShowLinkedDevicesModal(false)} />
      )}

      {showListsModal && (
        <ListsModal onClose={() => setShowListsModal(false)} />
      )}

      {showBroadcastModal && (
        <BroadcastModal onClose={() => setShowBroadcastModal(false)} />
      )}

      {showShareModal && (
        <ShareAppModal onClose={() => setShowShareModal(false)} />
      )}
    </aside>
  );
};

export default SettingsSidebar;
