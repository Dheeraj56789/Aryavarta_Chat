import { useState, useRef, useEffect } from "react";
import { Camera, X, RefreshCw, Send, AlertCircle, FlipHorizontal, Zap, Image as ImageIcon, Upload, CheckCircle2, ShieldAlert } from "lucide-react";
import toast from "react-hot-toast";

const CameraCaptureModal = ({ onCapture, onDirectSend, onClose }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);

  const [streamActive, setStreamActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [caption, setCaption] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [facingMode, setFacingMode] = useState("user"); // "user" | "environment"
  const [flashEffect, setFlashEffect] = useState(false);

  const startCamera = async (mode = "user") => {
    stopCamera();
    setErrorMsg("");
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera API is not supported in this browser environment");
      }

      let stream = null;

      // Level 1: Try with facingMode
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: mode,
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        });
      } catch (err1) {
        console.warn("Retrying with simple video constraint...", err1);
        // Level 2: Try simple { video: true } (universal compatibility for desktop webcams)
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false
          });
        } catch (err2) {
          // Level 3: Enumerate any video input device
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
        setErrorMsg("Camera permission blocked. Click the 🔒 padlock icon in your browser URL bar and set Camera to 'Allow', then refresh.");
      } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
        setErrorMsg("No physical webcam hardware detected. You can upload a photo or generate an instant test photo below.");
      } else if (err.name === "NotReadableError" || err.name === "TrackStartError") {
        setErrorMsg("Webcam is already in use by another application (e.g. Zoom, Teams, OBS). Please close other camera apps and retry.");
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
    return () => {
      stopCamera();
    };
  }, [facingMode]);

  // Capture frame from video or fallback canvas
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

  // 1. ⚡ DIRECT CLICK & SEND IT (Instant 1-Click Send)
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

  // 2. Capture & Preview with Caption
  const handleCapturePreview = () => {
    setFlashEffect(true);
    setTimeout(() => setFlashEffect(false), 200);

    const dataUrl = grabFrame();
    if (!dataUrl) return;

    setCapturedImage(dataUrl);
    stopCamera();
  };

  // Fallback: Generate Test Photo / Demo Snapshot
  const handleGenerateDemoPhoto = () => {
    const canvas = canvasRef.current || document.createElement("canvas");
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext("2d");

    // Create a modern snapshot pattern
    const grad = ctx.createLinearGradient(0, 0, 640, 480);
    grad.addColorStop(0, "#005c4b");
    grad.addColorStop(1, "#111b21");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 640, 480);

    // Graphic
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

  // File Upload Fallback
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

  // Retake
  const handleRetake = () => {
    setCapturedImage(null);
    setCaption("");
    startCamera(facingMode);
  };

  // Send from preview
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

  // Flip Camera
  const handleFlipCamera = () => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 text-white select-none animate-fade-in">
      <div className="w-full max-w-xl bg-[#111b21] border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col relative">
        {/* Shutter Flash Animation Overlay */}
        {flashEffect && <div className="absolute inset-0 bg-white z-50 animate-fade-out" />}

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-3.5 bg-black/60 border-b border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#00a884]/20 text-[#00a884] flex items-center justify-center">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Direct Click & Send Camera</h3>
              <p className="text-[10px] text-emerald-400">1-Click instant photo dispatch</p>
            </div>
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

        {/* Viewport Canvas */}
        <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
          {capturedImage ? (
            /* Preview State */
            <img
              src={capturedImage}
              alt="Captured Snapshot"
              className="w-full h-full object-contain"
            />
          ) : streamActive ? (
            /* Live Stream */
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover ${facingMode === "user" ? "scale-x-[-1]" : ""}`}
            />
          ) : (
            /* Fallback State */
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
                  className="px-4 py-2 bg-[#202c33] hover:bg-[#2a3942] border border-slate-700 text-xs font-semibold rounded-xl text-emerald-400 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Retry Camera</span>
                </button>

                <button
                  onClick={handleGenerateDemoPhoto}
                  className="px-4 py-2 bg-[#00a884] hover:bg-[#02906f] text-white text-xs font-bold rounded-xl shadow-lg transition-transform active:scale-95 cursor-pointer flex items-center gap-1.5"
                >
                  <Zap className="w-3.5 h-3.5 fill-white" />
                  <span>Use Test Photo</span>
                </button>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold rounded-xl border border-slate-700 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Pick Image File</span>
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          )}

          {/* Hidden Canvas */}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Bottom Control Bar */}
        <div className="p-4 bg-black/60 border-t border-slate-800 flex flex-col gap-3">
          {capturedImage ? (
            /* Post-capture edit & send */
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
                className="w-full py-2 px-4 bg-[#202c33] border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
              />

              <div className="flex items-center justify-between">
                <button
                  onClick={handleRetake}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#202c33] hover:bg-[#2a3942] text-xs font-bold text-slate-300 hover:text-white transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Retake</span>
                </button>

                <button
                  onClick={handleSendFromPreview}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#00a884] hover:bg-[#02906f] text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Photo</span>
                </button>
              </div>
            </div>
          ) : (
            /* Live Camera Click & Send Bar */
            <div className="flex items-center justify-between w-full">
              {/* Flip camera */}
              <button
                onClick={handleFlipCamera}
                className="p-3 rounded-full bg-[#202c33] hover:bg-[#2a3942] text-slate-300 hover:text-white transition-colors cursor-pointer"
                title="Switch Camera"
              >
                <FlipHorizontal className="w-5 h-5" />
              </button>

              {/* ⚡ DIRECT CLICK & SEND BUTTON (Big Green Shutter) */}
              <div className="flex flex-col items-center gap-1.5">
                <button
                  onClick={streamActive ? handleDirectClickAndSend : handleGenerateDemoPhoto}
                  className="px-6 py-3 rounded-full bg-[#00a884] hover:bg-[#02906f] text-white font-bold text-xs flex items-center gap-2.5 shadow-xl shadow-emerald-500/30 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                  title="Direct Click & Send"
                >
                  <Zap className="w-4 h-4 fill-white" />
                  <span>Direct Click & Send ⚡</span>
                </button>
                <span className="text-[10px] text-slate-400">1-Click instant photo send</span>
              </div>

              {/* Shutter for Preview/Caption */}
              <button
                onClick={streamActive ? handleCapturePreview : handleGenerateDemoPhoto}
                className="p-3 rounded-full bg-[#202c33] hover:bg-[#2a3942] text-slate-300 hover:text-white transition-colors cursor-pointer"
                title="Capture with Caption"
              >
                <ImageIcon className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CameraCaptureModal;
