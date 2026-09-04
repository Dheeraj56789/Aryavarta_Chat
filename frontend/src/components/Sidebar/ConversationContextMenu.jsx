import { useState, useEffect, useRef } from "react";
import {
  Archive,
  BellOff,
  Pin,
  Mail,
  Heart,
  X,
  Tag,
  Slash,
  Eraser,
  Trash2,
  ChevronRight,
  UserX,
  LogOut
} from "lucide-react";
import { useChatContext } from "../../context/ChatContext";
import DeleteConfirmModal from "../Modals/DeleteConfirmModal";
import toast from "react-hot-toast";

const ConversationContextMenu = ({ x, y, user, onClose }) => {
  const {
    selectedConversation,
    setSelectedConversation,
    conversations,
    setConversations,
    deleteConversation
  } = useChatContext();
  const menuRef = useRef(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showMuteSubmenu, setShowMuteSubmenu] = useState(false);

  const isGroup = user.isGroup || user.name?.includes("Group") || user.name?.includes("Club") || user.name?.includes("LPU");
  const displayName = user.fullname || user.name || "Chat";

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        !showDeleteModal &&
        !showClearModal &&
        !showBlockModal
      ) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose, showDeleteModal, showClearModal, showBlockModal]);

  const adjustedX = Math.min(x, window.innerWidth - 240);
  const adjustedY = Math.min(y, window.innerHeight - 380);

  // 1. Archive
  const handleArchive = () => {
    setConversations((prev) => prev.filter((c) => c._id !== user._id));
    toast.success(`Archived ${displayName} 📁`);
    onClose();
  };

  // 2. Mute
  const handleMute = (duration) => {
    toast(`Notifications muted for ${duration} 🔕`);
    onClose();
  };

  // 3. Pin
  const handlePin = () => {
    toast.success(`Pinned ${displayName} to top 📌`);
    onClose();
  };

  // 4. Mark Unread
  const handleMarkUnread = () => {
    toast(`Marked ${displayName} as unread ✉️`);
    onClose();
  };

  // 5. Add to favourites
  const handleFavourite = () => {
    toast.success(`Added ${displayName} to favourites ⭐`);
    onClose();
  };

  // 6. Close chat
  const handleCloseChat = () => {
    if (selectedConversation?._id === user._id) {
      setSelectedConversation(null);
    }
    toast("Chat closed");
    onClose();
  };

  // 7. Add to list
  const handleAddToList = () => {
    toast.success("Added to custom list 🏷️");
    onClose();
  };

  // 8. Confirm Delete
  const handleConfirmDelete = async () => {
    if (deleteConversation) {
      await deleteConversation(user._id);
    } else if (setConversations) {
      setConversations((prev) =>
        (prev || []).filter((c) => c && c._id !== user._id && c.conversationId !== user._id)
      );
      if (selectedConversation?._id === user._id) {
        setSelectedConversation(null);
      }
      toast.success(`Deleted ${displayName} 🗑️`);
    }
    setShowDeleteModal(false);
    onClose();
  };

  // 9. Confirm Clear
  const handleConfirmClear = () => {
    toast.success(`Messages cleared for ${displayName} 🧹`);
    setShowClearModal(false);
    onClose();
  };

  // 10. Confirm Block / Exit
  const handleConfirmBlock = () => {
    if (setConversations) {
      setConversations((prev) =>
        (prev || []).filter((c) => c && c._id !== user._id && c.conversationId !== user._id)
      );
    }
    if (selectedConversation?._id === user._id) {
      setSelectedConversation(null);
    }
    toast.error(isGroup ? `Exited ${displayName}` : `Blocked ${displayName}`);
    setShowBlockModal(false);
    onClose();
  };

  return (
    <>
      <div
        ref={menuRef}
        style={{ top: `${adjustedY}px`, left: `${adjustedX}px` }}
        className="fixed bg-[#233138] border border-slate-700/80 rounded-2xl shadow-2xl py-1.5 z-50 animate-fade-in text-slate-200 min-w-[210px] select-none box-border"
      >
        {/* 1. Archive chat */}
        <button
          onClick={handleArchive}
          className="w-full px-4 py-2 flex items-center gap-3 text-xs font-medium hover:bg-[#182229] transition-colors cursor-pointer"
        >
          <Archive className="w-4 h-4 text-slate-300 flex-shrink-0" />
          <span>Archive chat</span>
        </button>

        {/* 2. Mute notifications */}
        <div className="relative">
          <button
            onClick={() => setShowMuteSubmenu(!showMuteSubmenu)}
            className="w-full px-4 py-2 flex items-center justify-between text-xs font-medium hover:bg-[#182229] transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <BellOff className="w-4 h-4 text-slate-300 flex-shrink-0" />
              <span>Mute notifications</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showMuteSubmenu && (
            <div className="absolute left-full top-0 ml-1 bg-[#233138] border border-slate-700/80 rounded-xl shadow-2xl py-1.5 min-w-[130px] z-50 animate-fade-in">
              {["8 Hours", "1 Week", "Always"].map((dur) => (
                <button
                  key={dur}
                  onClick={() => handleMute(dur)}
                  className="w-full text-left px-3.5 py-1.5 text-xs text-slate-200 hover:bg-[#182229] transition-colors cursor-pointer"
                >
                  {dur}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 3. Pin chat */}
        <button
          onClick={handlePin}
          className="w-full px-4 py-2 flex items-center gap-3 text-xs font-medium hover:bg-[#182229] transition-colors cursor-pointer"
        >
          <Pin className="w-4 h-4 text-slate-300 flex-shrink-0" />
          <span>Pin chat</span>
        </button>

        {/* 4. Mark as unread */}
        <button
          onClick={handleMarkUnread}
          className="w-full px-4 py-2 flex items-center gap-3 text-xs font-medium hover:bg-[#182229] transition-colors cursor-pointer"
        >
          <Mail className="w-4 h-4 text-slate-300 flex-shrink-0" />
          <span>Mark as unread</span>
        </button>

        {/* 5. Add to favourites */}
        <button
          onClick={handleFavourite}
          className="w-full px-4 py-2 flex items-center gap-3 text-xs font-medium hover:bg-[#182229] transition-colors cursor-pointer"
        >
          <Heart className="w-4 h-4 text-slate-300 flex-shrink-0" />
          <span>Add to favourites</span>
        </button>

        {/* 6. Close chat */}
        <button
          onClick={handleCloseChat}
          className="w-full px-4 py-2 flex items-center gap-3 text-xs font-medium hover:bg-[#182229] transition-colors cursor-pointer"
        >
          <X className="w-4 h-4 text-slate-300 flex-shrink-0" />
          <span>Close chat</span>
        </button>

        {/* 7. Add to list */}
        <button
          onClick={handleAddToList}
          className="w-full px-4 py-2 flex items-center justify-between text-xs font-medium hover:bg-[#182229] transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <Tag className="w-4 h-4 text-slate-300 flex-shrink-0" />
            <span>Add to list</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        </button>

        <div className="h-px bg-slate-700/60 my-1" />

        {/* 8. Block / Exit Group */}
        <button
          onClick={() => setShowBlockModal(true)}
          className="w-full px-4 py-2 flex items-center gap-3 text-xs font-medium text-slate-200 hover:bg-[#182229] transition-colors cursor-pointer"
        >
          {isGroup ? (
            <LogOut className="w-4 h-4 text-slate-300 flex-shrink-0" />
          ) : (
            <Slash className="w-4 h-4 text-slate-300 flex-shrink-0" />
          )}
          <span>{isGroup ? "Exit group" : "Block"}</span>
        </button>

        {/* 9. Clear chat */}
        <button
          onClick={() => setShowClearModal(true)}
          className="w-full px-4 py-2 flex items-center gap-3 text-xs font-medium text-slate-200 hover:bg-[#182229] transition-colors cursor-pointer"
        >
          <Eraser className="w-4 h-4 text-slate-300 flex-shrink-0" />
          <span>Clear chat</span>
        </button>

        {/* 10. Delete chat / Delete group */}
        <button
          onClick={() => setShowDeleteModal(true)}
          className="w-full px-4 py-2 flex items-center gap-3 text-xs font-medium text-rose-400 hover:bg-rose-950/30 transition-colors cursor-pointer"
        >
          <Trash2 className="w-4 h-4 flex-shrink-0" />
          <span>{isGroup ? "Delete group" : "Delete chat"}</span>
        </button>
      </div>

      {/* ================= CONFIRM DELETE MODAL ================= */}
      {showDeleteModal && (
        <DeleteConfirmModal
          title={isGroup ? `Delete "${displayName}" group?` : `Delete chat with "${displayName}"?`}
          message="Messages will only be removed from this device and your devices on the newer versions of Aryavarta."
          confirmText={isGroup ? "Delete group" : "Delete chat"}
          onConfirm={handleConfirmDelete}
          onCancel={() => {
            setShowDeleteModal(false);
            onClose();
          }}
        />
      )}

      {/* ================= CONFIRM CLEAR MODAL ================= */}
      {showClearModal && (
        <DeleteConfirmModal
          title={`Clear chat with "${displayName}"?`}
          message="This will clear all messages from this conversation. Starred messages will be kept unless explicitly deleted."
          confirmText="Clear chat"
          onConfirm={handleConfirmClear}
          onCancel={() => {
            setShowClearModal(false);
            onClose();
          }}
        />
      )}

      {/* ================= CONFIRM BLOCK / EXIT MODAL ================= */}
      {showBlockModal && (
        <DeleteConfirmModal
          title={isGroup ? `Exit "${displayName}" group?` : `Block "${displayName}"?`}
          message={
            isGroup
              ? "You will no longer be a participant of this group and won't receive messages."
              : "Blocked contacts will no longer be able to call you or send you messages."
          }
          confirmText={isGroup ? "Exit group" : "Block contact"}
          onConfirm={handleConfirmBlock}
          onCancel={() => {
            setShowBlockModal(false);
            onClose();
          }}
        />
      )}
    </>
  );
};

export default ConversationContextMenu;
