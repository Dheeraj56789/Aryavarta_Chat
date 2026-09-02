import { useState, useRef, useEffect } from "react";
import {
  Camera,
  X,
  RefreshCw,
  Send,
  AlertCircle,
  FlipHorizontal,
  Zap,
  Image as ImageIcon,
  Upload,
  QrCode,
  IndianRupee,
  Lock,
  ArrowRight,
  CheckCircle2,
  Check
} from "lucide-react";
import confetti from "canvas-confetti";
import toast from "react-hot-toast";

const PRESET_AMOUNTS = [100, 200, 500, 1000, 2000];

const SAMPLE_PAYEES = [
  { name: "Rahul Sharma", upiId: "rahul@okhdfcbank", phone: "+91 98765 43210", avatar: "https://avatar.iran.liara.run/public/boy?username=rahul" },
  { name: "Priya Patel", upiId: "priya@okaxis", phone: "+91 91234 56789", avatar: "https://avatar.iran.liara.run/public/girl?username=priya" },
  { name: "Aryavarta Merchant Pay", upiId: "aryavarta.pay@upi", phone: "Verified Business", avatar: "https://avatar.iran.liara.run/public/boy?username=merchant" }
];

const CameraCaptureModal = ({ onCapture, onDirectSend, onClose, defaultMode = "photo" }) => {
  // Modes: "photo" | "pay"
  const [activeTab, setActiveTab] = useState(defaultMode);

  // Video and Stream refs
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);

  // Photo state
  const [streamActive, setStreamActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [caption, setCaption] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [facingMode, setFacingMode] = useState("user");
  const [flashEffect, setFlashEffect] = useState(false);

  // Payment state
  const [payStep, setPayStep] = useState("scan"); // "scan" | "enter_amount" | "enter_pin" | "success"
  const [payee, setPayee] = useState(SAMPLE_PAYEES[0]);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [upiPin, setUpiPin] = useState("");
  const [txnId, setTxnId] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const startCamera = async (mode = "user") => {
    stopCamera();
    setErrorMsg("");
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera API is not supported in this browser environment");
      }

      let stream = null;

      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: mode,
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        });
      } catch {
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false
          });
        } catch (err2) {
          const devices = await navigator.mediaDevices.enumerateDevices();
          const videoDevice = devices.find((d) => d.kind === "videoinput");
          if (videoDevice) {
            stream = await navigator.mediaDevices.getUserMedia({
              video: { deviceId: { exact: videoDevice.deviceId } },
              audio: false
            });
          } else {
            throw err2;
          }
        }
      }

      if (stream) {
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          try {
            await videoRef.current.play();
          } catch (playErr) {
            console.warn("Video play interrupted:", playErr);
          }
        }
        setStreamActive(true);
        setErrorMsg("");
      }
    } catch (err) {
      console.warn("Webcam access error:", err);
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setErrorMsg("Camera permission blocked. Click the 🔒 padlock in your URL bar and set Camera to 'Allow', then refresh.");
      } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
        setErrorMsg("No physical webcam hardware detected. You can use test photo or choose a payee below.");
      } else {
        setErrorMsg(err.message || "Could not access camera device.");
      }
      setStreamActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  useEffect(() => {
    startCamera(facingMode);
    return () => stopCamera();
  }, [facingMode]);

  // Frame grab
  const grabFrame = () => {
    if (!videoRef.current || !canvasRef.current) return null;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext("2d");
    if (facingMode === "user") {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.9);
  };

  // 1. Direct Click & Send Photo
  const handleDirectClickAndSend = () => {
    setFlashEffect(true);
    setTimeout(() => setFlashEffect(false), 200);

    const dataUrl = grabFrame();
    if (!dataUrl) return;

    stopCamera();
    if (onDirectSend) {
      onDirectSend(dataUrl);
    } else if (onCapture) {
      onCapture(dataUrl);
    }
    toast.success("Photo clicked & sent instantly! 📸⚡");
    onClose();
  };

  const handleCapturePreview = () => {
    setFlashEffect(true);
    setTimeout(() => setFlashEffect(false), 200);

    const dataUrl = grabFrame();
    if (!dataUrl) return;

    setCapturedImage(dataUrl);
    stopCamera();
  };

  const handleGenerateDemoPhoto = () => {
    const canvas = canvasRef.current || document.createElement("canvas");
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext("2d");

    const grad = ctx.createLinearGradient(0, 0, 640, 480);
    grad.addColorStop(0, "#005c4b");
    grad.addColorStop(1, "#111b21");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 640, 480);

    ctx.fillStyle = "#00a884";
    ctx.beginPath();
    ctx.arc(320, 200, 70, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 28px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("📸 Aryavarta Snapshot", 320, 320);

    ctx.fillStyle = "#94a3b8";
    ctx.font = "16px sans-serif";
    ctx.fillText(`Captured: ${new Date().toLocaleTimeString()}`, 320, 360);

    const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
    setCapturedImage(dataUrl);
    toast.success("Demo photo captured! 📸");
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setCapturedImage(reader.result);
        toast.success("Photo loaded from file 📁");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSendFromPreview = () => {
    if (capturedImage) {
      if (onDirectSend) {
        onDirectSend(capturedImage, caption.trim());
      } else if (onCapture) {
        onCapture(capturedImage);
      }
      toast.success("Photo sent! 📸");
      onClose();
    }
  };

  // Payment Handlers
  const handleSelectPayee = (p) => {
    setPayee(p);
    setPayStep("enter_amount");
  };

  const handleProceedToPin = (e) => {
    e.preventDefault();
    const num = Number(amount);
    if (!num || num <= 0) {
      toast.error("Please enter a valid amount in ₹");
      return;
    }
    setPayStep("enter_pin");
  };

  const handlePinDigit = (digit) => {
    if (upiPin.length < 4) {
      const nextPin = upiPin + digit;
      setUpiPin(nextPin);
      if (nextPin.length === 4) {
        setIsProcessing(true);
        setTimeout(() => {
          setIsProcessing(false);
          const genTxn = `UPI/${Math.floor(100000000000 + Math.random() * 900000000000)}`;
          setTxnId(genTxn);
          setPayStep("success");
          try {
            confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
          } catch {}
        }, 1200);
      }
    }
  };

  const handleSendPaymentReceipt = () => {
    const receiptText = `💳 **Aryavarta UPI Payment Receipt**\n\n- **Paid To:** ${payee.name} (${payee.upiId})\n- **Amount:** ₹${amount}\n- **Transaction ID:** \`${txnId}\`\n- **Status:** ✅ SUCCESS\n- **Time:** ${new Date().toLocaleTimeString()}\n${note ? `- **Note:** ${note}\n` : ""}\n*Verified Secure by Aryavarta Pay* 🔒`;
    if (onDirectSend) {
      onDirectSend(receiptText);
    }
    toast.success("Payment receipt sent to chat! 🧾⚡");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 text-white select-none animate-fade-in">
      <div className="w-full max-w-xl bg-[#111b21] border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col relative">
        {flashEffect && <div className="absolute inset-0 bg-white z-50 animate-fade-out" />}

        {/* Top Header with Dual-Mode Tabs */}
        <div className="flex items-center justify-between px-6 py-3.5 bg-black/60 border-b border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-2 bg-[#202c33] p-1 rounded-2xl border border-slate-700/60">
            {/* Tab 1: Photo Capture */}
            <button
              onClick={() => {
                setActiveTab("photo");
                setPayStep("scan");
              }}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === "photo"
                  ? "bg-[#00a884] text-white shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Camera</span>
            </button>

            {/* Tab 2: Scan & Pay (UPI QR) */}
            <button
              onClick={() => setActiveTab("pay")}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === "pay"
                  ? "bg-[#5c7cd8] text-white shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Scan & Pay (UPI)</span>
            </button>
          </div>

          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ================= MODE 1: PHOTO CAPTURE ================= */}
        {activeTab === "photo" && (
          <div className="flex flex-col">
            {/* Viewport Canvas */}
            <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
              {capturedImage ? (
                <img src={capturedImage} alt="Captured Snapshot" className="w-full h-full object-contain" />
              ) : streamActive ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover ${facingMode === "user" ? "scale-x-[-1]" : ""}`}
                />
              ) : (
                <div className="flex flex-col items-center justify-center p-6 text-center max-w-md space-y-3">
                  <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-white">Camera Inactive</h4>
                  <p className="text-xs text-slate-300 leading-relaxed px-2">
                    {errorMsg || "Could not access camera device."}
                  </p>

                  <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
                    <button
                      onClick={() => startCamera(facingMode)}
                      className="px-4 py-2 bg-[#202c33] hover:bg-[#2a3942] border border-slate-700 text-xs font-semibold rounded-xl text-emerald-400 cursor-pointer flex items-center gap-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Retry</span>
                    </button>

                    <button
                      onClick={handleGenerateDemoPhoto}
                      className="px-4 py-2 bg-[#00a884] hover:bg-[#02906f] text-white text-xs font-bold rounded-xl shadow-lg cursor-pointer flex items-center gap-1.5"
                    >
                      <Zap className="w-3.5 h-3.5 fill-white" />
                      <span>Use Test Photo</span>
                    </button>

                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 cursor-pointer flex items-center gap-1.5"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Pick File</span>
                    </button>
                  </div>

                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                </div>
              )}

              <canvas ref={canvasRef} className="hidden" />
            </div>

            {/* Bottom Controls */}
            <div className="p-4 bg-black/60 border-t border-slate-800 flex flex-col gap-3">
              {capturedImage ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Add a caption..."
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSendFromPreview();
                    }}
                    autoFocus
                    className="w-full py-2 px-4 bg-[#202c33] border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => {
                        setCapturedImage(null);
                        setCaption("");
                        startCamera(facingMode);
                      }}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#202c33] hover:bg-[#2a3942] text-xs font-bold text-slate-300 cursor-pointer"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>Retake</span>
                    </button>

                    <button
                      onClick={handleSendFromPreview}
                      className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#00a884] hover:bg-[#02906f] text-white font-bold text-xs shadow-lg cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                      <span>Send Photo</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between w-full">
                  <button
                    onClick={() => setFacingMode((prev) => (prev === "user" ? "environment" : "user"))}
                    className="p-3 rounded-full bg-[#202c33] hover:bg-[#2a3942] text-slate-300 hover:text-white cursor-pointer"
                    title="Switch Camera"
                  >
                    <FlipHorizontal className="w-5 h-5" />
                  </button>

                  <div className="flex flex-col items-center gap-1.5">
                    <button
                      onClick={streamActive ? handleDirectClickAndSend : handleGenerateDemoPhoto}
                      className="px-6 py-3 rounded-full bg-[#00a884] hover:bg-[#02906f] text-white font-bold text-xs flex items-center gap-2.5 shadow-xl shadow-emerald-500/30 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                    >
                      <Zap className="w-4 h-4 fill-white" />
                      <span>Direct Click & Send ⚡</span>
                    </button>
                  </div>

                  <button
                    onClick={streamActive ? handleCapturePreview : handleGenerateDemoPhoto}
                    className="p-3 rounded-full bg-[#202c33] hover:bg-[#2a3942] text-slate-300 hover:text-white cursor-pointer"
                    title="Capture with Caption"
                  >
                    <ImageIcon className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= MODE 2: SCAN & PAY (UPI) ================= */}
        {activeTab === "pay" && (
          <div className="p-6 space-y-4">
            {payStep === "scan" && (
              <div className="space-y-4 animate-fade-in">
                {/* Viewfinder Camera Area with Crosshairs */}
                <div className="relative aspect-video bg-black rounded-2xl overflow-hidden border-2 border-[#5c7cd8] shadow-2xl flex items-center justify-center">
                  {streamActive ? (
                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center p-4">
                      <Camera className="w-10 h-10 text-slate-500 mx-auto mb-2" />
                      <p className="text-xs text-slate-400">Position any UPI QR code inside the frame to pay</p>
                    </div>
                  )}

                  {/* Laser Scanning Beam */}
                  <div className="absolute inset-x-4 top-1/2 h-0.5 bg-[#5c7cd8] shadow-[0_0_15px_#5c7cd8] animate-pulse" />

                  {/* Viewfinder Corners */}
                  <div className="absolute top-4 left-4 w-8 h-8 border-t-4 border-l-4 border-[#5c7cd8]" />
                  <div className="absolute top-4 right-4 w-8 h-8 border-t-4 border-r-4 border-[#5c7cd8]" />
                  <div className="absolute bottom-4 left-4 w-8 h-8 border-b-4 border-l-4 border-[#5c7cd8]" />
                  <div className="absolute bottom-4 right-4 w-8 h-8 border-b-4 border-r-4 border-[#5c7cd8]" />
                </div>

                {/* Quick Pay Contact / Merchant list */}
                <div className="space-y-2">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Or Select Contact / Merchant to Pay:
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    {SAMPLE_PAYEES.map((p, i) => (
                      <div
                        key={i}
                        onClick={() => handleSelectPayee(p)}
                        className="p-3 bg-[#202c33] hover:bg-[#2a3942] border border-slate-750 rounded-2xl flex items-center gap-3 cursor-pointer transition-colors"
                      >
                        <img src={p.avatar} alt={p.name} className="w-8 h-8 rounded-full object-cover bg-slate-800" />
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs font-bold text-white truncate">{p.name}</h4>
                          <p className="text-[10px] text-emerald-400 truncate">{p.upiId}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {payStep === "enter_amount" && (
              <form onSubmit={handleProceedToPin} className="space-y-4 animate-fade-in max-w-md mx-auto">
                <div className="p-3.5 bg-[#202c33] border border-slate-750 rounded-2xl flex items-center gap-3">
                  <img src={payee.avatar} alt={payee.name} className="w-10 h-10 rounded-full object-cover bg-slate-800" />
                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>Paying {payee.name}</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    </h4>
                    <p className="text-[11px] text-slate-400 font-mono">{payee.upiId}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Enter Amount</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-emerald-400">₹</span>
                    <input
                      type="number"
                      placeholder="0"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      autoFocus
                      required
                      min="1"
                      className="w-full pl-10 pr-4 py-2.5 bg-[#182229] border border-slate-700 rounded-xl text-xl font-bold text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-2 overflow-x-auto">
                    {PRESET_AMOUNTS.map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setAmount(String(amt))}
                        className="px-3 py-1 rounded-xl bg-[#202c33] hover:bg-[#2a3942] border border-slate-700 text-xs font-bold text-slate-200 cursor-pointer"
                      >
                        +₹{amt}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <input
                    type="text"
                    placeholder="Add a payment note (e.g. Dinner, Rent)..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full py-2 px-3 bg-[#182229] border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setPayStep("scan")}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 text-xs font-bold text-slate-300 cursor-pointer"
                  >
                    Back
                  </button>

                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-[#00a884] hover:bg-[#02906f] text-white font-bold text-xs rounded-xl shadow-lg cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>Proceed to Pay ₹{amount || "0"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}

            {payStep === "enter_pin" && (
              <div className="space-y-4 text-center animate-fade-in max-w-xs mx-auto">
                <div className="space-y-1">
                  <div className="w-10 h-10 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto mb-1">
                    <Lock className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold text-white">Enter 4-Digit UPI PIN</h4>
                  <p className="text-xs text-slate-400">Paying ₹{amount} to {payee.name}</p>
                </div>

                <div className="flex items-center justify-center gap-3 py-1">
                  {[0, 1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className={`w-3.5 h-3.5 rounded-full border-2 transition-all ${
                        upiPin.length > i
                          ? "bg-emerald-400 border-emerald-400 scale-110 shadow-[0_0_10px_#00a884]"
                          : "border-slate-600 bg-transparent"
                      }`}
                    />
                  ))}
                </div>

                {isProcessing ? (
                  <div className="py-4 flex flex-col items-center space-y-2">
                    <RefreshCw className="w-6 h-6 text-emerald-400 animate-spin" />
                    <p className="text-xs text-slate-300">Authorizing Payment...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-1.5 pt-1">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, "C", 0, "⌫"].map((k, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          if (k === "C") setUpiPin("");
                          else if (k === "⌫") setUpiPin(upiPin.slice(0, -1));
                          else handlePinDigit(String(k));
                        }}
                        className="py-2.5 rounded-xl bg-[#202c33] hover:bg-[#2a3942] active:scale-95 text-xs font-bold text-white cursor-pointer"
                      >
                        {k}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {payStep === "success" && (
              <div className="space-y-4 text-center animate-fade-in max-w-sm mx-auto py-2">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/30 animate-bounce">
                  <Check className="w-6 h-6 stroke-[3]" />
                </div>

                <div className="space-y-0.5">
                  <h3 className="text-base font-bold text-white">Payment Successful!</h3>
                  <p className="text-2xl font-extrabold text-emerald-400 font-mono">₹{amount}</p>
                  <p className="text-xs text-slate-300">Paid to {payee.name}</p>
                </div>

                <div className="p-3 bg-[#202c33] border border-slate-750 rounded-xl text-left space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>UPI Ref ID</span>
                    <span className="font-mono text-white">{txnId}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Payee UPI</span>
                    <span className="font-mono text-white">{payee.upiId}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Time</span>
                    <span className="text-white">{new Date().toLocaleTimeString()}</span>
                  </div>
                </div>

                <div className="space-y-2 pt-1">
                  <button
                    onClick={handleSendPaymentReceipt}
                    className="w-full py-2.5 bg-[#00a884] hover:bg-[#02906f] text-white font-bold text-xs rounded-xl shadow-lg cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Receipt to Chat 🧾⚡</span>
                  </button>

                  <button
                    onClick={onClose}
                    className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CameraCaptureModal;
