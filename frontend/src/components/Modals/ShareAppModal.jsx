import { useState, useEffect } from "react";
import { Share2, Copy, QrCode, Check, X, Heart, MessageCircle, Mail } from "lucide-react";
import { generateQRCodeDataUrl } from "../../utils/qrGenerator";
import toast from "react-hot-toast";

const ShareAppModal = ({ onClose }) => {
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState("");
  const shareUrl = "https://aryavarta.app/download";

  useEffect(() => {
    const loadQR = async () => {
      const url = await generateQRCodeDataUrl(shareUrl, {
        width: 240,
        margin: 1,
        darkColor: "#111b21",
        lightColor: "#ffffff"
      });
      setQrDataUrl(url);
    };
    loadQR();
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success("Invite link copied to clipboard! 🔗");
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShareWhatsApp = () => {
    window.open(
      `https://api.whatsapp.com/send?text=${encodeURIComponent(
        "Let's chat on Aryavarta! It's a fast, secure, and encrypted chat app with AI. Download here: " + shareUrl
      )}`,
      "_blank"
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in select-none">
      <div className="w-full max-w-md bg-[#111b21] border border-slate-800 rounded-3xl p-6 text-white shadow-2xl space-y-5 relative">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-pink-500/20 text-pink-400 flex items-center justify-center">
              <Heart className="w-4 h-4 fill-pink-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Invite Friends to Aryavarta</h3>
              <p className="text-[11px] text-slate-400">Share with family & colleagues</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Real Scannable QR Code Container */}
        <div className="p-4 bg-slate-900 rounded-2xl border border-slate-700/80 flex flex-col items-center text-center space-y-2 shadow-inner">
          <div className="p-2 bg-white rounded-2xl shadow-xl">
            {qrDataUrl ? (
              <img src={qrDataUrl} alt="Real Scannable QR Code" className="w-36 h-36 object-contain rounded-lg" />
            ) : (
              <div className="w-36 h-36 bg-slate-200 animate-pulse rounded-lg" />
            )}
          </div>
          <p className="text-xs text-slate-300 font-medium">Scan with phone camera to download</p>
        </div>

        {/* Share Link Copy Box */}
        <div className="flex items-center gap-2 p-2 bg-[#202c33] rounded-2xl border border-slate-700">
          <span className="flex-1 text-xs text-slate-200 font-mono truncate px-2">{shareUrl}</span>
          <button
            onClick={handleCopy}
            className="px-4 py-2 bg-[#00a884] hover:bg-[#02906f] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer flex-shrink-0"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied" : "Copy Link"}</span>
          </button>
        </div>

        {/* Social Share Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            onClick={handleShareWhatsApp}
            className="py-2.5 px-3 bg-[#25D366]/20 hover:bg-[#25D366]/30 border border-[#25D366]/40 text-[#25D366] text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <MessageCircle className="w-4 h-4" />
            <span>WhatsApp</span>
          </button>

          <button
            onClick={() => {
              window.open(`mailto:?subject=Join me on Aryavarta&body=Download here: ${shareUrl}`);
            }}
            className="py-2.5 px-3 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/40 text-blue-400 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Mail className="w-4 h-4" />
            <span>Email</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareAppModal;
