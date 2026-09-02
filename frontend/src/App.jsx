import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthContext } from "./context/AuthContext";
import Home from "./pages/Home";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import { Toaster } from "react-hot-toast";

function App() {
  const { authUser, isLoading } = useAuthContext();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0b0f19] text-white">
        <div className="w-12 h-12 border-3 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-4" />
        <p className="text-sm font-medium text-slate-400 animate-pulse">Loading PulseChat...</p>
      </div>
    );
  }

  return (
    <>
      <Routes>
        <Route path="/" element={authUser ? <Home /> : <Navigate to="/login" />} />
        <Route path="/login" element={authUser ? <Navigate to="/" /> : <LoginPage />} />
        <Route path="/signup" element={authUser ? <Navigate to="/" /> : <SignupPage />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>

      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "#1e293b",
            color: "#f8fafc",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "16px",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.4)",
            fontSize: "13px",
            padding: "12px 18px"
          },
          success: {
            iconTheme: {
              primary: "#6366f1",
              secondary: "#ffffff"
            }
          },
          error: {
            iconTheme: {
              primary: "#f43f5e",
              secondary: "#ffffff"
            }
          }
        }}
      />
    </>
  );
}

export default App;
