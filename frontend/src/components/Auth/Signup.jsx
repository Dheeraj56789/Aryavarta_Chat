import { useState, useEffect } from "react";
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
  Sparkles
} from "lucide-react";
import { LOCATION_DATA } from "../../utils/locationData";
import toast from "react-hot-toast";

const STEPS = [
  { id: 1, title: "Profile & Phone", short: "1. Phone" },
  { id: 2, title: "SMS Verification", short: "2. Verify OTP" },
  { id: 3, title: "Location Details", short: "3. Complete" }
];

const Signup = () => {
  const [currentStep, setCurrentStep] = useState(1);

  // Step 1: Profile & Compulsory Phone
  const [fullname, setFullname] = useState("");
  const [gender, setGender] = useState("male");
  const countryList = Object.keys(LOCATION_DATA);
  const [selectedCountry, setSelectedCountry] = useState("India");
  const countryCode = LOCATION_DATA[selectedCountry]?.code || "+91";
  const [phoneRaw, setPhoneRaw] = useState("");

  // Step 2: Phone SMS OTP
  const [phoneOtpSent, setPhoneOtpSent] = useState(false);
  const [phoneOtpValue, setPhoneOtpValue] = useState("");
  const [phoneTimer, setPhoneTimer] = useState(0);
  const [phoneToken, setPhoneToken] = useState(null); // Proof of phone verification

  // Step 3: Location Details & Optional Email
  const [email, setEmail] = useState("");
  const availableStates = selectedCountry
    ? Object.keys(LOCATION_DATA[selectedCountry]?.states || {})
    : [];
  const [selectedState, setSelectedState] = useState("");
  const availableDistricts =
    selectedCountry && selectedState
      ? LOCATION_DATA[selectedCountry]?.states[selectedState]?.districts || []
      : [];
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [pincode, setPincode] = useState("");
  const [about, setAbout] = useState("");

  const [loading, setLoading] = useState(false);
  const { sendPhoneOTP, verifyPhoneOTP, registerAccount } = useAuthContext();

  // 59s Resend Countdown Timer
  useEffect(() => {
    let interval = null;
    if (phoneTimer > 0) {
      interval = setInterval(() => setPhoneTimer((p) => p - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [phoneTimer]);

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

  // District Change -> autofill pincode
  const handleDistrictChange = (distName) => {
    setSelectedDistrict(distName);
    const found = availableDistricts.find((d) => d.name === distName);
    if (found?.pincode) setPincode(found.pincode);
  };

  // ================= STEP 1: VALIDATE PROFILE & DISPATCH PHONE OTP =================
  const handleStep1Submit = async (e) => {
    e?.preventDefault();
    if (!fullname.trim() || fullname.trim().length < 2) {
      toast.error("Please enter your full name");
      return;
    }

    const raw = phoneRaw.trim().replace(/\D/g, "");
    if (countryCode === "+91") {
      if (raw.length !== 10 || !/^[6-9]\d{9}$/.test(raw)) {
        toast.error("Please enter a valid 10-digit Indian mobile number (starts with 6, 7, 8, or 9)");
        return;
      }
    } else if (raw.length < 9 || raw.length > 14) {
      toast.error("Please enter a valid mobile number for your country");
      return;
    }

    const fullPhone = `${countryCode}${raw}`;
    setLoading(true);
    const res = await sendPhoneOTP(fullPhone, "signup");
    setLoading(false);

    if (res.success) {
      setPhoneOtpSent(true);
      setPhoneTimer(59);
      setPhoneOtpValue("");
      setCurrentStep(2); // Proceed to Step 2 for OTP entry
    }
  };

  // Resend OTP in Step 2
  const handleResendPhoneOTP = async () => {
    const raw = phoneRaw.trim().replace(/\D/g, "");
    const fullPhone = `${countryCode}${raw}`;
    setLoading(true);
    const res = await sendPhoneOTP(fullPhone, "signup");
    setLoading(false);

    if (res.success) {
      setPhoneOtpSent(true);
      setPhoneTimer(59);
      setPhoneOtpValue("");
    }
  };

  // ================= STEP 2: VERIFY PHONE SMS OTP =================
  const handleVerifyPhoneCode = async (e) => {
    e?.preventDefault();
    if (!phoneOtpValue || phoneOtpValue.trim().length !== 6) {
      toast.error("Please enter the complete 6-digit verification code");
      return;
    }

    const fullPhone = `${countryCode}${phoneRaw.trim().replace(/\D/g, "")}`;
    setLoading(true);
    const res = await verifyPhoneOTP(fullPhone, phoneOtpValue.trim(), "signup");
    setLoading(false);

    if (res.success && res.phone_token) {
      setPhoneToken(res.phone_token);
      setCurrentStep(3); // Proceed to Step 3: Location Details
    }
  };

  // ================= STEP 3: FINALIZE REGISTRATION =================
  const handleFinalSubmit = async (e) => {
    e.preventDefault();

    if (!selectedState) {
      toast.error("Please select your State / Province");
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

    const fullPhone = `${countryCode}${phoneRaw.trim().replace(/\D/g, "")}`;
    const cleanEmail = email.trim() ? email.trim().toLowerCase() : undefined;

    setLoading(true);
    await registerAccount({
      fullname: fullname.trim(),
      phone: fullPhone,
      phone_token: phoneToken,
      email: cleanEmail,
      gender,
      country: selectedCountry || "India",
      state: selectedState,
      district: selectedDistrict,
      pincode: pincode.trim(),
      about: about.trim() || "Available | Using Aryavarta 🚀"
    });
    setLoading(false);
  };

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
            Compulsory Phone Number OTP Registration
          </p>
        </div>

        {/* 3-Step Progression Bar */}
        <div className="grid grid-cols-3 gap-2 mb-5 px-1 flex-shrink-0">
          {STEPS.map((s) => {
            const isCompleted =
              (s.id === 1 && currentStep > 1) ||
              (s.id === 2 && phoneToken);
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
          {/* ================= STEP 1: PROFILE & COMPULSORY PHONE ================= */}
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

              {/* Compulsory Phone Number */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1 flex items-center justify-between">
                  <span>Mobile Phone Number * (Compulsory)</span>
                  <span className="text-[10px] text-emerald-500 font-semibold">1 Phone = 1 Account</span>
                </label>
                <div className="flex gap-2">
                  <div className="py-2.5 px-3 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                    <span>{LOCATION_DATA[selectedCountry]?.flag}</span>
                    <span>{countryCode}</span>
                  </div>
                  <div className="relative flex-1">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="tel"
                      maxLength={10}
                      value={phoneRaw}
                      onChange={(e) => setPhoneRaw(e.target.value.replace(/\D/g, ""))}
                      required
                      placeholder="10-digit mobile number"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#00a884] font-mono"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !phoneRaw}
                className="w-full py-3 bg-[#00a884] hover:bg-[#02906f] text-white font-bold text-xs md:text-sm rounded-xl shadow-lg shadow-[#00a884]/20 flex items-center justify-center gap-2 transition-all cursor-pointer mt-4"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Send SMS Verification Code</span>
                    <Send className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* ================= STEP 2: PHONE SMS OTP VERIFICATION ================= */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Change Number</span>
                </button>
                <span className="text-[11px] font-semibold text-emerald-500">Step 2 of 3</span>
              </div>

              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-500/40 rounded-2xl space-y-4">
                <div className="text-center space-y-1">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-500 mx-auto flex items-center justify-center">
                    <Phone className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Verify Your Phone Number</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Enter the 6-digit verification code sent to{" "}
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {countryCode}******{phoneRaw.slice(-4)}
                    </span>
                  </p>
                </div>

                <form onSubmit={handleVerifyPhoneCode} className="space-y-3">
                  <input
                    type="text"
                    maxLength={6}
                    value={phoneOtpValue}
                    onChange={(e) => setPhoneOtpValue(e.target.value.replace(/\D/g, ""))}
                    required
                    autoFocus
                    placeholder="• • • • • •"
                    className="w-full py-3 px-4 bg-white dark:bg-slate-900 border-2 border-emerald-500 rounded-xl text-center text-xl font-bold font-mono tracking-widest text-slate-900 dark:text-white focus:outline-none shadow-inner"
                  />

                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-slate-500">Didn't receive code?</span>
                    <button
                      type="button"
                      onClick={handleResendPhoneOTP}
                      disabled={loading || phoneTimer > 0}
                      className={`font-semibold flex items-center gap-1 transition-all ${
                        phoneTimer > 0
                          ? "text-slate-400 cursor-not-allowed"
                          : "text-[#00a884] hover:underline cursor-pointer"
                      }`}
                    >
                      {phoneTimer > 0 ? (
                        <>
                          <Clock className="w-3.5 h-3.5 animate-spin-slow" />
                          <span>Resend in {phoneTimer < 10 ? `0${phoneTimer}` : phoneTimer}s</span>
                        </>
                      ) : (
                        <span>Resend SMS OTP</span>
                      )}
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || phoneOtpValue.length !== 6}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs md:text-sm rounded-xl shadow-lg cursor-pointer transition-all flex items-center justify-center gap-2 mt-2"
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

          {/* ================= STEP 3: LOCATION DETAILS & OPTIONAL EMAIL ================= */}
          {currentStep === 3 && (
            <form onSubmit={handleFinalSubmit} className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-emerald-500">Step 3 of 3: Complete Profile</span>
                <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Phone Verified</span>
                </span>
              </div>

              {/* Verified Badge */}
              <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-2 text-xs text-emerald-400 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>Verified Mobile: {countryCode} {phoneRaw}</span>
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
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                      <select
                        value={selectedCountry}
                        onChange={(e) => handleCountryChange(e.target.value)}
                        className="w-full pl-8 pr-7 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#00a884] cursor-pointer appearance-none"
                      >
                        {countryList.map((cName) => (
                          <option key={cName} value={cName}>
                            {LOCATION_DATA[cName].flag} {cName}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-400 uppercase mb-1">
                      State / Province *
                    </label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                      <select
                        value={selectedState}
                        onChange={(e) => handleStateChange(e.target.value)}
                        className="w-full pl-8 pr-7 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#00a884] cursor-pointer appearance-none"
                      >
                        <option value="" disabled>Select State</option>
                        {availableStates.map((st) => (
                          <option key={st} value={st}>{st}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-400 uppercase mb-1">
                      District / City *
                    </label>
                    <div className="relative">
                      <Navigation className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                      <select
                        value={selectedDistrict}
                        onChange={(e) => handleDistrictChange(e.target.value)}
                        disabled={!selectedState}
                        className="w-full pl-8 pr-7 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#00a884] cursor-pointer appearance-none disabled:opacity-50"
                      >
                        <option value="" disabled>Select District</option>
                        {availableDistricts.map((d) => (
                          <option key={d.name} value={d.name}>{d.name}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
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

              {/* Optional Email */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1 flex items-center justify-between">
                  <span>Email Address (Optional)</span>
                  <span className="text-[10px] text-slate-400 font-normal">Optional</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@example.com (optional)"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#00a884]"
                  />
                </div>
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

        {/* Switch to Login */}
        <div className="text-center mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 flex-shrink-0">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-[#00a884] font-bold hover:underline"
            >
              Sign In with Phone OTP
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
