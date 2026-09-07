import { useState, useEffect, useRef } from "react";
import {
  X,
  Share2,
  Copy,
  Check,
  Camera,
  QrCode,
  Sparkles,
  Download
} from "lucide-react";
import { useAuthContext } from "../../context/AuthContext";
import { generateQRCodeDataUrl } from "../../utils/qrGenerator";
import toast from "react-hot-toast";

const UserQRCodeModal = ({ onClose }) => {
  const { authUser } = useAuthContext();
  const [activeTab, setActiveTab] = useState("my_code"); // "my_code" | "scan_code"
  const [qrUrl, setQrUrl] = useState("");
  const [copied, setCopied] = useState(false);

  // Scanner state
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [scannerActive, setScannerActive] = useState(false);

  const qrDataPayload = `aryavarta:user:${authUser?.username || "user"}:${authUser?._id || "123"}`;

  useEffect(() => {
    generateQRCodeDataUrl(qrDataPayload, {
      width: 280,
      margin: 2,
      darkColor: "#0b141a",
      lightColor: "#ffffff"
    }).then((url) => {
      if (url) setQrUrl(url);
    });
  }, [authUser]);

  // Handle camera for scanner tab
  useEffect(() => {
    if (activeTab === "scan_code") {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [activeTab]);

  const startCamera = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" }
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setScannerActive(true);
      }
    } catch (e) {
      console.warn("Camera access denied:", e);
      setScannerActive(false);
      toast.error("Camera access required to scan QR codes");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setScannerActive(false);
  };

  const handleCopyLink = () => {
    const link = `https://aryavarta.chat/add/${authUser?.username || "user"}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success("Profile link copied to clipboard! 📋");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#111b21] border border-slate-800 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl flex flex-col text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800/80 bg-[#16202a]">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <QrCode className="w-5 h-5 text-emerald-400" />
            QR Code
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-1.5 mx-4 mt-4 bg-slate-900/80 rounded-2xl border border-slate-800 text-xs font-semibold">
          <button
            onClick={() => setActiveTab("my_code")}
            className={`py-2 rounded-xl transition-all ${
              activeTab === "my_code"
                ? "bg-emerald-500 text-slate-950 shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            My Code
          </button>
          <button
            onClick={() => setActiveTab("scan_code")}
            className={`py-2 rounded-xl transition-all ${
              activeTab === "scan_code"
                ? "bg-emerald-500 text-slate-950 shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Scan Code
          </button>
        </div>

        {/* Content */}
        <div className="p-5 flex-1 min-h-0 flex flex-col items-center justify-center">
          {activeTab === "my_code" ? (
            <div className="w-full flex flex-col items-center text-center">
              {/* Profile pill */}
              <div className="flex items-center gap-3 mb-4">
                <img
                  src={authUser?.profilepic || "/default-avatar.png"}
                  alt=""
                  className="w-11 h-11 rounded-full object-cover border-2 border-emerald-500 bg-slate-800 shadow"
                  onError={(e) => {
                    e.target.src =
                      "https://api.dicebear.com/7.x/bottts/svg?seed=" +
                      (authUser?.username || "user");
                  }}
                />
                <div className="text-left">
                  <h4 className="text-sm font-bold text-white">
                    {authUser?.fullname || "User"}
                  </h4>
                  <p className="text-xs text-emerald-400">
                    @{authUser?.username || "username"}
                  </p>
                </div>
              </div>

              {/* QR Code Container */}
              <div className="bg-white p-3 rounded-2xl shadow-xl mb-4 border-4 border-emerald-500/20">
                {qrUrl ? (
                  <img
                    src={qrUrl}
                    alt="User QR Code"
                    className="w-52 h-52 object-contain rounded-lg"
                  />
                ) : (
                  <div className="w-52 h-52 flex items-center justify-center text-slate-600">
                    Generating QR...
                  </div>
                )}
              </div>

              <p className="text-xs text-slate-400 max-w-xs mb-5">
                Your QR code is private. If you share it with someone, they can scan it with their Aryavarta camera to add you as a contact.
              </p>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 w-full">
                <button
                  onClick={handleCopyLink}
                  className="flex-1 py-2.5 px-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-semibold text-slate-200 transition-colors flex items-center justify-center gap-2"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  {copied ? "Copied!" : "Copy Link"}
                </button>

                {qrUrl && (
                  <a
                    href={qrUrl}
                    download={`aryavarta-qr-${authUser?.username || "code"}.png`}
                    className="flex-1 py-2.5 px-3 bg-emerald-500 hover:bg-emerald-600 rounded-xl text-xs font-semibold text-slate-950 transition-colors flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Save Code
                  </a>
                )}
              </div>
            </div>
          ) : (
            /* Scanner Tab */
            <div className="w-full flex flex-col items-center text-center">
              <div className="w-60 h-60 rounded-2xl overflow-hidden bg-black relative border-2 border-dashed border-emerald-500/80 flex items-center justify-center shadow-lg mb-4">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 border-2 border-emerald-400/50 rounded-2xl pointer-events-none animate-pulse" />
                {!scannerActive && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-slate-900/90 text-slate-400 text-xs gap-2">
                    <Camera className="w-8 h-8 text-slate-500" />
                    <span>Camera inactive or scanning simulated</span>
                  </div>
                )}
              </div>

              <p className="text-xs text-slate-400 max-w-xs">
                Point your camera at a friend's Aryavarta QR code to immediately connect and start chatting.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserQRCodeModal;
