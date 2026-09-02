import { useState } from "react";
import { useChatContext } from "../context/ChatContext";
import NavRail from "../components/Navigation/NavRail";
import Sidebar from "../components/Sidebar/Sidebar";
import SettingsSidebar from "../components/Settings/SettingsSidebar";
import GeneralSettings from "../components/Settings/GeneralSettings";
import EditProfileView from "../components/Settings/EditProfileView";
import AccountSettings from "../components/Settings/AccountSettings";
import PrivacySettings from "../components/Settings/PrivacySettings";
import ChatsSettings from "../components/Settings/ChatsSettings";
import VoiceSettings from "../components/Settings/VoiceSettings";
import NotificationsSettings from "../components/Settings/NotificationsSettings";
import KeyboardShortcutsSettings from "../components/Settings/KeyboardShortcutsSettings";
import HelpSettings from "../components/Settings/HelpSettings";
import MeetingsView from "../components/Meetings/MeetingsView";
import ChatContainer from "../components/Chat/ChatContainer";
import NoChatSelected from "../components/Chat/NoChatSelected";
import AIChatView from "../components/AI/AIChatView";
import ProfileModal from "../components/Modals/ProfileModal";
import CallsModal from "../components/Modals/CallsModal";
import NewGroupModal from "../components/Modals/NewGroupModal";
import AppLockModal from "../components/Modals/AppLockModal";
import toast from "react-hot-toast";

const Home = () => {
  const { selectedConversation, setSelectedConversation } = useChatContext();
  const [activeNav, setActiveNav] = useState("chats"); // "chats" | "meetings" | "ai" | "calls" | "status" | "communities" | "starred" | "settings"
  const [settingsCategory, setSettingsCategory] = useState(null); // null (shows menu) or "general", "profile", "account", etc.
  const [isAppLocked, setIsAppLocked] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showCallsModal, setShowCallsModal] = useState(false);
  const [showNewGroupModal, setShowNewGroupModal] = useState(false);

  const handleNavChange = (nav) => {
    setActiveNav(nav);
    if (nav === "settings") {
      setSettingsCategory(null);
    } else if (nav === "calls") {
      setShowCallsModal(true);
    } else if (nav === "status") {
      toast("Status & Stories: No updates yet", { icon: "📻" });
    } else if (nav === "communities") {
      setShowNewGroupModal(true);
    } else if (nav === "starred") {
      toast("Starred messages list is empty", { icon: "⭐" });
    } else if (nav === "ai") {
      setSelectedConversation(null);
    } else if (nav === "meetings") {
      setSelectedConversation(null);
    }
  };

  const handleSelectAI = () => {
    setSelectedConversation(null);
    setActiveNav("ai");
  };

  const handleOpenProfileSettings = () => {
    setActiveNav("settings");
    setSettingsCategory("profile");
  };

  const isAIActive = activeNav === "ai" && !selectedConversation;

  // Render the selected category view
  const renderSettingsView = () => {
    const handleBack = () => setSettingsCategory(null);

    switch (settingsCategory) {
      case "general":
        return <GeneralSettings onBack={handleBack} />;
      case "profile":
        return <EditProfileView onBack={handleBack} />;
      case "account":
        return <AccountSettings onBack={handleBack} />;
      case "privacy":
        return <PrivacySettings onBack={handleBack} />;
      case "chats":
        return <ChatsSettings onBack={handleBack} />;
      case "voice":
        return <VoiceSettings onBack={handleBack} />;
      case "notifications":
        return <NotificationsSettings onBack={handleBack} />;
      case "shortcuts":
        return <KeyboardShortcutsSettings onBack={handleBack} />;
      case "help":
        return <HelpSettings onBack={handleBack} />;
      default:
        return (
          <SettingsSidebar
            activeCategory={settingsCategory}
            setActiveCategory={(cat) => setSettingsCategory(cat)}
          />
        );
    }
  };

  return (
    <div className="flex h-screen w-screen bg-[#0c1317] text-slate-100 overflow-hidden relative box-border">
      {/* App Lock Screen */}
      {isAppLocked && (
        <AppLockModal onUnlock={() => setIsAppLocked(false)} expectedPin="1234" />
      )}

      {/* 1. Left Navigation Rail (Icon Bar) */}
      <NavRail
        activeNav={activeNav}
        setActiveNav={handleNavChange}
        onOpenProfile={handleOpenProfileSettings}
      />

      {/* 2. Main Workspace Layout */}
      <div className="flex flex-1 h-full min-h-0 overflow-hidden">
        {/* Meetings Full View matching screenshot */}
        {activeNav === "meetings" ? (
          <MeetingsView />
        ) : activeNav === "settings" ? (
          /* Settings View */
          <>
            {/* Left Settings Column */}
            <div className="h-full min-h-0 flex w-full md:w-80 lg:w-[350px]">
              {renderSettingsView()}
            </div>

            {/* Right Pane: WhatsApp Empty State matching screenshot */}
            <div className="flex-1 h-full min-h-0 hidden md:flex">
              <NoChatSelected
                onOpenAI={handleSelectAI}
                onAddContact={() => setShowNewGroupModal(true)}
              />
            </div>
          </>
        ) : (
          <>
            {/* Chats Sidebar */}
            <div
              className={`h-full min-h-0 ${
                selectedConversation || isAIActive
                  ? "hidden md:flex md:w-80 lg:w-[350px]"
                  : "flex w-full md:w-80 lg:w-[350px]"
              }`}
            >
              <Sidebar
                onOpenNewChat={() => setShowNewGroupModal(true)}
                onLockApp={() => setIsAppLocked(true)}
                onSelectAI={handleSelectAI}
                isAISelected={isAIActive}
                onOpenSettings={() => handleNavChange("settings")}
                onOpenProfile={handleOpenProfileSettings}
              />
            </div>

            {/* Right Active View Area */}
            <div
              className={`flex-1 h-full min-h-0 ${
                !selectedConversation && !isAIActive
                  ? "hidden md:flex"
                  : "flex w-full"
              }`}
            >
              {isAIActive ? (
                <AIChatView />
              ) : selectedConversation ? (
                <ChatContainer />
              ) : (
                <NoChatSelected
                  onOpenAI={handleSelectAI}
                  onAddContact={() => setShowNewGroupModal(true)}
                />
              )}
            </div>
          </>
        )}
      </div>

      {/* Modals */}
      {showProfileModal && (
        <ProfileModal onClose={() => setShowProfileModal(false)} />
      )}

      {showCallsModal && (
        <CallsModal onClose={() => setShowCallsModal(false)} />
      )}

      {showNewGroupModal && (
        <NewGroupModal onClose={() => setShowNewGroupModal(false)} />
      )}
    </div>
  );
};

export default Home;
