import { useState, useEffect, useRef, useCallback } from "react";
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
  Maximize2,
  LogOut
} from "lucide-react";
import { useAuthContext } from "../../context/AuthContext";
import { useSocketContext } from "../../context/SocketContext";
import toast from "react-hot-toast";

const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" }
  ]
};

const VideoMeetingRoomModal = ({
  roomTitle = "Instant Meeting",
  roomCode = "ary-meet-782",
  onClose,
  onMeetingEnded
}) => {
  const { authUser } = useAuthContext();
  const { socket } = useSocketContext();

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const streamRef = useRef(null);
  const peerConnectionRef = useRef(null);

  // Keep references to props so cleanup effects don't churn on parent re-renders
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const onMeetingEndedRef = useRef(onMeetingEnded);
  onMeetingEndedRef.current = onMeetingEnded;

  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [remoteUser, setRemoteUser] = useState(null);

  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [cameraActive, setCameraActive] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { sender: "System", text: `Welcome to ${roomTitle}! Meeting is end-to-end encrypted 🔒` }
  ]);
  const [inputMsg, setInputMsg] = useState("");

  // =========================================================================
  // 🛑 THOROUGH HARDWARE STREAM CLEANUP
  // Stops all hardware MediaStream tracks (video + audio) so webcam indicator turns off
  // =========================================================================
  const stopAllMediaTracks = useCallback(() => {
    // 1. Explicitly stop all tracks on streamRef
    if (streamRef.current) {
      try {
        const tracks = streamRef.current.getTracks();
        tracks.forEach((track) => {
          track.stop();
          track.enabled = false;
        });
        console.log("Local camera & microphone tracks stopped successfully.");
      } catch (err) {
        console.warn("Error stopping stream tracks:", err);
      }
      streamRef.current = null;
    }

    // 2. Detach and stop tracks on local video element
    if (localVideoRef.current) {
      try {
        const src = localVideoRef.current.srcObject;
        if (src && typeof src.getTracks === "function") {
          src.getTracks().forEach((t) => {
            t.stop();
            t.enabled = false;
          });
        }
      } catch (err) {
        console.warn("Error stopping local video srcObject:", err);
      }
      localVideoRef.current.srcObject = null;
    }

    // 3. Detach remote video element
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }

    // 4. Close WebRTC RTCPeerConnection
    if (peerConnectionRef.current) {
      try {
        peerConnectionRef.current.close();
      } catch (err) {
        console.warn("Error closing RTCPeerConnection:", err);
      }
      peerConnectionRef.current = null;
    }

    // 5. Emit leave event to signaling server
    if (socket && roomCode) {
      try {
        socket.emit("leave-meeting", { roomCode, user: authUser });
      } catch (err) {
        console.warn("Socket leave emission error:", err);
      }
    }

    setLocalStream(null);
    setRemoteStream(null);
    setCameraActive(false);
  }, [socket, roomCode, authUser]);

  // =========================================================================
  // 📹 ATTACH LOCAL STREAM TO <video> WHEN ELEMENT AND STREAM ARE READY
  // Ensures videoRef.current.srcObject = stream runs reliably, regardless of mount timing
  // =========================================================================
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      console.log("Attaching localStream to localVideoRef. Tracks:", 
        localStream.getTracks().map((t) => ({ kind: t.kind, readyState: t.readyState }))
      );
      localVideoRef.current.srcObject = localStream;
      localVideoRef.current.play().catch((err) => {
        console.warn("Local video play() autoPlay warning (expected if user hasn't interacted yet):", err);
      });
    }
  }, [localStream]);

  // Attach remote stream to remote video element
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      console.log("Attaching remoteStream to remoteVideoRef. Tracks:",
        remoteStream.getTracks().map((t) => ({ kind: t.kind, readyState: t.readyState }))
      );
      remoteVideoRef.current.srcObject = remoteStream;
      remoteVideoRef.current.play().catch((err) => {
        console.warn("Remote video play() warning:", err);
      });
    }
  }, [remoteStream]);

  // =========================================================================
  // ⚡ INITIALIZE MEDIA & WEBRTC SIGNALING (Run once per roomCode)
  // =========================================================================
  useEffect(() => {
    let isMounted = true;

    // Helper to create or get RTCPeerConnection
    const createPeerConnection = (targetSocketId) => {
      if (peerConnectionRef.current) {
        return peerConnectionRef.current;
      }

      const pc = new RTCPeerConnection(ICE_SERVERS);
      peerConnectionRef.current = pc;

      // Add local tracks to peer connection
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => {
          pc.addTrack(track, streamRef.current);
        });
      }

      // Handle incoming remote stream tracks
      pc.ontrack = (event) => {
        console.log("WebRTC ontrack received remote track:", event.track.kind, event.streams);
        if (event.streams && event.streams[0]) {
          setRemoteStream(event.streams[0]);
        }
      };

      // Handle ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate && socket) {
          socket.emit("meeting-signal", {
            roomCode,
            to: targetSocketId,
            signal: { candidate: event.candidate },
            from: authUser
          });
        }
      };

      pc.onconnectionstatechange = () => {
        console.log("Peer connection state:", pc.connectionState);
        if (pc.connectionState === "disconnected" || pc.connectionState === "failed" || pc.connectionState === "closed") {
          setRemoteStream(null);
          setRemoteUser(null);
        }
      };

      return pc;
    };

    // 1. Get Camera & Mic hardware stream
    const initMedia = async () => {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { width: { ideal: 1280 }, height: { ideal: 720 } },
            audio: true
          });

          // Log readyState as required
          console.log(
            "Stream tracks:",
            stream.getTracks().map((t) => ({ kind: t.kind, readyState: t.readyState }))
          );

          if (!isMounted) {
            stream.getTracks().forEach((t) => {
              t.stop();
              t.enabled = false;
            });
            return;
          }

          streamRef.current = stream;
          setLocalStream(stream);
          setCameraActive(true);

          // If peer connection was already created, add tracks now
          if (peerConnectionRef.current) {
            stream.getTracks().forEach((track) => {
              peerConnectionRef.current.addTrack(track, stream);
            });
          }
        }
      } catch (err) {
        console.warn("Camera/Mic stream access error:", err);
        if (isMounted) setCameraActive(false);
      }
    };

    initMedia();

    // 2. Notify backend of meeting start
    const notifyBackendMeetingStart = async () => {
      try {
        const headers = {
          "Content-Type": "application/json",
          ...(authUser?.token ? { Authorization: `Bearer ${authUser.token}` } : {})
        };
        await fetch("/api/meeting/start", {
          method: "POST",
          headers,
          body: JSON.stringify({ code: roomCode, title: roomTitle })
        });
      } catch (err) {
        console.warn("Failed to notify backend of meeting start:", err);
      }
    };
    notifyBackendMeetingStart();

    // 3. Socket signaling setup
    if (socket) {
      socket.emit("join-meeting", { roomCode, user: authUser });

      // When another user joins the room: we initiate an offer
      const handleUserJoined = async ({ socketId, user }) => {
        console.log("Another participant joined:", user?.fullname, socketId);
        setRemoteUser(user);
        toast.success(`${user?.fullname || "A participant"} joined the meeting! 👋`);

        try {
          const pc = createPeerConnection(socketId);
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);

          socket.emit("meeting-signal", {
            roomCode,
            to: socketId,
            signal: { offer },
            from: authUser
          });
        } catch (err) {
          console.error("Error creating WebRTC offer:", err);
        }
      };

      // Handle incoming signals (offer, answer, ICE candidate)
      const handleMeetingSignal = async ({ signal, from, socketId }) => {
        try {
          if (from?._id === authUser?._id) return; // ignore our own broadcast
          if (from) setRemoteUser(from);

          const pc = createPeerConnection(socketId);

          if (signal?.offer) {
            console.log("Received WebRTC offer from", from?.fullname);
            await pc.setRemoteDescription(new RTCSessionDescription(signal.offer));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);

            socket.emit("meeting-signal", {
              roomCode,
              to: socketId,
              signal: { answer },
              from: authUser
            });
          } else if (signal?.answer) {
            console.log("Received WebRTC answer from", from?.fullname);
            await pc.setRemoteDescription(new RTCSessionDescription(signal.answer));
          } else if (signal?.candidate) {
            try {
              await pc.addIceCandidate(new RTCIceCandidate(signal.candidate));
            } catch (iceErr) {
              console.warn("Error adding received ICE candidate:", iceErr);
            }
          }
        } catch (err) {
          console.error("Error handling meeting signal:", err);
        }
      };

      const handleUserLeft = ({ user }) => {
        console.log("User left meeting:", user);
        toast(`${user?.fullname || "Participant"} left the meeting`, { icon: "👋" });
        setRemoteStream(null);
        setRemoteUser(null);
        if (peerConnectionRef.current) {
          peerConnectionRef.current.close();
          peerConnectionRef.current = null;
        }
      };

      const handleHostEnded = () => {
        toast("The host has ended this meeting for everyone 🛑", { icon: "🛑" });
        stopAllMediaTracks();
        if (onMeetingEndedRef.current) onMeetingEndedRef.current(roomCode);
        if (onCloseRef.current) onCloseRef.current();
      };

      socket.on("user-joined-meeting", handleUserJoined);
      socket.on("meeting-signal", handleMeetingSignal);
      socket.on("user-left-meeting", handleUserLeft);
      socket.on("meeting-ended-by-host", handleHostEnded);

      return () => {
        isMounted = false;
        socket.off("user-joined-meeting", handleUserJoined);
        socket.off("meeting-signal", handleMeetingSignal);
        socket.off("user-left-meeting", handleUserLeft);
        socket.off("meeting-ended-by-host", handleHostEnded);
        stopAllMediaTracks();
      };
    }

    return () => {
      isMounted = false;
      stopAllMediaTracks();
    };
  }, [roomCode, roomTitle, authUser, socket, stopAllMediaTracks]);

  // Mic toggle
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

  // Camera toggle
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
    const shareableUrl = `${window.location.origin}/meet/${roomCode}`;
    navigator.clipboard.writeText(shareableUrl);
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

  // =========================================================================
  // 🏁 LEAVE / END MEETING HANDLER
  // Stops hardware tracks first, notifies backend, and closes UI
  // =========================================================================
  const handleLeaveOrEnd = async (endForAll = false) => {
    stopAllMediaTracks();

    try {
      const headers = {
        "Content-Type": "application/json",
        ...(authUser?.token ? { Authorization: `Bearer ${authUser.token}` } : {})
      };
      await fetch("/api/meeting/end", {
        method: "POST",
        headers,
        body: JSON.stringify({ code: roomCode })
      });
    } catch (err) {
      console.warn("Could not notify server of meeting end:", err);
    }

    if (endForAll && socket) {
      socket.emit("end-meeting-for-all", { roomCode });
    }

    if (onMeetingEndedRef.current) {
      onMeetingEndedRef.current(roomCode);
    }

    toast.success(endForAll ? "Meeting ended for all participants 🛑" : "You left the meeting");
    if (onCloseRef.current) {
      onCloseRef.current();
    }
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
              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded-full animate-pulse">
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
          {/* Tile 1: User's Own Camera Feed */}
          <div className="relative aspect-video rounded-3xl bg-[#182229] border border-slate-700/60 overflow-hidden shadow-2xl flex items-center justify-center">
            {/* Always mount the <video> element so ref and srcObject are never lost */}
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover scale-x-[-1] transition-opacity duration-300 ${
                cameraOn && localStream ? "opacity-100" : "opacity-0 absolute inset-0 pointer-events-none"
              }`}
            />

            {(!cameraOn || !localStream) && (
              cameraOn && !cameraActive ? (
                <img
                  src={
                    authUser?.profilepic ||
                    `https://avatar.iran.liara.run/public/boy?username=${authUser?.username || "user"}`
                  }
                  alt="Camera Loading"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-20 h-20 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center text-xl font-bold">
                    {authUser?.fullname?.[0] || "U"}
                  </div>
                  <span className="text-xs text-slate-400 font-medium">Camera Off</span>
                </div>
              )
            )}

            {/* Bottom Label */}
            <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-xl text-xs font-semibold flex items-center gap-2">
              <span>{authUser?.fullname || "You"} (You)</span>
              {!micOn && <MicOff className="w-3 h-3 text-rose-400" />}
            </div>
          </div>

          {/* Tile 2: Remote Participant (or AI Assistant standby until peer joins) */}
          <div className="relative aspect-video rounded-3xl bg-[#182229] border border-slate-700/60 overflow-hidden shadow-2xl flex items-center justify-center">
            {remoteStream ? (
              <>
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-xl text-xs font-semibold flex items-center gap-2">
                  <span className="text-white">{remoteUser?.fullname || "Remote Participant"}</span>
                  <span className="w-2 h-2 bg-emerald-400 rounded-full" />
                </div>
              </>
            ) : (
              <>
                <div className="flex flex-col items-center gap-3">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-purple-600 via-pink-600 to-indigo-600 p-0.5 flex items-center justify-center shadow-lg shadow-purple-600/30 animate-pulse">
                    <div className="w-full h-full bg-[#111b21] rounded-full flex items-center justify-center">
                      <Sparkles className="w-8 h-8 text-purple-400" />
                    </div>
                  </div>
                  <div className="text-center">
                    <h4 className="text-sm font-bold text-white">Aryavarta AI Assistant</h4>
                    <p className="text-[11px] text-emerald-400">Waiting for participants to join... ⚡</p>
                  </div>
                </div>

                <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-xl text-xs font-semibold flex items-center gap-2">
                  <span className="text-purple-300">Aryavarta AI Bot</span>
                  <span className="w-2 h-2 bg-emerald-400 rounded-full" />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Side Meeting Chat Drawer */}
        {showChat && (
          <div className="w-80 h-full bg-[#111b21] border-l border-slate-800 flex flex-col animate-fade-in">
            <div className="p-3.5 border-b border-slate-800 font-bold text-xs uppercase tracking-wider text-slate-300 flex justify-between items-center">
              <span>In-Call Messages</span>
              <button onClick={() => setShowChat(false)} className="text-slate-400 hover:text-white cursor-pointer">✕</button>
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
              <button type="submit" className="px-3 py-1.5 bg-emerald-600 rounded-xl text-xs font-bold text-white cursor-pointer">
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
        <div className="flex items-center gap-2.5 mx-auto md:mx-0">
          {/* Mic Toggle */}
          <button
            onClick={handleToggleMic}
            className={`p-3.5 rounded-full transition-all shadow-lg active:scale-95 cursor-pointer ${
              micOn ? "bg-[#202c33] hover:bg-[#2a3942] text-white" : "bg-rose-600 text-white"
            }`}
            title={micOn ? "Mute" : "Unmute"}
          >
            {micOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </button>

          {/* Camera Toggle */}
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

          {/* In-Call Chat Drawer */}
          <button
            onClick={() => setShowChat(!showChat)}
            className={`p-3.5 rounded-full transition-all shadow-lg active:scale-95 cursor-pointer ${
              showChat ? "bg-emerald-600 text-white" : "bg-[#202c33] hover:bg-[#2a3942] text-slate-300"
            }`}
            title="In-call chat"
          >
            <MessageSquare className="w-5 h-5" />
          </button>

          {/* Leave Button */}
          <button
            onClick={() => handleLeaveOrEnd(false)}
            className="p-3.5 px-5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold flex items-center gap-1.5 shadow-lg active:scale-95 cursor-pointer ml-2 border border-slate-700"
            title="Leave Meeting (Stop Camera & Microphone)"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-xs">Leave</span>
          </button>

          {/* End Meeting for All Button (Host Action) */}
          <button
            onClick={() => handleLeaveOrEnd(true)}
            className="p-3.5 px-5 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-bold flex items-center gap-1.5 shadow-lg shadow-rose-600/30 active:scale-95 cursor-pointer"
            title="End Meeting for All & Release Hardware"
          >
            <PhoneOff className="w-4 h-4" />
            <span className="text-xs">End for All</span>
          </button>
        </div>

        <div className="hidden md:flex items-center gap-2">
          <span className="text-xs text-slate-400">Participants: <strong>{remoteStream ? "2" : "1"}</strong></span>
        </div>
      </div>
    </div>
  );
};

export default VideoMeetingRoomModal;
