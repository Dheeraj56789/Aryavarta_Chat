import { createContext, useContext, useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";

const AuthContext = createContext();

export const useAuthContext = () => {
  return useContext(AuthContext);
};

export const AuthContextProvider = ({ children }) => {
  // Start with null auth state - NEVER trust localStorage blindly before backend confirmation
  const [authUser, setAuthUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Helper for immediate session termination (e.g. force logout when logged in from another device)
  const handleSessionExpiredElsewhere = useCallback((reason = "Your account was logged in from another location.") => {
    console.log("%c[SingleSession Client] Step 2: Clearing ALL auth-related storage (localStorage & sessionStorage)...", "color: #f59e0b; font-weight: bold; font-size: 13px;");
    setAuthUser(null);
    localStorage.removeItem("chat-user");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("jwt");
    localStorage.removeItem("auth-token");
    sessionStorage.clear();

    // Expire cookies on client side
    document.cookie = "jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

    console.log("%c[SingleSession Client] Step 3: Displaying session expired toast alert...", "color: #ef4444; font-weight: bold; font-size: 13px;");
    toast.error(reason, {
      id: "session-expired-toast",
      duration: 8000,
      icon: "🔒"
    });

    console.log("%c[SingleSession Client] Step 4: Forcing immediate redirect to /login...", "color: #ef4444; font-weight: bold; font-size: 13px;");
    setTimeout(() => {
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }, 150);
  }, []);

  // Global fetch response interceptor for single-session enforcement (SESSION_EXPIRED_ELSEWHERE)
  useEffect(() => {
    const originalFetch = window.fetch;

    window.fetch = async (...args) => {
      const response = await originalFetch(...args);

      if (response.status === 401) {
        try {
          const clone = response.clone();
          const data = await clone.json();
          if (data && (data.code === "SESSION_EXPIRED_ELSEWHERE" || data.message === "SESSION_EXPIRED_ELSEWHERE")) {
            console.log("%c[SingleSession Client] Step 1 (API Interceptor): HTTP 401 SESSION_EXPIRED_ELSEWHERE received from server!", "color: red; font-weight: bold; font-size: 13px;");
            handleSessionExpiredElsewhere(data.reason || "Your account was logged in from another location.");
          }
        } catch {
          // Ignore JSON parsing errors for non-JSON 401s
        }
      }

      return response;
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, [handleSessionExpiredElsewhere]);

  // Mandatory Backend Session Verification on Startup, Page Refresh, and Window Focus
  const checkAuthStatus = useCallback(async () => {
    const rawStored = localStorage.getItem("chat-user");
    if (!rawStored) {
      setAuthUser(null);
      setIsLoading(false);
      return;
    }

    let parsed = null;
    try {
      parsed = JSON.parse(rawStored);
    } catch {
      localStorage.removeItem("chat-user");
      setAuthUser(null);
      setIsLoading(false);
      return;
    }

    const token = parsed?.token;

    try {
      console.log("[AuthStartup] Verifying session with backend /api/auth/me...");
      const res = await fetch("/api/auth/me", {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const data = await res.json();

      if (res.ok && data.success && data.user) {
        console.log("[AuthStartup] Session verified successfully with backend.");
        const verifiedUser = {
          ...data.user,
          token,
          currentSessionId: data.user.currentSessionId || data.sessionId || parsed.currentSessionId
        };
        setAuthUser(verifiedUser);
        localStorage.setItem("chat-user", JSON.stringify(verifiedUser));
      } else {
        console.warn("[AuthStartup] Backend rejected session verification:", data?.message || data?.reason || res.status);
        setAuthUser(null);
        localStorage.removeItem("chat-user");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("jwt");
        localStorage.removeItem("auth-token");
        sessionStorage.clear();
        document.cookie = "jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

        if (data && (data.code === "SESSION_EXPIRED_ELSEWHERE" || data.message === "SESSION_EXPIRED_ELSEWHERE")) {
          toast.error(data.reason || "Your account was logged in from another location.", {
            id: "session-expired-toast",
            duration: 8000,
            icon: "🔒"
          });
        }
      }
    } catch (err) {
      console.warn("[AuthStartup] Verification network error:", err);
      // In case of offline/network failure, keep state clean
      setAuthUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Run on initial mount and setup re-verification on window focus / tab visibility
  useEffect(() => {
    checkAuthStatus();

    const handleWindowFocus = () => {
      const stored = localStorage.getItem("chat-user");
      if (stored) {
        checkAuthStatus();
      }
    };

    window.addEventListener("focus", handleWindowFocus);
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        handleWindowFocus();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("focus", handleWindowFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [checkAuthStatus]);

  // 1. Phone OTP Dispatch (Zero OTP exposure)
  const sendPhoneOTP = async (phone, purpose = "signup") => {
    try {
      const res = await fetch("/api/auth/phone/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, purpose })
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to send SMS verification code");
      }

      if (data.isSandbox) {
        toast.success(data.message, {
          duration: 8000,
          icon: "🛠️"
        });
      } else {
        toast.success(data.message || `Verification code sent via SMS to ${phone} 📲`, {
          duration: 5000,
          icon: "📲"
        });
      }
      return { success: true, isExistingUser: data.isExistingUser, isSandbox: data.isSandbox };
    } catch (err) {
      toast.error(err.message || "Could not send SMS verification code");
      return { success: false, message: err.message };
    }
  };

  // 2. Phone OTP Verification
  const verifyPhoneOTP = async (phone, otp, purpose = "signup") => {
    try {
      const res = await fetch("/api/auth/phone/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp, purpose })
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Phone verification failed");
      }

      toast.success(data.message || "Phone number verified successfully! ✅");
      return { success: true, phone_token: data.phone_token };
    } catch (err) {
      toast.error(err.message || "Invalid phone OTP code");
      return { success: false, message: err.message };
    }
  };

  // 3. Email OTP Dispatch (Zero OTP exposure)
  const sendEmailOTP = async (email, purpose = "signup") => {
    try {
      const res = await fetch("/api/auth/email/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, purpose })
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to send email verification code");
      }

      toast.success(data.message || `Verification code sent to ${email} ✉️`, {
        duration: 5000,
        icon: "✉️"
      });
      return { success: true, isExistingUser: data.isExistingUser };
    } catch (err) {
      toast.error(err.message || "Could not send email verification code");
      return { success: false, message: err.message };
    }
  };

  // 4. Email OTP Verification
  const verifyEmailOTP = async (email, otp, purpose = "signup") => {
    try {
      const res = await fetch("/api/auth/email/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, purpose })
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Email verification failed");
      }

      toast.success(data.message || "Email address verified successfully! ✅");
      return { success: true, email_token: data.email_token };
    } catch (err) {
      toast.error(err.message || "Invalid email OTP code");
      return { success: false, message: err.message };
    }
  };

  // 5. Final Account Registration (Validates Phone + Email verification tokens)
  const registerAccount = async (payload) => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Account creation failed");
      }

      const userData = { ...data.user, token: data.token };
      setAuthUser(userData);
      localStorage.setItem("chat-user", JSON.stringify(userData));
      toast.success("Account created & verified successfully! Welcome to Aryavarta 🚀");
      return { success: true, user: userData };
    } catch (err) {
      toast.error(err.message || "Registration failed");
      return { success: false, message: err.message };
    }
  };

  // 6. Login OTP Dispatch (Phone or Email)
  const sendLoginOTP = async (identifier) => {
    try {
      const res = await fetch("/api/auth/login/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier })
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        if (data.isNewUser) {
          return { success: false, isNewUser: true, message: data.message };
        }
        throw new Error(data.message || "Failed to send verification code");
      }

      if (data.isSandbox) {
        toast.success(data.message, {
          duration: 8000,
          icon: "🛠️"
        });
      } else {
        toast.success(data.message || `Verification code sent to ${identifier} 📲`, {
          duration: 5000,
          icon: "📲"
        });
      }
      return { success: true, destination_type: data.destination_type, isSandbox: data.isSandbox };
    } catch (err) {
      toast.error(err.message || "Could not send OTP");
      return { success: false, message: err.message };
    }
  };

  // 7. Login OTP Verification
  const verifyLoginOTP = async (identifier, otp) => {
    try {
      const res = await fetch("/api/auth/login/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, otp })
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        if (data.isNewUser) {
          return { success: false, isNewUser: true, message: data.message };
        }
        throw new Error(data.message || "Login verification failed");
      }

      const userData = { ...data.user, token: data.token, currentSessionId: data.sessionId };
      setAuthUser(userData);
      localStorage.setItem("chat-user", JSON.stringify(userData));
      toast.success(`Welcome back, ${data.user.fullname}! ✨`);
      return { success: true, user: userData };
    } catch (err) {
      toast.error(err.message || "Invalid verification code");
      return { success: false, message: err.message };
    }
  };

  // Logout
  const logout = async () => {
    try {
      const stored = localStorage.getItem("chat-user");
      const token = stored ? JSON.parse(stored)?.token : null;
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
    } catch (err) {
      console.warn("Logout error:", err);
    } finally {
      setAuthUser(null);
      localStorage.removeItem("chat-user");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("jwt");
      localStorage.removeItem("auth-token");
      sessionStorage.clear();
      document.cookie = "jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      toast.success("Logged out successfully");
    }
  };

  // Compatibility forwards
  const sendOTP = sendLoginOTP;
  const verifyOTPLogin = verifyLoginOTP;
  const signupVerified = registerAccount;

  return (
    <AuthContext.Provider
      value={{
        authUser,
        setAuthUser,
        isLoading,
        sendPhoneOTP,
        verifyPhoneOTP,
        sendEmailOTP,
        verifyEmailOTP,
        registerAccount,
        sendLoginOTP,
        verifyLoginOTP,
        sendOTP,
        verifyOTPLogin,
        signupVerified,
        logout,
        handleSessionExpiredElsewhere
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
