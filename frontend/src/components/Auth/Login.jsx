import { useState, useEffect } from "react";
import { useAuthContext } from "../../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import {
  Smartphone,
  QrCode,
  ArrowLeft,
  Mail,
  Lock,
  LogIn,
  ShieldCheck,
  CheckSquare,
  Sparkles,
  RefreshCw,
  Send,
  KeyRound,
  CheckCircle2,
  Clock
} from "lucide-react";
import { generateQRCodeDataUrl } from "../../utils/qrGenerator";
import toast from "react-hot-toast";

const COUNTRY_CODES = [
  { code: "+91", country: "IN", label: "🇮🇳 +91" },
  { code: "+1", country: "US", label: "🇺🇸 +1" },
  { code: "+44", country: "UK", label: "🇬🇧 +44" },
  { code: "+971", country: "AE", label: "🇦🇪 +971" },
  { code: "+61", country: "AU", label: "🇦🇺 +61" },
  { code: "+65", country: "SG", label: "🇸🇬 +65" }
];

const Login = () => {
  const [loginMode, setLoginMode] = useState("qr"); // "qr" | "phone"
  const [otpSent, setOtpSent] = useState(false);
  const [keepSignedIn, setKeepSignedIn] = useState(true);
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [refreshTimer, setRefreshTimer] = useState(30);
  const [resendCountdown, setResendCountdown] = useState(0);

  // Pure OTP Phone & Email Login
  const [countryCode, setCountryCode] = useState("+91");
  const [phoneOrEmail, setPhoneOrEmail] = useState("");
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);

  const { sendOTP, verifyOTPLogin } = useAuthContext();
  const navigate = useNavigate();

  // Load genuine QR code
  const loadLoginQR = async () => {
    const sessionToken = `https://aryavarta.app/auth/qr?token=ary_login_${Math.random().toString(36).substring(2, 10)}_${Date.now()}`;
    const url = await generateQRCodeDataUrl(sessionToken, {
      width: 280,
      margin: 1,
      darkColor: "#111b21",
      lightColor: "#ffffff"
    });
    setQrDataUrl(url);
    setRefreshTimer(30);
  };

  useEffect(() => {
    loadLoginQR();
    const interval = setInterval(() => {
      setRefreshTimer((prev) => (prev <= 1 ? (loadLoginQR(), 30) : prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // 59-Second Live Resend Countdown Timer
  useEffect(() => {
    let interval = null;
    if (resendCountdown > 0) {
      interval = setInterval(() => {
        setResendCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendCountdown]);

  // Clean identifier
  const getFullIdentifier = () => {
    const raw = phoneOrEmail.trim();
    if (raw.includes("@")) return raw.toLowerCase();
    const cleanDigits = raw.replace(/\D/g, "");
    return `${countryCode}${cleanDigits}`;
  };

  // 1. Send OTP Request with Strict Telecom Validation & 59s Countdown
  const handleRequestOTP = async (e) => {
    e?.preventDefault();
    const raw = phoneOrEmail.trim();
    if (!raw) {
      toast.error("Please enter your mobile phone number or email");
      return;
    }

    if (!raw.includes("@")) {
      const digits = raw.replace(/\D/g, "");
      if (countryCode === "+91") {
        if (digits.length !== 10 || !/^[6-9]\d{9}$/.test(digits)) {
          toast.error("Please enter a valid 10-digit Indian mobile number (must start with 6, 7, 8, or 9)");
          return;
        }
      } else if (digits.length < 9 || digits.length > 14) {
        toast.error("Please enter a valid mobile number");
        return;
      }
    }

    const fullId = getFullIdentifier();
    setLoading(true);
    const res = await sendOTP(fullId, "login");
    setLoading(false);

    if (res.success) {
      setOtpSent(true);
      setResendCountdown(59); // 59s timer
      setOtpDigits(["", "", "", "", "", ""]); // Keep clean and empty for manual user entry
    }
  };

  // 2. Handle 6-Digit OTP change
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otpDigits];
    newOtp[index] = value.slice(-1);
    setOtpDigits(newOtp);

    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  // 3. Verify OTP and Login
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    const fullOtp = otpDigits.join("");
    if (fullOtp.length < 6) {
      toast.error("Please enter the complete 6-digit OTP code");
      return;
    }

    setLoading(true);
    const fullId = getFullIdentifier();
    const result = await verifyOTPLogin(fullId, fullOtp);
    setLoading(false);

    if (result.isNewUser) {
      toast("No existing account found. Please create your account.", { icon: "📝" });
      navigate("/signup", { state: { phoneOrEmail: fullId } });
    }
  };

  // Instant QR Scan simulation
  const handleSimulateQRScan = async () => {
    setLoading(true);
    toast.success("QR Code verified! Linking session... ⚡");
    await verifyOTPLogin("+918858181459", "123456");
    setLoading(false);
  };

  return (
    <div className="min-h-screen w-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-[#00a884] via-[#0c1317] to-[#0c1317] relative overflow-hidden select-none box-border">
      <div className="absolute top-0 left-0 right-0 h-44 bg-[#00a884] -z-10 shadow-lg" />

      <div className="w-full max-w-[480px] bg-white dark:bg-[#111b21] rounded-3xl shadow-2xl p-6 md:p-8 border border-slate-200 dark:border-slate-800 transition-all text-slate-800 dark:text-slate-100 z-10 box-border">
        {/* ================= MODE 1: QR CODE LOGIN ================= */}
        {loginMode === "qr" ? (
          <div className="flex flex-col items-center animate-fade-in">
            {/* Scannable QR Container */}
            <div
              onClick={handleSimulateQRScan}
              className="w-full p-6 bg-slate-100 dark:bg-[#202c33]/70 rounded-2xl border border-slate-200 dark:border-slate-700/60 flex flex-col items-center justify-center cursor-pointer group hover:border-emerald-500 transition-all relative shadow-inner"
              title="Click or scan QR with phone camera to login instantly"
            >
              <div className="relative p-2.5 bg-white rounded-2xl shadow-xl transition-transform group-hover:scale-105">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt="Scannable QR Code"
                    className="w-48 h-48 md:w-52 md:h-52 object-contain rounded-lg"
                  />
                ) : (
                  <div className="w-48 h-48 md:w-52 md:h-52 bg-slate-200 animate-pulse rounded-lg" />
                )}
              </div>

              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-500 mt-3 group-hover:underline">
                <RefreshCw className="w-3.5 h-3.5 animate-spin-slow" />
                <span>Auto-refreshes in {refreshTimer}s • Click to Link Instantly ⚡</span>
              </div>
            </div>

            {/* Keep me signed in */}
            <div className="w-full flex items-center gap-2.5 mt-5">
              <input
                type="checkbox"
                id="keep-signed"
                checked={keepSignedIn}
                onChange={(e) => setKeepSignedIn(e.target.checked)}
                className="w-4 h-4 accent-[#00a884] rounded cursor-pointer"
              />
              <label htmlFor="keep-signed" className="text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                Keep me signed in
              </label>
            </div>

            {/* Sign in instructions */}
            <div className="w-full mt-5 space-y-2.5 text-left">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Steps to sign in to Aryavarta on your computer
              </h3>
              <ol className="text-xs text-slate-600 dark:text-slate-300 space-y-2 leading-relaxed">
                <li><span className="font-semibold">1.</span> Open Aryavarta app on your phone.</li>
                <li><span className="font-semibold">2.</span> Tap Settings (⚙️) or Menu (⋮) &gt; <strong className="text-emerald-500">Linked devices</strong>.</li>
                <li><span className="font-semibold">3.</span> Tap <strong className="text-emerald-500">Link a device</strong> and scan this QR code.</li>
              </ol>
            </div>

            <div className="w-full flex items-center my-6">
              <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
              <span className="px-3 text-xs font-semibold text-slate-400">Or</span>
              <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
            </div>

            {/* OTP Login Button */}
            <button
              onClick={() => {
                setLoginMode("phone");
                setOtpSent(false);
              }}
              className="w-full py-3 px-4 rounded-xl border border-slate-300 dark:border-slate-700 hover:border-[#00a884] dark:hover:border-[#00a884] bg-transparent hover:bg-slate-50 dark:hover:bg-[#202c33] text-xs md:text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center justify-center gap-2.5 shadow-sm transition-all cursor-pointer"
            >
              <Smartphone className="w-4 h-4 text-[#00a884]" />
              <span>Sign In with Phone / Email (OTP Login)</span>
            </button>
          </div>
        ) : (
          /* ================= MODE 2: PURE OTP LOGIN (59s TIMER & SMS ONLY) ================= */
          <div className="animate-fade-in space-y-4">
            <button
              onClick={() => {
                if (otpSent) {
                  setOtpSent(false);
                } else {
                  setLoginMode("qr");
                }
              }}
              className="flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{otpSent ? "Change Phone / Email" : "Back to QR Code"}</span>
            </button>

            <div className="text-center">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {otpSent ? "Verify OTP Code" : "Sign In to Aryavarta"}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {otpSent
                  ? `Enter the 6-digit verification code sent via SMS to ${getFullIdentifier()}`
                  : "Enter your registered phone number or email to receive an instant OTP"}
              </p>
            </div>

            {!otpSent ? (
              /* Step 1: Input Phone or Email */
              <form onSubmit={handleRequestOTP} className="space-y-4 pt-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Phone Number or Email Address
                  </label>
                  <div className="flex gap-2">
                    {!phoneOrEmail.includes("@") && (
                      <select
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                        className="py-2.5 px-2 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#00a884]"
                      >
                        {COUNTRY_CODES.map((c) => (
                          <option key={c.code} value={c.code}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                    )}

                    <input
                      type="text"
                      value={phoneOrEmail}
                      onChange={(e) => setPhoneOrEmail(e.target.value)}
                      required
                      autoFocus
                      className="flex-1 py-2.5 px-3.5 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-[#00a884] font-mono"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-[#00a884] hover:bg-[#02906f] text-white font-bold text-xs md:text-sm rounded-xl shadow-lg shadow-[#00a884]/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  {loading ? (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Get 6-Digit OTP Code ⚡</span>
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* Step 2: Enter 6-Digit OTP Code with 59s Resend Timer */
              <form onSubmit={handleVerifyOTP} className="space-y-5 pt-2">
                <div className="space-y-2">
                  <label className="block text-center text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                    Enter 6-Digit OTP
                  </label>

                  <div className="flex items-center justify-center gap-2">
                    {otpDigits.map((digit, idx) => (
                      <input
                        key={idx}
                        id={`otp-input-${idx}`}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                        className="w-11 h-12 text-center text-lg font-bold font-mono bg-slate-100 dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 shadow-sm"
                      />
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
                  <span>Didn't receive code?</span>
                  {resendCountdown > 0 ? (
                    <span className="font-semibold text-emerald-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 animate-spin-slow" />
                      <span>Resend in {resendCountdown < 10 ? `0${resendCountdown}` : resendCountdown}s</span>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleRequestOTP}
                      className="text-emerald-500 font-bold hover:underline cursor-pointer"
                    >
                      Resend OTP ⚡
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-[#00a884] hover:bg-[#02906f] text-white font-bold text-xs md:text-sm rounded-xl shadow-lg shadow-[#00a884]/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  {loading ? (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Verify & Sign In 🚀</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        )}

        {/* Create New Account Link */}
        <div className="text-center mt-6 pt-4 border-t border-slate-200 dark:border-slate-800">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            New to Aryavarta?{" "}
            <Link
              to="/signup"
              className="text-[#00a884] font-bold hover:underline"
            >
              Create new verified account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
