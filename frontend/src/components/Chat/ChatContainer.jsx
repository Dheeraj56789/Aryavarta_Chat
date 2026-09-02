import { useState } from "react";
import { useChatContext } from "../../context/ChatContext";
import NoChatSelected from "./NoChatSelected";
import ChatHeader from "./ChatHeader";
import MessagesList from "./MessagesList";
import MessageInput from "./MessageInput";
import ContactInfoDrawer from "./ContactInfoDrawer";
import ChatWallpaperContextMenu from "./ChatWallpaperContextMenu";

const ChatContainer = ({ onOpenAI, onAddContact }) => {
  const { selectedConversation } = useChatContext();
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

  return (
    <div
      onContextMenu={handleContextMenu}
      className="flex-1 flex h-full min-h-0 bg-[#0b141a] overflow-hidden relative z-10 box-border select-none"
    >
      {/* Active Conversation Column */}
      <div className="flex-1 flex flex-col h-full min-h-0 relative">
        {/* WhatsApp Doodle Wallpaper Pattern */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(#00a884 0.75px, transparent 0.75px), radial-gradient(#64748b 0.75px, #0b141a 0.75px)`,
            backgroundSize: "30px 30px",
            backgroundPosition: "0 0, 15px 15px"
          }}
        />

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

      {/* Right Click Context Menu matching screenshot */}
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
