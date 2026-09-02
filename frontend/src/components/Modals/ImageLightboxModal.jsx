import { useState } from "react";
import {
  X,
  Download,
  Share2,
  Star,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize2,
  Trash2,
  Reply,
  Copy
} from "lucide-react";
import toast from "react-hot-toast";

const ImageLightboxModal = ({ imageUrl, senderName, senderPic, timestamp, onClose }) => {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isStarred, setIsStarred] = useState(false);

  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = imageUrl;
    a.download = `Aryavarta_Image_${Date.now()}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success("Image downloaded successfully! 📥");
  };

  const handleForward = () => {
    toast.success("Forwarding image to contacts... ➡️");
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(imageUrl);
    toast.success("Image link copied to clipboard! 📋");
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/95 text-white select-none animate-fade-in">
      {/* 1. Top Action Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-black/60 backdrop-blur-md border-b border-slate-800/80 z-20 flex-shrink-0">
        {/* Sender Info */}
        <div className="flex items-center gap-3">
          <img
            src={senderPic || `https://avatar.iran.liara.run/public/boy?username=user`}
            alt={senderName}
            className="w-10 h-10 rounded-full object-cover border border-slate-700"
          />
          <div>
            <h4 className="text-sm font-bold text-white">{senderName || "Contact"}</h4>
            <p className="text-xs text-slate-400">{timestamp || "Today at 6:31 pm"}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Zoom In */}
          <button
            onClick={() => setZoom((z) => Math.min(z + 0.25, 3))}
            className="p-2 rounded-full hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
            title="Zoom in"
          >
            <ZoomIn className="w-5 h-5" />
          </button>

          {/* Zoom Out */}
          <button
            onClick={() => setZoom((z) => Math.max(z - 0.25, 0.5))}
            className="p-2 rounded-full hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
            title="Zoom out"
          >
            <ZoomOut className="w-5 h-5" />
          </button>

          {/* Rotate */}
          <button
            onClick={() => setRotation((r) => (r + 90) % 360)}
            className="p-2 rounded-full hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
            title="Rotate 90°"
          >
            <RotateCw className="w-5 h-5" />
          </button>

          {/* Star */}
          <button
            onClick={() => {
              setIsStarred(!isStarred);
              toast(isStarred ? "Removed from starred" : "Image starred ⭐");
            }}
            className="p-2 rounded-full hover:bg-slate-800 text-slate-300 hover:text-amber-400 transition-colors"
            title="Star message"
          >
            <Star className={`w-5 h-5 ${isStarred ? "text-amber-400 fill-amber-400" : ""}`} />
          </button>

          {/* Forward */}
          <button
            onClick={handleForward}
            className="p-2 rounded-full hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
            title="Forward"
          >
            <Share2 className="w-5 h-5" />
          </button>

          {/* Download */}
          <button
            onClick={handleDownload}
            className="p-2 rounded-full hover:bg-slate-800 text-slate-300 hover:text-emerald-400 transition-colors"
            title="Download image"
          >
            <Download className="w-5 h-5" />
          </button>

          {/* Close */}
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-800 text-slate-300 hover:text-white transition-colors ml-2"
            title="Close (Esc)"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* 2. Main Image Canvas */}
      <div className="flex-1 min-h-0 flex items-center justify-center p-4 md:p-8 overflow-hidden relative">
        <div
          className="transition-transform duration-200 ease-out max-h-full max-w-full flex items-center justify-center"
          style={{
            transform: `scale(${zoom}) rotate(${rotation}deg)`
          }}
        >
          <img
            src={imageUrl}
            alt="Fullscreen Preview"
            className="max-h-[80vh] max-w-[90vw] object-contain rounded-2xl shadow-2xl"
          />
        </div>
      </div>

      {/* 3. Bottom Bar with Quick Options */}
      <div className="px-6 py-3 bg-black/60 backdrop-blur-md border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 z-20 flex-shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={handleCopy} className="hover:text-white flex items-center gap-1.5 transition-colors">
            <Copy className="w-4 h-4" />
            <span>Copy Link</span>
          </button>
          <button onClick={() => toast("Replying to this image...")} className="hover:text-white flex items-center gap-1.5 transition-colors">
            <Reply className="w-4 h-4" />
            <span>Reply</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span>Zoom: {Math.round(zoom * 100)}%</span>
          <button
            onClick={() => {
              setZoom(1);
              setRotation(0);
            }}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageLightboxModal;
