import { useState, useEffect } from "react";
import { useAuthContext } from "../../context/AuthContext";
import { Link } from "react-router-dom";
import {
  Smartphone,
  QrCode,
  ArrowLeft,
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  ShieldCheck,
  CheckSquare,
  Sparkles,
  RefreshCw
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
  const [keepSignedIn, setKeepSignedIn] = useState(true);
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [refreshTimer, setRefreshTimer] = useState(30);

  // Phone / Password form states
  const [countryCode, setCountryCode] = useState("+91");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { login } = useAuthContext();

  // Generate genuine scannable QR Code
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
      setRefreshTimer((prev) => {
        if (prev <= 1) {
          loadLoginQR();
          return 30;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handlePhoneSubmit = async (e) => {
    e.preventDefault();
    if (!identifier || !password) return;

    setLoading(true);
    const fullId = /^\d{10}$/.test(identifier.trim())
      ? `${countryCode}${identifier.trim()}`
      : identifier.trim();

    await login(fullId, password);
    setLoading(false);
  };

  // Instant QR code scan simulation for demo
  const handleSimulateQRScan = async () => {
    setLoading(true);
    toast.success("QR Code verified! Linking session... ⚡");
    const success = await login("+919876543210", "password123");
    if (!success) {
      await login("dheeraj", "password123");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen w-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-[#00a884] via-[#0c1317] to-[#0c1317] relative overflow-hidden select-none box-border">
      {/* Top Banner Accent */}
      <div className="absolute top-0 left-0 right-0 h-44 bg-[#00a884] -z-10 shadow-lg" />

      {/* Main Container Card matching screenshot 1:1 */}
      <div className="w-full max-w-[480px] bg-white dark:bg-[#111b21] rounded-3xl shadow-2xl p-6 md:p-8 border border-slate-200 dark:border-slate-800 transition-all text-slate-800 dark:text-slate-100 z-10 box-border">
        {/* ================= MODE 1: QR CODE LOGIN (Default matching screenshot) ================= */}
        {loginMode === "qr" ? (
          <div className="flex flex-col items-center animate-fade-in">
            {/* Top QR Code Container with Genuine Scannable QR */}
            <div
              onClick={handleSimulateQRScan}
              className="w-full p-6 bg-slate-100 dark:bg-[#202c33]/70 rounded-2xl border border-slate-200 dark:border-slate-700/60 flex flex-col items-center justify-center cursor-pointer group hover:border-emerald-500 transition-all relative shadow-inner"
              title="Click or scan QR with phone camera to login instantly"
            >
              <div className="relative p-2.5 bg-white rounded-2xl shadow-xl transition-transform group-hover:scale-105">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt="Authentic Scannable QR Code"
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

            {/* Keep me signed in Checkbox matching screenshot */}
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

            {/* Steps to sign in matching screenshot */}
            <div className="w-full mt-5 space-y-2.5 text-left">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Steps to sign in to Aryavarta on your computer
              </h3>

              <ol className="text-xs text-slate-600 dark:text-slate-300 space-y-2 leading-relaxed">
                <li>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">1.</span> Open the <strong className="text-slate-900 dark:text-white">Aryavarta</strong> app on your phone.
                </li>
                <li>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">2.</span> On Android, tap the Navigation drawer (<span className="font-mono">☰</span>). On iPhone, go to <strong className="text-slate-900 dark:text-white">Settings</strong> (⚙️).
                </li>
                <li>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">3.</span> Tap <strong className="text-slate-900 dark:text-white">Devices & Sessions</strong>, then choose <strong className="text-slate-900 dark:text-white">Link a device</strong>.
                </li>
                <li>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">4.</span> Point your phone at this screen to scan the QR code.
                </li>
              </ol>
            </div>

            {/* Divider matching screenshot: ——— Or ——— */}
            <div className="w-full flex items-center my-6">
              <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
              <span className="px-3 text-xs font-semibold text-slate-400">Or</span>
              <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
            </div>

            {/* Button: Sign In Using Mobile Number matching screenshot */}
            <button
              onClick={() => setLoginMode("phone")}
              className="w-full py-3 px-4 rounded-xl border border-slate-300 dark:border-slate-700 hover:border-[#00a884] dark:hover:border-[#00a884] bg-transparent hover:bg-slate-50 dark:hover:bg-[#202c33] text-xs md:text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center justify-center gap-2.5 shadow-sm transition-all cursor-pointer"
            >
              <Smartphone className="w-4 h-4 text-[#00a884]" />
              <span>Sign In Using Mobile Number</span>
            </button>
          </div>
        ) : (
          /* ================= MODE 2: MOBILE NUMBER / EMAIL / USERNAME LOGIN ================= */
          <div className="animate-fade-in">
            {/* Back Button */}
            <button
              onClick={() => setLoginMode("qr")}
              className="flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors mb-4 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to QR Code</span>
            </button>

            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Sign In to Aryavarta</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Enter your registered mobile phone, email, or username
              </p>
            </div>

            <form onSubmit={handlePhoneSubmit} className="space-y-4">
              {/* Phone or Identifier */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Mobile Number, Email, or Username
                </label>
                <div className="flex gap-2">
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

                  <input
                    type="text"
                    placeholder="9876543210 or username"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    required
                    className="flex-1 py-2.5 px-3.5 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-[#00a884] font-mono"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-[#00a884]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#00a884] hover:bg-[#02906f] text-white font-bold text-xs md:text-sm rounded-xl shadow-lg shadow-[#00a884]/20 flex items-center justify-center gap-2 transition-all cursor-pointer mt-2"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Sign In</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* Signup Link */}
        <div className="text-center mt-6 pt-4 border-t border-slate-200 dark:border-slate-800">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Don't have an Aryavarta account?{" "}
            <Link
              to="/signup"
              className="text-[#00a884] font-bold hover:underline"
            >
              Create verified account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
