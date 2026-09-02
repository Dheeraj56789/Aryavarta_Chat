import { useState } from "react";
import { X, Send, Sparkles, Smile, Eye, Crop, RotateCw } from "lucide-react";
import toast from "react-hot-toast";

const ImageUploadModal = ({ imageFile, imageUrl, onSend, onClose }) => {
  const [caption, setCaption] = useState("");
  const [viewOnce, setViewOnce] = useState(false);
  const [isHD, setIsHD] = useState(true);

  const handleSend = () => {
    onSend({
      imageUrl,
      caption: caption.trim(),
      viewOnce,
      isHD
    });
    toast.success("Image sent! 🖼️");
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/90 text-white select-none animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-black/60 border-b border-slate-800 flex-shrink-0">
        <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          {/* HD Quality Badge */}
          <button
            onClick={() => {
              setIsHD(!isHD);
              toast(isHD ? "Standard Quality" : "HD Quality Active ✨");
            }}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors ${
              isHD ? "bg-emerald-500/20 border-emerald-500 text-emerald-400" : "bg-slate-800 border-slate-700 text-slate-400"
            }`}
          >
            HD
          </button>

          {/* View Once Toggle */}
          <button
            onClick={() => {
              setViewOnce(!viewOnce);
              toast(viewOnce ? "View Once Off" : "View Once Active 👁️ (Photo will disappear after opening)");
            }}
            className={`p-2 rounded-full border transition-colors ${
              viewOnce ? "bg-emerald-500 border-emerald-500 text-white" : "bg-slate-800 border-slate-700 text-slate-400 hover:text-white"
            }`}
            title="View once"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Image Preview */}
      <div className="flex-1 min-h-0 flex items-center justify-center p-6 overflow-hidden">
        <img
          src={imageUrl}
          alt="Preview"
          className="max-h-[70vh] max-w-[85vw] object-contain rounded-2xl shadow-2xl"
        />
      </div>

      {/* Bottom Caption Input Bar */}
      <div className="p-4 bg-black/60 border-t border-slate-800 flex-shrink-0 max-w-2xl w-full mx-auto">
        <div className="flex items-center gap-3 bg-[#202c33] px-4 py-2 rounded-2xl border border-slate-700">
          <input
            type="text"
            placeholder="Add a caption..."
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSend();
            }}
            autoFocus
            className="flex-1 bg-transparent border-none text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
          />

          <button
            onClick={handleSend}
            className="p-2.5 rounded-full bg-[#00a884] hover:bg-[#02906f] text-white shadow-lg transition-transform active:scale-90"
            title="Send Image"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageUploadModal;
