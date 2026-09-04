import { useState, useEffect, useMemo } from "react";
import { useAuthContext } from "../../context/AuthContext";
import { Link } from "react-router-dom";
import {
  User,
  Phone,
  Mail,
  MapPin,
  Globe,
  Building,
  Navigation,
  ShieldCheck,
  UserPlus,
  Send,
  CheckCircle2,
  ChevronDown,
  Clock,
  ArrowRight,
  ArrowLeft,
  Check,
  Sparkles,
  AlertCircle
} from "lucide-react";
import { LOCATION_DATA } from "../../utils/locationData";
import toast from "react-hot-toast";

// 3-Step Email-First Signup Flow
const STEPS = [
  { id: 1, title: "Profile & Email", short: "1. Email" },
  { id: 2, title: "Verify Code", short: "2. Verify OTP" },
  { id: 3, title: "Location Details", short: "3. Complete" }
];

// Common disposable/temporary domains for instant client-side feedback
const COMMON_DISPOSABLE_DOMAINS = new Set([
  "mailinator.com", "tempmail.com", "guerrillamail.com", "10minutemail.com",
  "yopmail.com", "sharklasers.com", "throwawaymail.com", "dispostable.com",
  "getairmail.com", "mohmal.com", "trashmail.com", "burnermail.io",
  "dropmail.me", "fakeinbox.com", "temp-mail.org", "crazymailing.com",
  "generator.email", "fakemailgenerator.com", "emailondeck.com", "maildrop.cc",
  "mytemp.email", "getnada.com", "inboxkitten.com", "trashmail.net"
]);

