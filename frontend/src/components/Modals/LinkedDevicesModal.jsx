import { useState, useEffect, useRef } from "react";
import {
  Laptop,
  Smartphone,
  Shield,
  X,
  QrCode,
  LogOut,
  RefreshCw,
  Camera,
  CheckCircle2,
  AlertCircle,
  ScanLine
} from "lucide-react";
import { generateQRCodeDataUrl } from "../../utils/qrGenerator";
import toast from "react-hot-toast";

const LinkedDevicesModal = ({ onClose }) => {
  const [sessions, setSessions] = useState([
    {
      id: "sess-1",
      device: "Windows (Chrome)",
      location: "Active now • This computer",
      icon: "laptop",
      isCurrent: true,
      linkedAt: "Today at 8:13 PM"
    },
    {
      id: "sess-2",
      device: "iPhone 15 Pro (Safari)",
      location: "Active yesterday at 11:42 PM",
      icon: "phone",
      isCurrent: false,
      linkedAt: "Aug 31, 2026"
    }
  ]);

  // Mode: "list" | "show_qr" | "scanner"
  const [viewMode, setViewMode] = useState("show_qr");
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [refreshTimer, setRefreshTimer] = useState(30);
  const [scannerActive, setScannerActive] = useState(false);

  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Generate real dynamic scannable QR Code
  const generateNewQR = async () => {
    const sessionToken = `aryavarta:pair:${Math.random().toString(36).substring(2, 10)}:${Date.now()}`;
    const url = await generateQRCodeDataUrl(sessionToken, {
      width: 260,
      margin: 1,
      darkColor: "#111b21",
      lightColor: "#ffffff"
    });
    setQrDataUrl(url);
    setRefreshTimer(30);
  };

  useEffect(() => {
    generateNewQR();
    const interval = setInterval(() => {
      setRefreshTimer((prev) => {
        if (prev <= 1) {
          generateNewQR();
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Camera QR Scanner for Linking
  const startQRScanner = async () => {
    setViewMode("scanner");
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
          audio: false
        }).catch(() => navigator.mediaDevices.getUserMedia({ video: true }));

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
        setScannerActive(true);
      }
    } catch (err) {
      console.warn("Scanner camera error:", err);
      setScannerActive(false);
    }
  };

  const stopQRScanner = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setScannerActive(false);
  };

  const handleSimulateScanSuccess = () => {
    stopQRScanner();
    const newDevice = {
      id: `sess-${Date.now()}`,
      device: "MacBook Pro (Chrome)",
      location: "Active just now",
      icon: "laptop",
      isCurrent: false,
      linkedAt: "Just now"
    };
    setSessions((prev) => [newDevice, ...prev]);
    setViewMode("show_qr");
    toast.success("New device linked successfully! 💻🎉");
  };

  const handleLogoutSession = (id, name) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
    toast.success(`Logged out from ${name} 🔓`);
  };

  const handleLogoutAll = () => {
    setSessions((prev) => prev.filter((s) => s.isCurrent));
    toast.success("Logged out from all other devices! 🔓");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in select-none">
      <div className="w-full max-w-md bg-[#111b21] border border-slate-800 rounded-3xl p-6 text-white shadow-2xl space-y-4 relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#00a884]/20 text-[#00a884] flex items-center justify-center">
              <Laptop className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Linked Devices</h3>
              <p className="text-[11px] text-slate-400">Manage computer & mobile sessions</p>
            </div>
          </div>

          <button
            onClick={() => {
              stopQRScanner();
              onClose();
            }}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ================= VIEW: SCANNER CAMERA ================= */}
        {viewMode === "scanner" ? (
          <div className="space-y-4 animate-fade-in">
            <div className="relative aspect-square bg-black rounded-2xl overflow-hidden border-2 border-emerald-500 shadow-2xl flex items-center justify-center">
              {scannerActive ? (
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
              ) : (
                <div className="text-center p-4">
                  <Camera className="w-10 h-10 text-slate-500 mx-auto mb-2" />
                  <p className="text-xs text-slate-400">Position the QR code inside the frame to scan</p>
                </div>
              )}

              {/* Laser Scanning Line Animation */}
              <div className="absolute inset-x-4 top-1/2 h-0.5 bg-emerald-400 shadow-[0_0_12px_#00a884] animate-pulse" />

              {/* Viewfinder Corners */}
              <div className="absolute top-4 left-4 w-8 h-8 border-t-4 border-l-4 border-[#00a884]" />
              <div className="absolute top-4 right-4 w-8 h-8 border-t-4 border-r-4 border-[#00a884]" />
              <div className="absolute bottom-4 left-4 w-8 h-8 border-b-4 border-l-4 border-[#00a884]" />
              <div className="absolute bottom-4 right-4 w-8 h-8 border-b-4 border-r-4 border-[#00a884]" />
            </div>

            <div className="flex items-center justify-between gap-3">
              <button
                onClick={() => {
                  stopQRScanner();
                  setViewMode("show_qr");
                }}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition-colors cursor-pointer"
              >
                Back to QR
              </button>

              <button
                onClick={handleSimulateScanSuccess}
                className="flex-1 py-2.5 rounded-xl bg-[#00a884] hover:bg-[#02906f] text-xs font-bold text-white shadow-lg transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Pair Device Now</span>
              </button>
            </div>
          </div>
        ) : (
          /* ================= VIEW: HIGH-RESOLUTION REAL QR CODE ================= */
          <div className="space-y-4 animate-fade-in">
            {/* Link a Device Button */}
            <button
              onClick={startQRScanner}
              className="w-full py-3 px-4 rounded-2xl bg-[#00a884] hover:bg-[#02906f] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer hover:scale-[1.02] active:scale-95"
            >
              <QrCode className="w-4 h-4" />
              <span>Link a Device (Scan QR)</span>
            </button>

            {/* Scannable QR Code Card */}
            <div
              onClick={handleSimulateScanSuccess}
              className="p-4 bg-[#182229] border border-slate-750/80 rounded-2xl flex flex-col items-center text-center space-y-2.5 cursor-pointer group hover:border-emerald-500/80 transition-all shadow-inner relative"
              title="Click or scan with camera to pair device"
            >
              {qrDataUrl ? (
                <div className="p-2.5 bg-white rounded-2xl shadow-xl transition-transform group-hover:scale-105">
                  <img
                    src={qrDataUrl}
                    alt="Authentic Aryavarta Pairing QR Code"
                    className="w-44 h-44 object-contain rounded-lg"
                  />
                </div>
              ) : (
                <div className="w-44 h-44 bg-slate-800 rounded-2xl animate-pulse flex items-center justify-center text-xs text-slate-400">
                  Generating QR...
                </div>
              )}

              <div className="flex items-center gap-2 text-xs text-slate-300 font-medium">
                <RefreshCw className="w-3.5 h-3.5 text-emerald-400 animate-spin-slow" />
                <span>Auto-refreshes in <strong className="text-emerald-400 font-mono">{refreshTimer}s</strong></span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed px-2">
                Point your phone camera or QR scanner at this code to link your account.
              </p>
            </div>

            {/* Device Status List */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">Device status</span>
                {sessions.length > 1 && (
                  <button
                    onClick={handleLogoutAll}
                    className="text-[11px] font-semibold text-rose-400 hover:underline cursor-pointer"
                  >
                    Log out all
                  </button>
                )}
              </div>

              <div className="max-h-36 overflow-y-auto space-y-1.5">
                {sessions.map((s) => (
                  <div key={s.id} className="p-3 bg-[#202c33] rounded-2xl border border-slate-750 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300">
                        {s.icon === "laptop" ? <Laptop className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                          <span>{s.device}</span>
                          {s.isCurrent && (
                            <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/15 px-1.5 py-0.2 rounded">
                              Current
                            </span>
                          )}
                        </h4>
                        <p className="text-[10px] text-slate-400">{s.location}</p>
                      </div>
                    </div>

                    {!s.isCurrent && (
                      <button
                        onClick={() => handleLogoutSession(s.id, s.device)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                        title="Log out device"
                      >
                        <LogOut className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* E2E Note */}
            <p className="text-[11px] text-slate-500 text-center flex items-center justify-center gap-1 pt-1 border-t border-slate-800">
              <Shield className="w-3 h-3 text-emerald-500" />
              <span>Your personal chats are end-to-end encrypted on all devices</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LinkedDevicesModal;
