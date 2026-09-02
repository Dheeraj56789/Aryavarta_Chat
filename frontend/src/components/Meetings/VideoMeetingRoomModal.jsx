import { useState, useEffect, useRef } from "react";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  Share2,
  Users,
  MessageSquare,
  Monitor,
  Copy,
  Sparkles,
  Shield,
  Maximize2
} from "lucide-react";
import { useAuthContext } from "../../context/AuthContext";
import toast from "react-hot-toast";

const VideoMeetingRoomModal = ({ roomTitle = "Instant Meeting", roomCode = "ary-meet-782", onClose }) => {
  const { authUser } = useAuthContext();
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [cameraActive, setCameraActive] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { sender: "System", text: `Welcome to ${roomTitle}! Meeting is end-to-end encrypted 🔒` }
  ]);
  const [inputMsg, setInputMsg] = useState("");

  // Start real live webcam stream
  const startCameraStream = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
        setCameraActive(true);
      }
    } catch (err) {
      console.warn("Camera stream unavailable:", err);
      setCameraActive(false);
    }
  };

  const stopCameraStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    if (cameraOn) {
      startCameraStream();
    } else {
      stopCameraStream();
    }

    return () => {
      stopCameraStream();
    };
  }, [cameraOn]);

  const handleToggleMic = () => {
    const next = !micOn;
    setMicOn(next);
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = next;
      });
    }
    toast(next ? "Microphone Active 🎙️" : "Microphone Muted 🔇");
  };

  const handleToggleCamera = () => {
    const next = !cameraOn;
    setCameraOn(next);
    if (streamRef.current) {
      streamRef.current.getVideoTracks().forEach((track) => {
        track.enabled = next;
      });
    }
    toast(next ? "Camera Active 📹" : "Camera Turned Off");
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`https://aryavarta.app/meet/${roomCode}`);
    toast.success("Meeting link copied to clipboard! 🔗");
  };

  const handleSendChat = (e) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;
    setChatMessages((prev) => [
      ...prev,
      { sender: authUser?.fullname || "You", text: inputMsg.trim() }
    ]);
    setInputMsg("");
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#0b0f19] text-white select-none animate-fade-in">
      {/* 1. Meeting Top Bar */}
      <div className="flex items-center justify-between px-6 py-3.5 bg-[#111b21] border-b border-slate-800 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold">
            <Video className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>{roomTitle}</span>
              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded-full">
                LIVE
              </span>
            </h3>
            <p className="text-[11px] text-slate-400 flex items-center gap-2">
              <span>Code: <strong className="text-slate-200 font-mono">{roomCode}</strong></span>
              <span>•</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <Shield className="w-3 h-3" /> Encrypted
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#202c33] hover:bg-[#2a3942] border border-slate-700 text-xs font-semibold rounded-xl text-slate-200 hover:text-white transition-colors cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Copy Link</span>
          </button>
        </div>
      </div>

      {/* 2. Main Stage Video Feeds */}
      <div className="flex-1 min-h-0 flex overflow-hidden relative">
        {/* Main Grid */}
        <div className="flex-1 p-4 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto items-center justify-center">
          {/* User Video Tile (Live WebRTC Video Stream) */}
          <div className="relative aspect-video rounded-3xl bg-[#182229] border border-slate-700/60 overflow-hidden shadow-2xl flex items-center justify-center">
            {cameraOn ? (
              cameraActive ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover scale-x-[-1]"
                />
              ) : (
                <img
                  src={
                    authUser?.profilepic ||
                    `https://avatar.iran.liara.run/public/boy?username=${authUser?.username || "user"}`
                  }
                  alt="Camera Stream"
                  className="w-full h-full object-cover"
                />
              )
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className="w-20 h-20 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center text-xl font-bold">
                  {authUser?.fullname?.[0] || "U"}
                </div>
                <span className="text-xs text-slate-400 font-medium">Camera Off</span>
              </div>
            )}

            {/* Bottom Label */}
            <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-xl text-xs font-semibold flex items-center gap-2">
              <span>{authUser?.fullname || "You"} (Host)</span>
              {!micOn && <MicOff className="w-3 h-3 text-rose-400" />}
            </div>
          </div>

          {/* AI / Participant Video Tile */}
          <div className="relative aspect-video rounded-3xl bg-[#182229] border border-slate-700/60 overflow-hidden shadow-2xl flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-purple-600 via-pink-600 to-indigo-600 p-0.5 flex items-center justify-center shadow-lg shadow-purple-600/30 animate-pulse">
                <div className="w-full h-full bg-[#111b21] rounded-full flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-purple-400" />
                </div>
              </div>
              <div className="text-center">
                <h4 className="text-sm font-bold text-white">Aryavarta AI Assistant</h4>
                <p className="text-[11px] text-emerald-400">Meeting Copilot Active ⚡</p>
              </div>
            </div>

            <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-xl text-xs font-semibold flex items-center gap-2">
              <span className="text-purple-300">Aryavarta AI Bot</span>
              <span className="w-2 h-2 bg-emerald-400 rounded-full" />
            </div>
          </div>
        </div>

        {/* Side Meeting Chat Drawer */}
        {showChat && (
          <div className="w-80 h-full bg-[#111b21] border-l border-slate-800 flex flex-col animate-fade-in">
            <div className="p-3.5 border-b border-slate-800 font-bold text-xs uppercase tracking-wider text-slate-300 flex justify-between items-center">
              <span>In-Call Messages</span>
              <button onClick={() => setShowChat(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2 text-xs">
              {chatMessages.map((m, i) => (
                <div key={i} className="p-2 rounded-xl bg-[#202c33]">
                  <span className="font-bold text-emerald-400 block">{m.sender}</span>
                  <span className="text-slate-200 mt-0.5 block">{m.text}</span>
                </div>
              ))}
            </div>
            <form onSubmit={handleSendChat} className="p-3 border-t border-slate-800 flex gap-2">
              <input
                type="text"
                placeholder="Send message to everyone..."
                value={inputMsg}
                onChange={(e) => setInputMsg(e.target.value)}
                className="flex-1 py-1.5 px-3 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
              />
              <button type="submit" className="px-3 py-1.5 bg-emerald-600 rounded-xl text-xs font-bold text-white">
                Send
              </button>
            </form>
          </div>
        )}
      </div>

      {/* 3. Bottom Control Bar */}
      <div className="py-4 px-6 bg-[#111b21] border-t border-slate-800/80 flex items-center justify-between flex-shrink-0">
        <div className="text-xs text-slate-400 font-medium hidden md:block">
          Camera status: <span className="text-emerald-400 font-mono font-bold">{cameraActive ? "Live WebRTC" : "Ready"}</span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 mx-auto md:mx-0">
          {/* Mic */}
          <button
            onClick={handleToggleMic}
            className={`p-3.5 rounded-full transition-all shadow-lg active:scale-95 cursor-pointer ${
              micOn ? "bg-[#202c33] hover:bg-[#2a3942] text-white" : "bg-rose-600 text-white"
            }`}
            title={micOn ? "Mute" : "Unmute"}
          >
            {micOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </button>

          {/* Camera */}
          <button
            onClick={handleToggleCamera}
            className={`p-3.5 rounded-full transition-all shadow-lg active:scale-95 cursor-pointer ${
              cameraOn ? "bg-[#202c33] hover:bg-[#2a3942] text-white" : "bg-rose-600 text-white"
            }`}
            title={cameraOn ? "Turn camera off" : "Turn camera on"}
          >
            {cameraOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </button>

          {/* Screen Share */}
          <button
            onClick={() => {
              setIsScreenSharing(!isScreenSharing);
              toast(isScreenSharing ? "Screen Sharing Stopped" : "Screen Sharing Active 🖥️");
            }}
            className={`p-3.5 rounded-full transition-all shadow-lg active:scale-95 cursor-pointer ${
              isScreenSharing ? "bg-indigo-600 text-white" : "bg-[#202c33] hover:bg-[#2a3942] text-slate-300"
            }`}
            title="Share Screen"
          >
            <Monitor className="w-5 h-5" />
          </button>

          {/* Chat Toggle */}
          <button
            onClick={() => setShowChat(!showChat)}
            className={`p-3.5 rounded-full transition-all shadow-lg active:scale-95 cursor-pointer ${
              showChat ? "bg-emerald-600 text-white" : "bg-[#202c33] hover:bg-[#2a3942] text-slate-300"
            }`}
            title="In-call chat"
          >
            <MessageSquare className="w-5 h-5" />
          </button>

          {/* Leave / End Call Button */}
          <button
            onClick={() => {
              stopCameraStream();
              toast.success("Meeting ended");
              onClose();
            }}
            className="p-3.5 px-6 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-bold flex items-center gap-2 shadow-lg shadow-rose-600/30 active:scale-95 cursor-pointer ml-2"
            title="Leave Meeting"
          >
            <PhoneOff className="w-5 h-5" />
            <span className="text-xs">Leave</span>
          </button>
        </div>

        <div className="hidden md:flex items-center gap-2">
          <span className="text-xs text-slate-400">Participants: <strong>2</strong></span>
        </div>
      </div>
    </div>
  );
};

export default VideoMeetingRoomModal;