const Signup = () => {
  const [currentStep, setCurrentStep] = useState(1);

  // Step 1: Profile & Required Email
  const [fullname, setFullname] = useState("");
  const [gender, setGender] = useState("male");
  const [email, setEmail] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);

  // Step 2: Email OTP Verification
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [emailOtpValue, setEmailOtpValue] = useState("");
  const [emailTimer, setEmailTimer] = useState(0);
  const [emailToken, setEmailToken] = useState(null); // Proof of email verification

  // Step 3: Location Details & Optional Phone
  const countryList = Object.keys(LOCATION_DATA);
  const [selectedCountry, setSelectedCountry] = useState("India");
  const countryCode = LOCATION_DATA[selectedCountry]?.code || "+91";
  const [phoneRaw, setPhoneRaw] = useState("");
  const availableStates = selectedCountry
    ? Object.keys(LOCATION_DATA[selectedCountry]?.states || {})
    : [];
  const [selectedState, setSelectedState] = useState("");
  const availableDistricts =
    selectedCountry && selectedState
      ? LOCATION_DATA[selectedCountry]?.states?.[selectedState]?.districts || []
      : [];
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [pincode, setPincode] = useState("");
  const [about, setAbout] = useState("");
  const [phoneError, setPhoneError] = useState("");

  const [loading, setLoading] = useState(false);
  const { sendEmailOTP, verifyEmailOTP, registerAccount } = useAuthContext();

  // Real-time inline email validation feedback
  const emailValidationError = useMemo(() => {
    if (!email.trim()) return "";
    const clean = email.trim().toLowerCase();
    const regex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+\.[a-zA-Z]{2,}$/;
    if (!regex.test(clean)) {
      return "Please enter a valid email format (e.g. name@domain.com)";
    }
    const domain = clean.split("@")[1];
    if (domain && COMMON_DISPOSABLE_DOMAINS.has(domain)) {
      return `Temporary / disposable emails (${domain}) are not allowed. Please use a permanent email.`;
    }
    return "";
  }, [email]);

  const isEmailValid = email.trim().length > 0 && !emailValidationError;

  // 59s Resend Countdown Timer for Email
  useEffect(() => {
    let interval = null;
    if (emailTimer > 0) {
      interval = setInterval(() => setEmailTimer((p) => p - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [emailTimer]);

  // Country Change
  const handleCountryChange = (cName) => {
    setSelectedCountry(cName);
    setSelectedState("");
    setSelectedDistrict("");
    setPincode("");
  };

  // State Change
  const handleStateChange = (stName) => {
    setSelectedState(stName);
    setSelectedDistrict("");
    setPincode("");
  };

  // District Change -> autofill pincode if available
  const handleDistrictChange = (dName) => {
    setSelectedDistrict(dName);
    if (dName && availableDistricts.length > 0) {
      const match = availableDistricts.find(
        (d) => (typeof d === "string" ? d : d?.name) === dName
      );
      if (match && typeof match === "object" && match.pincode) {
        setPincode(match.pincode);
      }
    }
  };

  // =========================================================================
  // STEP 1: SUBMIT & DISPATCH EMAIL OTP VIA RESEND
  // =========================================================================
  const handleStep1Submit = async (e) => {
    e.preventDefault();
    if (!fullname.trim()) {
      toast.error("Please enter your full name");
      return;
    }
    if (!email.trim()) {
      toast.error("Please enter your email address");
      return;
    }
    if (emailValidationError) {
      toast.error(emailValidationError);
      return;
    }

    setLoading(true);
    const cleanEmail = email.trim().toLowerCase();
    const res = await sendEmailOTP(cleanEmail, "signup");
    setLoading(false);

    if (res.success) {
      setEmailOtpSent(true);
      setEmailTimer(59);
      setCurrentStep(2);
    }
  };

  // =========================================================================
  // STEP 2: VERIFY 6-DIGIT EMAIL CODE
  // =========================================================================
  const handleStep2Submit = async (e) => {
    e.preventDefault();
    if (emailOtpValue.length !== 6) {
      toast.error("Please enter the complete 6-digit verification code");
      return;
    }

    setLoading(true);
    const cleanEmail = email.trim().toLowerCase();
    const res = await verifyEmailOTP(cleanEmail, emailOtpValue.trim(), "signup");
    setLoading(false);

    if (res.success && res.email_token) {
      setEmailToken(res.email_token);
      setCurrentStep(3);
    }
  };

  // Resend Email OTP
  const handleResendEmailOTP = async () => {
    if (emailTimer > 0 || loading) return;
    setLoading(true);
    const cleanEmail = email.trim().toLowerCase();
    const res = await sendEmailOTP(cleanEmail, "signup");
    setLoading(false);

    if (res.success) {
      setEmailTimer(59);
      setEmailOtpValue("");
    }
  };

  // =========================================================================
  // STEP 3: FINAL ACCOUNT CREATION (TIED TO VERIFIED EMAIL TOKEN)
  // =========================================================================
  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    if (!emailToken) {
      toast.error("Please complete email verification first");
      setCurrentStep(1);
      return;
    }
    if (!selectedState) {
      toast.error("Please select your State / Region");
      return;
    }
    if (!selectedDistrict) {
      toast.error("Please select your District / City");
      return;
    }
    if (!pincode.trim()) {
      toast.error("Please enter your PIN Code / Postal Code");
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    const fullPhone = phoneRaw.trim() ? `${countryCode}${phoneRaw.trim().replace(/\D/g, "")}` : undefined;

    setLoading(true);
    setPhoneError("");
    const res = await registerAccount({
      fullname: fullname.trim(),
      email: cleanEmail,
      email_token: emailToken,
      phone: fullPhone,
      gender,
      country: selectedCountry || "India",
      state: selectedState,
      district: selectedDistrict,
      pincode: pincode.trim(),
      about: about.trim() || "Available | Using Aryavarta 🚀"
    });
    setLoading(false);

    if (!res.success && res.message) {
      if (res.message.toLowerCase().includes("phone") || res.message.toLowerCase().includes("linked")) {
        setPhoneError(res.message);
      }
    }
  };

  // Masked email for display (e.g. u****r@gmail.com)
  const maskedEmail = useMemo(() => {
    if (!email) return "";
    const clean = email.trim().toLowerCase();
    return clean.replace(/^(.)(.*)(@.*)$/, (_, a, b, c) => a + "*".repeat(Math.max(b.length - 2, 2)) + c);
  }, [email]);

  return (
    <div className="min-h-screen w-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-[#00a884] via-[#0c1317] to-[#0c1317] relative overflow-hidden select-none box-border py-8">
      {/* Top Banner Accent */}
      <div className="absolute top-0 left-0 right-0 h-48 bg-[#00a884] -z-10 shadow-lg" />

      {/* Main Container Card */}
      <div className="w-full max-w-xl bg-white dark:bg-[#111b21] rounded-3xl shadow-2xl p-6 md:p-8 border border-slate-200 dark:border-slate-800 transition-all text-slate-800 dark:text-slate-100 z-10 box-border max-h-[94vh] flex flex-col">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-4 flex-shrink-0">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-emerald-500/30 mb-2">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Create <span className="bg-gradient-to-r from-emerald-500 via-teal-400 to-indigo-500 bg-clip-text text-transparent">Aryavarta</span> Account
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Email Verification Code Authentication
          </p>
        </div>

        {/* 3-Step Progression Bar */}
        <div className="grid grid-cols-3 gap-2 mb-5 px-1 flex-shrink-0">
          {STEPS.map((s) => {
            const isCompleted =
              (s.id === 1 && currentStep > 1) ||
              (s.id === 2 && emailToken);
            const isCurrent = currentStep === s.id;

            return (
              <div
                key={s.id}
                className={`py-2 px-1 rounded-xl border text-center transition-all ${
                  isCompleted
                    ? "bg-emerald-500/10 border-emerald-500 text-emerald-500 font-bold"
                    : isCurrent
                    ? "bg-[#00a884] border-[#00a884] text-white font-bold shadow-md"
                    : "bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400 text-xs"
                }`}
              >
                <div className="flex items-center justify-center gap-1 text-[11px]">
                  {isCompleted ? <Check className="w-3.5 h-3.5" /> : null}
                  <span>{s.short}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Scrollable Step Forms */}
        <div className="flex-1 min-h-0 overflow-y-auto pr-1">
          {/* ================= STEP 1: PROFILE & REQUIRED EMAIL ================= */}
          {currentStep === 1 && (
            <form onSubmit={handleStep1Submit} className="space-y-4 animate-fade-in">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={fullname}
                    onChange={(e) => setFullname(e.target.value)}
                    required
                    autoFocus
                    placeholder="Enter your full name"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#00a884]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Gender / Profile Avatar
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "male", label: "👨 Male" },
                    { id: "female", label: "👩 Female" },
                    { id: "other", label: "🌟 Other" }
                  ].map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setGender(g.id)}
                      className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                        gender === g.id
                          ? "bg-[#00a884] border-[#00a884] text-white shadow-md"
                          : "bg-slate-100 dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800"
                      }`}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Compulsory Email Field with Real-time Inline Validation */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1 flex items-center justify-between">
                  <span>EMAIL ADDRESS *</span>
                  <span className="text-[10px] text-emerald-500 font-semibold">1 Email = 1 Verified Account</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (!emailTouched) setEmailTouched(true);
                    }}
                    onBlur={() => setEmailTouched(true)}
                    required
                    placeholder="you@example.com"
                    className={`w-full pl-10 pr-10 py-2.5 bg-slate-100 dark:bg-slate-900 border rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none transition-all ${
                      emailTouched && emailValidationError
                        ? "border-red-500 focus:border-red-500 bg-red-50/10"
                        : emailTouched && isEmailValid
                        ? "border-emerald-500 focus:border-emerald-500 bg-emerald-50/10"
                        : "border-slate-300 dark:border-slate-700 focus:border-[#00a884]"
                    }`}
                  />
                  {/* Inline Icon Feedback */}
                  {emailTouched && (
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                      {emailValidationError ? (
                        <AlertCircle className="w-4 h-4 text-red-500" />
                      ) : isEmailValid ? (
                        <Check className="w-4 h-4 text-emerald-500" />
                      ) : null}
                    </div>
                  )}
                </div>

                {/* Inline Error / Success Messages */}
                {emailTouched && emailValidationError ? (
                  <p className="text-[11px] text-red-500 dark:text-red-400 mt-1.5 flex items-center gap-1 font-medium animate-fade-in">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{emailValidationError}</span>
                  </p>
                ) : emailTouched && isEmailValid ? (
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1 font-medium animate-fade-in">
                    <Check className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>Valid permanent email format</span>
                  </p>
                ) : (
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                    Temporary or disposable email domains (e.g. Mailinator, TempMail) are blocked.
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || (emailTouched && !!emailValidationError) || !email.trim() || !fullname.trim()}
                className="w-full py-3 bg-[#00a884] hover:bg-[#02906f] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs md:text-sm rounded-xl shadow-lg shadow-[#00a884]/25 flex items-center justify-center gap-2 transition-all cursor-pointer mt-2"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send Verification Code</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* ================= STEP 2: VERIFY 6-DIGIT EMAIL CODE ================= */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-fade-in">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-emerald-500 cursor-pointer transition-all"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Change Email Address</span>
              </button>

              <div className="text-center space-y-1">
                <span className="text-[11px] font-semibold text-emerald-500">Step 2 of 3: Email Verification</span>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Verify Your Email Address</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Enter the 6-digit verification code sent to:
                </p>
                <div className="inline-block py-1 px-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs font-mono font-bold text-emerald-400 mt-1">
                  ✉️ {maskedEmail || email}
                </div>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-[#182229] border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3">
                <form onSubmit={handleStep2Submit} className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 uppercase mb-1">
                      Enter 6-Digit Code *
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={emailOtpValue}
                      onChange={(e) => setEmailOtpValue(e.target.value.replace(/\D/g, ""))}
                      autoFocus
                      required
                      placeholder="123456"
                      className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-center text-lg font-bold tracking-widest text-slate-900 dark:text-white focus:outline-none focus:border-[#00a884] font-mono"
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-slate-500">Didn't receive code?</span>
                    <button
                      type="button"
                      onClick={handleResendEmailOTP}
                      disabled={loading || emailTimer > 0}
                      className={`font-semibold flex items-center gap-1 transition-all ${
                        emailTimer > 0
                          ? "text-slate-400 cursor-not-allowed"
                          : "text-[#00a884] hover:underline cursor-pointer"
                      }`}
                    >
                      {emailTimer > 0 ? (
                        <>
                          <Clock className="w-3.5 h-3.5 animate-spin-slow" />
                          <span>Resend in {emailTimer < 10 ? `0${emailTimer}` : emailTimer}s</span>
                        </>
                      ) : (
                        <span>Resend Email Code</span>
                      )}
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || emailOtpValue.length !== 6}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs md:text-sm rounded-xl shadow-lg cursor-pointer transition-all flex items-center justify-center gap-2 mt-2"
                  >
                    {loading ? (
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Verify & Continue</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* ================= STEP 3: LOCATION DETAILS & OPTIONAL PHONE ================= */}
          {currentStep === 3 && (
            <form onSubmit={handleFinalSubmit} className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-emerald-500">Step 3 of 3: Complete Profile</span>
                <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Email Verified</span>
                </span>
              </div>

              {/* Verified Email Banner */}
              <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-2 text-xs text-emerald-400 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span className="truncate">Verified Email: {email}</span>
              </div>

              {/* Location Selector */}
              <div className="p-3.5 bg-slate-50 dark:bg-[#182229] border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3">
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Location Details *</span>
                </span>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-400 uppercase mb-1">
                      Country *
                    </label>
                    <div className="relative">
                      <select
                        value={selectedCountry}
                        onChange={(e) => handleCountryChange(e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#00a884] appearance-none cursor-pointer"
                      >
                        {countryList.map((c) => (
                          <option key={c} value={c}>
                            {LOCATION_DATA[c]?.flag} {c}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-400 uppercase mb-1">
                      State / Region *
                    </label>
                    <div className="relative">
                      <select
                        value={selectedState}
                        onChange={(e) => handleStateChange(e.target.value)}
                        required
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#00a884] appearance-none cursor-pointer"
                      >
                        <option value="">Select State</option>
                        {availableStates.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-400 uppercase mb-1">
                      District / City *
                    </label>
                    <div className="relative">
                      <select
                        value={selectedDistrict}
                        onChange={(e) => handleDistrictChange(e.target.value)}
                        disabled={!selectedState}
                        required
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#00a884] appearance-none cursor-pointer disabled:opacity-50"
                      >
                        <option value="">Select District / City</option>
                        {availableDistricts.map((dst) => {
                          const name = typeof dst === "string" ? dst : dst?.name;
                          return (
                            <option key={name} value={name}>
                              {name}
                            </option>
                          );
                        })}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-400 uppercase mb-1">
                      PIN Code / Postal Code *
                    </label>
                    <input
                      type="text"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      required
                      placeholder="e.g. 226001"
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#00a884] font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Optional Phone Number */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1 flex items-center justify-between">
                  <span>Mobile Phone (Optional)</span>
                  <span className="text-[10px] text-slate-400 font-normal">Optional</span>
                </label>
                <div className="flex gap-2">
                  <div className="py-2 px-3 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                    <span>{LOCATION_DATA[selectedCountry]?.flag}</span>
                    <span>{countryCode}</span>
                  </div>
                  <div className="relative flex-1">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="tel"
                      maxLength={10}
                      value={phoneRaw}
                      onChange={(e) => {
                        setPhoneRaw(e.target.value.replace(/\D/g, ""));
                        setPhoneError("");
                      }}
                      placeholder="9876543210 (optional)"
                      className={`w-full pl-10 pr-3.5 py-2.5 bg-slate-100 dark:bg-slate-900 border ${
                        phoneError ? "border-red-500 focus:border-red-500" : "border-slate-300 dark:border-slate-700 focus:border-[#00a884]"
                      } rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none`}
                    />
                  </div>
                </div>
                {phoneError && (
                  <div className="flex items-center gap-1.5 mt-1.5 px-1 text-red-500 animate-fade-in">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="text-[11px] font-semibold">{phoneError}</span>
                  </div>
                )}
              </div>

              {/* Status Bio */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
                  About / Status Bio
                </label>
                <input
                  type="text"
                  value={about}
                  onChange={(e) => setAbout(e.target.value)}
                  placeholder="Available | Using Aryavarta 🚀"
                  className="w-full py-2 px-3.5 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#00a884]"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#00a884] hover:bg-[#02906f] text-white font-bold text-xs md:text-sm rounded-xl shadow-lg shadow-[#00a884]/25 flex items-center justify-center gap-2 transition-all cursor-pointer mt-2"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Create & Launch My Account 🚀</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Footer Link */}
        <div className="pt-4 mt-3 border-t border-slate-200 dark:border-slate-800 text-center flex-shrink-0">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-[#00a884] font-bold hover:underline ml-1 inline-flex items-center gap-1"
            >
              <span>Login to Aryavarta</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
