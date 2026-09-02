import { useState, useRef, useEffect } from "react";
import { useChatContext } from "../../context/ChatContext";
import { Send, Smile, Plus, Image, Camera, FileText, UserCheck, BarChart2, Mic, MicOff } from "lucide-react";
import ImageUploadModal from "../Modals/ImageUploadModal";
import CameraCaptureModal from "../Modals/CameraCaptureModal";
import toast from "react-hot-toast";

const EMOJIS = ["👍", "❤️", "🔥", "😂", "🎉", "✨", "🚀", "😊", "👋", "🙌", "💯", "😎", "🙏", "🤩", "💖", "⚡", "🤝", "🥳"];

const MessageInput = () => {
  const [message, setMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  // Modals state
  const [pendingImage, setPendingImage] = useState(null); // { file, url }
  const [showCameraModal, setShowCameraModal] = useState(false);

  const { sendMessage, emitTyping } = useChatContext();
  const typingTimeoutRef = useRef(null);
  const inputRef = useRef(null);
  const attachRef = useRef(null);

  const handleInputChange = (e) => {
    setMessage(e.target.value);
    emitTyping(true);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      emitTyping(false);
    }, 1500);
  };

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!message.trim()) return;

    const textToSend = message;
    setMessage("");
    emitTyping(false);
    setShowEmojiPicker(false);
    setShowAttachMenu(false);

    await sendMessage(textToSend);
    inputRef.current?.focus();
  };

  const addEmoji = (emoji) => {
    setMessage((prev) => prev + emoji);
    inputRef.current?.focus();
  };

  const handleAttachItem = (type) => {
    setShowAttachMenu(false);
    if (type === "camera") {
      setShowCameraModal(true);
    } else if (type === "photo") {
      const fileInput = document.createElement("input");
      fileInput.type = "file";
      fileInput.accept = "image/*";
      fileInput.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = () => {
            setPendingImage({
              file,
              url: reader.result
            });
          };
          reader.readAsDataURL(file);
        }
      };
      fileInput.click();
    } else if (type === "document") {
      const fileInput = document.createElement("input");
      fileInput.type = "file";
      fileInput.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
          sendMessage(`📎 Shared file: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`);
        }
      };
      fileInput.click();
    } else {
      toast.success(`${type} attachment triggered`);
    }
  };

  const handleSendImage = ({ imageUrl, caption }) => {
    setPendingImage(null);
    const formatted = caption
      ? `🖼️ [Image]: ${imageUrl}\n${caption}`
      : `🖼️ [Image]: ${imageUrl}`;
    sendMessage(formatted);
  };

  // Direct Click & Send from Live Camera
  const handleDirectCameraSend = (photoDataUrl, optionalCaption = "") => {
    setShowCameraModal(false);
    const formatted = optionalCaption
      ? `🖼️ [Image]: ${photoDataUrl}\n${optionalCaption}`
      : `🖼️ [Image]: ${photoDataUrl}`;
    sendMessage(formatted);
  };

  const toggleRecording = () => {
    if (!isRecording) {
      setIsRecording(true);
      toast("Recording voice note... 🎙️", { icon: "🔴" });
    } else {
      setIsRecording(false);
      sendMessage("🎤 Voice note (0:12)");
      toast.success("Voice note sent!");
    }
  };

  return (
    <>
      <div className="p-3 bg-[#202c33] border-t border-slate-700/50 relative flex-shrink-0">
        {/* Emoji Picker Popover */}
        {showEmojiPicker && (
          <div className="absolute bottom-16 left-3 p-3 bg-[#233138] border border-slate-700 rounded-2xl shadow-2xl z-30 grid grid-cols-6 gap-2">
            {EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => addEmoji(emoji)}
                className="w-8 h-8 flex items-center justify-center text-lg hover:scale-125 transition-transform rounded-xl hover:bg-slate-700 cursor-pointer"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}

        {/* Attachment WhatsApp Popup Menu */}
        {showAttachMenu && (
          <div
            ref={attachRef}
            className="absolute bottom-16 left-12 bg-[#233138] border border-slate-700 rounded-2xl shadow-2xl p-2 z-30 space-y-1 w-48 animate-fade-in"
          >
            <button
              onClick={() => handleAttachItem("document")}
              className="w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-[#182229] rounded-xl transition-colors cursor-pointer"
            >
              <div className="w-7 h-7 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
              <span>Document</span>
            </button>

            <button
              onClick={() => handleAttachItem("photo")}
              className="w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-[#182229] rounded-xl transition-colors cursor-pointer"
            >
              <div className="w-7 h-7 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                <Image className="w-4 h-4" />
              </div>
              <span>Photos & videos</span>
            </button>

            <button
              onClick={() => handleAttachItem("camera")}
              className="w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-[#182229] rounded-xl transition-colors cursor-pointer"
            >
              <div className="w-7 h-7 rounded-full bg-pink-500/20 text-pink-400 flex items-center justify-center">
                <Camera className="w-4 h-4" />
              </div>
              <span>Camera</span>
            </button>

            <button
              onClick={() => handleAttachItem("Contact")}
              className="w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-[#182229] rounded-xl transition-colors cursor-pointer"
            >
              <div className="w-7 h-7 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center">
                <UserCheck className="w-4 h-4" />
              </div>
              <span>Contact</span>
            </button>

            <button
              onClick={() => handleAttachItem("Poll")}
              className="w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-[#182229] rounded-xl transition-colors cursor-pointer"
            >
              <div className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <BarChart2 className="w-4 h-4" />
              </div>
              <span>Poll</span>
            </button>
          </div>
        )}

        {/* Main Input Form */}
        <form onSubmit={handleSend} className="flex items-center gap-2">
          {/* Emoji Button */}
          <button
            type="button"
            onClick={() => {
              setShowEmojiPicker(!showEmojiPicker);
              setShowAttachMenu(false);
            }}
            className={`p-2 rounded-xl transition-colors cursor-pointer ${
              showEmojiPicker ? "text-[#00a884]" : "text-slate-400 hover:text-slate-200"
            }`}
            title="Emoji"
          >
            <Smile className="w-5 h-5" />
          </button>

          {/* Attachment Button (+) */}
          <button
            type="button"
            onClick={() => {
              setShowAttachMenu(!showAttachMenu);
              setShowEmojiPicker(false);
            }}
            className={`p-2 rounded-xl transition-colors cursor-pointer ${
              showAttachMenu ? "text-[#00a884] rotate-45" : "text-slate-400 hover:text-slate-200"
            } transition-transform`}
            title="Attach"
          >
            <Plus className="w-5 h-5" />
          </button>

          {/* Direct Camera Button (1-Click Instant Photo Click & Send) */}
          <button
            type="button"
            onClick={() => setShowCameraModal(true)}
            className="p-2 rounded-xl text-slate-400 hover:text-[#00a884] hover:bg-slate-700/60 transition-colors cursor-pointer"
            title="Open Camera to Direct Click & Send"
          >
            <Camera className="w-5 h-5" />
          </button>

          {/* Message Input Box */}
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              placeholder="Type a message..."
              value={message}
              onChange={handleInputChange}
              className="w-full py-2.5 px-4 bg-[#2a3942] rounded-xl text-sm text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#00a884]/50 transition-all"
            />
          </div>

          {/* Send or Voice Note Mic Button */}
          {message.trim() ? (
            <button
              type="submit"
              className="p-2.5 rounded-full bg-[#00a884] hover:bg-[#02906f] text-[#111b21] flex items-center justify-center transition-all shadow-md active:scale-95 cursor-pointer"
              title="Send"
            >
              <Send className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={toggleRecording}
              className={`p-2.5 rounded-full transition-all cursor-pointer ${
                isRecording
                  ? "bg-rose-500 text-white animate-pulse"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/60"
              }`}
              title={isRecording ? "Stop recording & send" : "Record voice note"}
            >
              {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
          )}
        </form>
      </div>

      {/* Direct Click & Send Camera Modal */}
      {showCameraModal && (
        <CameraCaptureModal
          onDirectSend={handleDirectCameraSend}
          onCapture={(photoUrl) => {
            setShowCameraModal(false);
            setPendingImage({ file: null, url: photoUrl });
          }}
          onClose={() => setShowCameraModal(false)}
        />
      )}

      {/* Image Preview & Caption Modal */}
      {pendingImage && (
        <ImageUploadModal
          imageFile={pendingImage.file}
          imageUrl={pendingImage.url}
          onSend={handleSendImage}
          onClose={() => setPendingImage(null)}
        />
      )}
    </>
  );
};

export default MessageInput;
