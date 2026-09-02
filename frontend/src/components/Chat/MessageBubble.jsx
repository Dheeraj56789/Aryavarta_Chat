import { useState } from "react";
import { useAuthContext } from "../../context/AuthContext";
import { formatMessageTime } from "../../utils/formatTime";
import {
  CheckCheck,
  Smile,
  FileText,
  Download,
  Share2,
  Star,
  Maximize2,
  Copy,
  Reply,
  Trash2
} from "lucide-react";
import ImageLightboxModal from "../Modals/ImageLightboxModal";
import toast from "react-hot-toast";

const REACTION_OPTIONS = ["👍", "❤️", "😂", "😮", "😢", "🙏"];

const MessageBubble = ({ message, senderUser, selectMode }) => {
  const { authUser } = useAuthContext();
  const [reactions, setReactions] = useState([]);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [isSelected, setIsSelected] = useState(false);
  const [showLightbox, setShowLightbox] = useState(false);

  const isFromMe = message.senderId === authUser?._id;

  // Detect image message
  const isImage =
    message.image ||
    (message.message &&
      (message.message.startsWith("data:image") ||
        message.message.startsWith("http") && (message.message.includes(".jpg") || message.message.includes(".png") || message.message.includes(".webp") || message.message.includes(".jpeg")) ||
        message.message.startsWith("🖼️ [Image]")));

  const imageUrl = message.image || (isImage ? message.message.replace("🖼️ [Image]: ", "") : null);

  // Detect document
  const isDocument =
    !isImage &&
    message.message &&
    (message.message.includes(".pdf") ||
      message.message.includes(".pptx") ||
      message.message.includes(".docx") ||
      message.message.startsWith("📎 Shared file:"));

  const addReaction = (emoji) => {
    if (reactions.includes(emoji)) {
      setReactions(reactions.filter((r) => r !== emoji));
    } else {
      setReactions([...reactions, emoji]);
    }
    setShowReactionPicker(false);
  };

  const handleDownloadImage = (e) => {
    e.stopPropagation();
    const a = document.createElement("a");
    a.href = imageUrl;
    a.download = `Aryavarta_Image_${Date.now()}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success("Image downloaded! 📥");
  };

  return (
    <>
      <div
        className={`flex items-end gap-2 my-2 group relative ${
          isFromMe ? "justify-end" : "justify-start"
        }`}
      >
        {/* Checkbox if selectMode is active */}
        {selectMode && (
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => setIsSelected(e.target.checked)}
            className="w-4 h-4 accent-emerald-500 rounded cursor-pointer self-center mr-2"
          />
        )}

        {/* Reaction Hover Button */}
        <div
          className={`opacity-0 group-hover:opacity-100 transition-opacity flex items-center ${
            isFromMe ? "order-first mr-1" : "order-last ml-1"
          }`}
        >
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowReactionPicker(!showReactionPicker)}
              className="p-1 rounded-full bg-[#202c33] hover:bg-[#2a3942] text-slate-400 hover:text-white shadow transition-transform hover:scale-110"
              title="React"
            >
              <Smile className="w-3.5 h-3.5" />
            </button>

            {/* Quick Reaction Popup */}
            {showReactionPicker && (
              <div className="absolute bottom-7 -left-10 bg-[#233138] border border-slate-700 rounded-full px-2 py-1 shadow-2xl flex items-center gap-1 z-30 animate-fade-in">
                {REACTION_OPTIONS.map((em) => (
                  <button
                    key={em}
                    onClick={() => addReaction(em)}
                    className="w-6 h-6 flex items-center justify-center hover:scale-125 transition-transform text-sm"
                  >
                    {em}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Bubble Container */}
        <div className="max-w-[85%] md:max-w-[70%] flex flex-col relative">
          {/* ================= 1. IMAGE BUBBLE ================= */}
          {isImage ? (
            <div
              onClick={() => setShowLightbox(true)}
              className={`rounded-2xl overflow-hidden shadow-xl border border-slate-700/60 cursor-pointer group/img relative ${
                isFromMe ? "bg-[#005c4b] text-white" : "bg-[#202c33] text-white"
              }`}
            >
              {/* Image Preview */}
              <div className="relative overflow-hidden max-h-72 max-w-sm">
                <img
                  src={imageUrl}
                  alt="Shared attachment"
                  className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-300"
                />

                {/* Hover Action Overlay matching WhatsApp Desktop */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button
                    onClick={() => setShowLightbox(true)}
                    className="p-2 rounded-full bg-black/60 hover:bg-black/80 text-white shadow transition-transform hover:scale-110"
                    title="View Fullscreen"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={handleDownloadImage}
                    className="p-2 rounded-full bg-black/60 hover:bg-black/80 text-white shadow transition-transform hover:scale-110"
                    title="Download"
                  >
                    <Download className="w-4 h-4" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toast.success("Forwarding image...");
                    }}
                    className="p-2 rounded-full bg-black/60 hover:bg-black/80 text-white shadow transition-transform hover:scale-110"
                    title="Forward"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Caption & Timestamp */}
              <div className="p-2 px-3 flex items-center justify-between text-xs">
                {message.caption ? (
                  <p className="font-medium text-slate-100 text-xs pr-2">{message.caption}</p>
                ) : (
                  <span className="text-[11px] text-slate-400">Photo</span>
                )}
                <div className="flex items-center gap-1 text-[10px] text-slate-400 ml-auto flex-shrink-0">
                  <span>{formatMessageTime(message.createdAt || new Date())}</span>
                  {isFromMe && <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb]" />}
                </div>
              </div>
            </div>
          ) : isDocument ? (
            /* ================= 2. DOCUMENT CARD ================= */
            <div
              className={`rounded-2xl overflow-hidden shadow-lg border border-slate-700/60 ${
                isFromMe ? "bg-[#005c4b] text-[#e9edef]" : "bg-[#202c33] text-[#e9edef]"
              }`}
            >
              {!isFromMe && (
                <div className="px-3 pt-2 text-[11px] text-emerald-400 font-bold">
                  ~ {senderUser?.fullname || "Contact"}
                </div>
              )}

              <div className="p-3 flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-rose-600/90 text-white flex flex-col items-center justify-center flex-shrink-0 shadow">
                  <FileText className="w-6 h-6" />
                  <span className="text-[9px] font-bold uppercase">PDF</span>
                </div>

                <div className="min-w-0 flex-1">
                  <h5 className="text-xs font-bold text-white truncate">
                    {message.message.replace("📎 Shared file: ", "")}
                  </h5>
                  <p className="text-[11px] text-slate-300">2 pages • PDF • 145 kB</p>
                </div>
              </div>

              <div className="flex items-center justify-between px-3 py-2 bg-black/20 border-t border-slate-700/40 text-xs font-semibold">
                <button
                  onClick={() => toast("Opening document preview 📄")}
                  className="text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  View
                </button>
                <button
                  onClick={() => toast.success("Document downloaded 📥")}
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  Save as...
                </button>
                <span className="text-[10px] text-slate-400 ml-auto">
                  {formatMessageTime(message.createdAt || new Date())}
                </span>
              </div>
            </div>
          ) : (
            /* ================= 3. TEXT MESSAGE BUBBLE ================= */
            <div
              className={`px-3.5 py-2 rounded-2xl text-[13.5px] leading-relaxed break-words shadow relative ${
                isFromMe
                  ? "bg-[#005c4b] text-[#e9edef] rounded-tr-xs"
                  : "bg-[#202c33] text-[#e9edef] rounded-tl-xs border border-slate-750"
              }`}
            >
              <p className="whitespace-pre-wrap">{message.message}</p>

              <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-slate-400 float-right ml-2 -mb-0.5">
                {message.edited && <span className="italic mr-1 text-[9px]">Edited</span>}
                <span>{formatMessageTime(message.createdAt || new Date())}</span>
                {isFromMe && <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb]" />}
              </div>
            </div>
          )}

          {/* Reaction Badges */}
          {reactions.length > 0 && (
            <div
              className={`flex items-center gap-0.5 mt-0.5 -mb-2 z-10 ${
                isFromMe ? "justify-end mr-2" : "justify-start ml-2"
              }`}
            >
              <div className="flex items-center bg-[#233138] border border-slate-700/80 rounded-full px-1.5 py-0.2 text-[11px] shadow">
                {reactions.map((r, idx) => (
                  <span key={idx}>{r}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Fullscreen Lightbox Modal */}
      {showLightbox && (
        <ImageLightboxModal
          imageUrl={imageUrl}
          senderName={isFromMe ? "You" : senderUser?.fullname}
          senderPic={isFromMe ? authUser?.profilepic : senderUser?.profilepic}
          timestamp={formatMessageTime(message.createdAt || new Date())}
          onClose={() => setShowLightbox(false)}
        />
      )}
    </>
  );
};

export default MessageBubble;
