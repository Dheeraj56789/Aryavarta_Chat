import { useState } from "react";
import { useChatContext } from "../../context/ChatContext";
import NoChatSelected from "./NoChatSelected";
import ChatHeader from "./ChatHeader";
import MessagesList from "./MessagesList";
import MessageInput from "./MessageInput";
import ContactInfoDrawer from "./ContactInfoDrawer";
import ChatWallpaperContextMenu from "./ChatWallpaperContextMenu";

const WALLPAPER_BG_MAP = {
  default: "#0b141a",
  emerald: "#062419",
  midnight: "#0f172a",
  purple: "#1e102d",
  amethyst: "#1e102d",
  navy: "#0a192f",
  warm: "#1c1917",
  burgundy: "#280914"
};

const ChatContainer = ({ onOpenAI, onAddContact }) => {
  const {
    selectedConversation,
    wallpaperColor,
    wallpaperDoodle,
    customWallpaperUrl
  } = useChatContext();

  const [showContactInfo, setShowContactInfo] = useState(false);
  const [selectMode, setSelectMode] = useState(false);
  const [contextMenu, setContextMenu] = useState(null); // { x, y }

  if (!selectedConversation) {
    return <NoChatSelected onOpenAI={onOpenAI} onAddContact={onAddContact} />;
  }

  const handleContextMenu = (e) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY
    });
  };

  const backgroundColor = WALLPAPER_BG_MAP[wallpaperColor] || WALLPAPER_BG_MAP.default;

  return (
    <div
      onContextMenu={handleContextMenu}
      style={{
        backgroundColor: customWallpaperUrl ? "transparent" : backgroundColor,
        backgroundImage: customWallpaperUrl ? `url(${customWallpaperUrl})` : "none",
        backgroundSize: "cover",
        backgroundPosition: "center"
      }}
      className="flex-1 flex h-full min-h-0 overflow-hidden relative z-10 box-border select-none transition-colors duration-300"
    >
      {/* Active Conversation Column */}
      <div className="flex-1 flex flex-col h-full min-h-0 relative">
        {/* WhatsApp Doodle Wallpaper Pattern (Toggled dynamically by wallpaperDoodle) */}
        {wallpaperDoodle && !customWallpaperUrl && (
          <div
            className="absolute inset-0 opacity-15 pointer-events-none transition-opacity"
            style={{
              backgroundImage: `radial-gradient(#00a884 0.75px, transparent 0.75px), radial-gradient(#94a3b8 0.75px, transparent 0.75px)`,
              backgroundSize: "30px 30px",
              backgroundPosition: "0 0, 15px 15px"
            }}
          />
        )}

        {/* Chat Header */}
        <ChatHeader
          onOpenContactInfo={() => setShowContactInfo(!showContactInfo)}
          onToggleSelectMode={() => setSelectMode(!selectMode)}
        />

        {/* Messages Stream */}
        <MessagesList selectMode={selectMode} />

        {/* Message Input Bar */}
        <MessageInput />
      </div>

      {/* WhatsApp Contact Info Right Panel */}
      {showContactInfo && (
        <ContactInfoDrawer onClose={() => setShowContactInfo(false)} />
      )}

      {/* Right Click Context Menu */}
      {contextMenu && (
        <ChatWallpaperContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          onOpenContactInfo={() => setShowContactInfo(true)}
          onToggleSelectMode={() => setSelectMode(!selectMode)}
        />
      )}
    </div>
  );
};

export default ChatContainer;
