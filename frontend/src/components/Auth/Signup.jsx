import { useState } from "react";
import { useAuthContext } from "../../context/AuthContext";
import { Link } from "react-router-dom";
import { User, AtSign, Mail, Phone, Lock, Eye, EyeOff, UserPlus, ShieldCheck, CheckCircle2, AlertCircle } from "lucide-react";

const COUNTRY_CODES = [
  { code: "+91", country: "IN", label: "🇮🇳 India (+91)" },
  { code: "+1", country: "US", label: "🇺🇸 USA (+1)" },
  { code: "+44", country: "UK", label: "🇬🇧 UK (+44)" },
  { code: "+971", country: "AE", label: "🇦🇪 UAE (+971)" },
  { code: "+61", country: "AU", label: "🇦🇺 Australia (+61)" },
  { code: "+65", country: "SG", label: "🇸🇬 Singapore (+65)" },
  { code: "+49", country: "DE", label: "🇩🇪 Germany (+49)" },
  { code: "+33", country: "FR", label: "🇫🇷 France (+33)" }
];

const Signup = () => {
  const [countryCode, setCountryCode] = useState("+91");
  const [phoneRaw, setPhoneRaw] = useState("");
  const [formData, setFormData] = useState({
    fullname: "",
    username: "",
    email: "",
    gender: "male",
    password: "",
    confirmPassword: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { signup } = useAuthContext();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGenderSelect = (gender) => {
    setFormData({ ...formData, gender });
  };

  const handlePhoneChange = (e) => {
    // Only allow digits in phone number
    const value = e.target.value.replace(/\D/g, "");
    setPhoneRaw(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (phoneRaw.length < 10) {
      alert("Please enter a valid 10-digit phone number");
      return;
    }

    const fullPhone = `${countryCode}${phoneRaw}`;
    setLoading(true);
    await signup({ ...formData, phone: fullPhone });
    setLoading(false);
  };

  return (
    <div className="w-full max-w-lg p-7 glass-panel rounded-3xl border border-slate-800/80 shadow-2xl relative overflow-hidden my-3 box-border">
      {/* Glow Orbs */}
      <div className="ambient-glow-1" />
      <div className="ambient-glow-2" />

      {/* Brand Header */}
      <div className="flex flex-col items-center text-center mb-5 relative z-10">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-emerald-500/30 mb-2">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">
          Create <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-indigo-400 bg-clip-text text-transparent">Aryavarta</span> Account
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">Verified Unique Phone Number & Email Required</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-3 relative z-10">
        {/* Full Name & Username in 2 columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Full Name *
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                name="fullname"
                placeholder="e.g. Dheeraj Singh"
                value={formData.fullname}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-3 py-2 bg-slate-900/90 border border-slate-700/80 rounded-xl text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Unique Username *
            </label>
            <div className="relative">
              <AtSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                name="username"
                placeholder="e.g. dheeraj_singh"
                value={formData.username}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-3 py-2 bg-slate-900/90 border border-slate-700/80 rounded-xl text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20"
              />
            </div>
          </div>
        </div>

        {/* Unique Phone Number with Country Code */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>Mobile Phone Number (Unique) *</span>
            <span className="text-[10px] text-emerald-400 font-normal">Real 10-digit number</span>
          </label>
          <div className="flex gap-2">
            <select
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value)}
              className="py-2 px-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              {COUNTRY_CODES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.label}
                </option>
              ))}
            </select>

            <div className="relative flex-1">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="tel"
                placeholder="98765 43210"
                maxLength={10}
                value={phoneRaw}
                onChange={handlePhoneChange}
                required
                className="w-full pl-10 pr-3 py-2 bg-slate-900/90 border border-slate-700/80 rounded-xl text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Real Email Address */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
            Email Address (Unique) *
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="email"
              name="email"
              placeholder="dheeraj@example.com"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full pl-10 pr-3 py-2 bg-slate-900/90 border border-slate-700/80 rounded-xl text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20"
            />
          </div>
        </div>

        {/* Gender Selection */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
            Gender / Avatar
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: "male", label: "Male" },
              { id: "female", label: "Female" },
              { id: "other", label: "Other" }
            ].map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => handleGenderSelect(g.id)}
                className={`py-1.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  formData.gender === g.id
                    ? "bg-emerald-600/40 border-emerald-500 text-white shadow-md shadow-emerald-500/20"
                    : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200"
                }`}
              >
                <span>{g.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Password & Confirm Password in 2 columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Password (min 6 chars) *
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="••••••"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-3 py-2 bg-slate-900/90 border border-slate-700/80 rounded-xl text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Confirm Password *
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type={showPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-9 py-2 bg-slate-900/90 border border-slate-700/80 rounded-xl text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 px-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-semibold text-xs rounded-xl shadow-xl shadow-emerald-600/25 flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 mt-3 cursor-pointer"
        >
          {loading ? (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <UserPlus className="w-4 h-4" />
              Register Verified Aryavarta Account
            </>
          )}
        </button>
      </form>

      {/* Switch to Login */}
      <div className="text-center mt-4 relative z-10">
        <p className="text-xs text-slate-400">
          Already registered?{" "}
          <Link
            to="/login"
            className="text-emerald-400 font-semibold hover:text-emerald-300 transition-colors underline underline-offset-4"
          >
            Sign In with Email, Phone, or Username
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
