import { createContext, useContext, useState, useEffect } from "react";
import toast from "react-hot-toast";

const AuthContext = createContext();

export const useAuthContext = () => {
  return useContext(AuthContext);
};

export const AuthContextProvider = ({ children }) => {
  const [authUser, setAuthUser] = useState(() => {
    try {
      const stored = localStorage.getItem("chat-user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState(true);

  // Sync with backend on startup
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const res = await fetch("/api/auth/me", {
          headers: authUser?.token ? { Authorization: `Bearer ${authUser.token}` } : {}
        });
        const data = await res.json();
        if (res.ok && data.success && data.user) {
          const updatedUser = { ...data.user, token: authUser?.token };
          setAuthUser(updatedUser);
          localStorage.setItem("chat-user", JSON.stringify(updatedUser));
        } else if (res.status === 401) {
          setAuthUser(null);
          localStorage.removeItem("chat-user");
        }
      } catch (err) {
        console.warn("Auth check error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

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

      toast.success(data.message || `Verification code sent via SMS to ${phone} 📲`, {
        duration: 5000,
        icon: "📲"
      });
      return { success: true, isExistingUser: data.isExistingUser };
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

      toast.success(data.message || `Verification code sent to ${identifier} 📲`, {
        duration: 5000,
        icon: "📲"
      });
      return { success: true, destination_type: data.destination_type };
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

      const userData = { ...data.user, token: data.token };
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
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (err) {
      console.warn("Logout error:", err);
    } finally {
      setAuthUser(null);
      localStorage.removeItem("chat-user");
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
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
