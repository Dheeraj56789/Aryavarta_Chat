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
          // Token expired or logged out
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

  const login = async (identifier, password) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: identifier, password })
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to log in");
      }

      const userData = { ...data.user, token: data.token };
      setAuthUser(userData);
      localStorage.setItem("chat-user", JSON.stringify(userData));
      toast.success(`Welcome back, ${data.user.fullname}! ✨`);
      return true;
    } catch (err) {
      toast.error(err.message || "Login failed");
      return false;
    }
  };

  const signup = async ({ fullname, username, email, phone, gender, password, confirmPassword }) => {
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return false;
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullname, username, email, phone, gender, password })
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Registration failed");
      }

      const userData = { ...data.user, token: data.token };
      setAuthUser(userData);
      localStorage.setItem("chat-user", JSON.stringify(userData));
      toast.success("Account created successfully with verified details! 🎉");
      return true;
    } catch (err) {
      toast.error(err.message || "Signup failed");
      return false;
    }
  };

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

  return (
    <AuthContext.Provider
      value={{
        authUser,
        setAuthUser,
        isLoading,
        login,
        signup,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
