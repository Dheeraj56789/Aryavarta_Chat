import { createContext, useContext, useState, useEffect } from "react";
import { useAuthContext } from "./AuthContext";
import io from "socket.io-client";

const SocketContext = createContext();

export const useSocketContext = () => {
  return useContext(SocketContext);
};

export const SocketContextProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const { authUser, handleSessionExpiredElsewhere } = useAuthContext();

  useEffect(() => {
    if (authUser && authUser._id) {
      // Connect to the backend socket with both auth token & sessionId
      const socketUrl = window.location.hostname === "localhost" ? "http://localhost:3000" : "/";
      const sessionId = authUser.currentSessionId || authUser.sessionId || "";
      const token = authUser.token || "";

      const newSocket = io(socketUrl, {
        auth: {
          token,
          sessionId,
          userId: authUser._id
        },
        query: {
          userId: authUser._id,
          sessionId
        },
        withCredentials: true
      });

      setSocket(newSocket);

      newSocket.on("getOnlineUsers", (users) => {
        setOnlineUsers(users);
      });

      // 🔒 Listen for real-time immediate force-logout event
      newSocket.on("force-logout", ({ reason, code }) => {
        console.log("%c[SingleSession Client] Step 1: Received 'force-logout' event from server!", "color: red; font-weight: bold; font-size: 13px;", { reason, code });
        try {
          newSocket.disconnect();
        } catch (e) {
          console.warn("Error disconnecting socket:", e);
        }
        setSocket(null);
        if (handleSessionExpiredElsewhere) {
          handleSessionExpiredElsewhere(reason || "Your account was logged in from another location.");
        }
      });

      newSocket.on("connect_error", (err) => {
        if (err && (err.message === "SESSION_EXPIRED_ELSEWHERE" || err.message?.includes("SESSION_EXPIRED_ELSEWHERE"))) {
          console.log("%c[SingleSession Client] Step 1 (Socket Handshake): Socket connection rejected due to SESSION_EXPIRED_ELSEWHERE", "color: red; font-weight: bold; font-size: 13px;");
          if (handleSessionExpiredElsewhere) {
            handleSessionExpiredElsewhere("Your account was logged in from another location.");
          }
        }
      });

      return () => {
        newSocket.close();
      };
    } else {
      if (socket) {
        socket.close();
        setSocket(null);
      }
    }
  }, [authUser, handleSessionExpiredElsewhere]);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};
