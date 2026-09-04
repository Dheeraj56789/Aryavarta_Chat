import { useState } from "react";
import { useAuthContext } from "../../context/AuthContext";
import {
  ArrowLeft,
  Smile,
  Edit2,
  Phone,
  Mail,
  Copy,
  Check,
  Camera,
  X,
  BadgeCheck,
  ShieldCheck,
  Send,
  Lock
} from "lucide-react";
import toast from "react-hot-toast";

const EditProfileView = ({ onBack }) => {
  const { authUser, setAuthUser } = useAuthContext();

  const [name, setName] = useState(authUser?.fullname || "Dheeraj Singh");
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(authUser?.fullname || "Dheeraj Singh");

  const [about, setAbout] = useState(authUser?.about || "Share a thought");
  const [isEditingAbout, setIsEditingAbout] = useState(false);
  const [tempAbout, setTempAbout] = useState(authUser?.about || "Share a thought");

  const [profilePic, setProfilePic] = useState(
    authUser?.profilepic ||
      `https://avatar.iran.liara.run/public/${authUser?.gender === "female" ? "girl" : "boy"}?username=${encodeURIComponent(authUser?.username || "user")}`
  );

  // Email Change Flow State
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [emailOtp, setEmailOtp] = useState("");
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);

  // Phone Change Flow State
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [newPhone, setNewPhone] = useState("");
  const [phoneOtp, setPhoneOtp] = useState("");
  const [phoneOtpSent, setPhoneOtpSent] = useState(false);
  const [phoneLoading, setPhoneLoading] = useState(false);

  // Save Name (persisted to backend)
  const handleSaveName = async () => {
    if (!tempName.trim()) {
      toast.error("Name cannot be empty");
      return;
    }
    try {
      const headers = {
        "Content-Type": "application/json",
        ...(authUser?.token ? { Authorization: `Bearer ${authUser.token}` } : {})
      };
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers,
        body: JSON.stringify({ fullname: tempName.trim() })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to update name");
      }

      setName(tempName.trim());
      setIsEditingName(false);
      const updated = { ...authUser, fullname: tempName.trim() };
      setAuthUser(updated);
      localStorage.setItem("chat-user", JSON.stringify(updated));
      toast.success("Name updated! ✨");
    } catch (err) {
      toast.error(err.message || "Error saving name");
    }
  };

  // Save About (persisted to backend)
  const handleSaveAbout = async () => {
    if (!tempAbout.trim()) {
      toast.error("Status cannot be empty");
      return;
    }
    try {
      const headers = {
        "Content-Type": "application/json",
        ...(authUser?.token ? { Authorization: `Bearer ${authUser.token}` } : {})
      };
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers,
        body: JSON.stringify({ about: tempAbout.trim() })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to update status");
      }

      setAbout(tempAbout.trim());
      setIsEditingAbout(false);
      const updated = { ...authUser, about: tempAbout.trim() };
      setAuthUser(updated);
      localStorage.setItem("chat-user", JSON.stringify(updated));
      toast.success("About status updated! 💬");
    } catch (err) {
      toast.error(err.message || "Error saving status");
    }
  };

  const handleCopyEmail = () => {
    const emailToCopy = authUser?.email || "user@example.com";
    navigator.clipboard.writeText(emailToCopy);
    toast.success("Email address copied to clipboard! 📋");
  };

  const handleCopyPhone = () => {
    const phoneNumber = authUser?.phone || "No phone added";
    navigator.clipboard.writeText(phoneNumber);
    toast.success("Phone number copied to clipboard! 📋");
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result;
        setProfilePic(base64);
        try {
          const headers = {
            "Content-Type": "application/json",
            ...(authUser?.token ? { Authorization: `Bearer ${authUser.token}` } : {})
          };
          await fetch("/api/user/profile", {
            method: "PUT",
            headers,
            body: JSON.stringify({ profilepic: base64 })
          });
        } catch (err) {
          console.warn("Error uploading profile pic to server:", err);
        }
        const updated = { ...authUser, profilepic: base64 };
        setAuthUser(updated);
        localStorage.setItem("chat-user", JSON.stringify(updated));
        toast.success("Profile photo updated! 📸");
      };
      reader.readAsDataURL(file);
    }
  };

  // =========================================================================
  // ✉️ EMAIL CHANGE FLOW (VERIFY OTP BEFORE COMMIT)
  // =========================================================================
  const handleSendEmailOtp = async (e) => {
    e.preventDefault();
    if (!newEmail.trim()) {
      toast.error("Please enter a new email address");
      return;
    }
    if (newEmail.trim().toLowerCase() === authUser?.email?.toLowerCase()) {
      toast.error("The new email must be different from your current email");
      return;
    }

    try {
      setEmailLoading(true);
      const res = await fetch("/api/auth/email/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newEmail.trim(), purpose: "signup" })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to send verification code");
      }

      setEmailOtpSent(true);
      toast.success(data.message || `Verification OTP sent to ${newEmail.trim()} ✉️`);
    } catch (err) {
      toast.error(err.message || "Failed to send OTP");
    } finally {
      setEmailLoading(false);
    }
  };

  const handleVerifyAndChangeEmail = async (e) => {
    e.preventDefault();
    if (!emailOtp.trim()) {
      toast.error("Please enter the 6-digit OTP");
      return;
    }

    try {
      setEmailLoading(true);
      // 1. Verify OTP with backend to get secure email_token
      const verifyRes = await fetch("/api/auth/email/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newEmail.trim(), otp: emailOtp.trim(), purpose: "signup" })
      });
      const verifyData = await verifyRes.json();
      if (!verifyRes.ok || !verifyData.success) {
        throw new Error(verifyData.message || "Invalid verification code");
      }

      // 2. Commit the change on the user document
      const changeRes = await fetch("/api/user/change-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(authUser?.token ? { Authorization: `Bearer ${authUser.token}` } : {})
        },
        body: JSON.stringify({
          newEmail: newEmail.trim(),
          email_token: verifyData.email_token
        })
      });
      const changeData = await changeRes.json();
      if (!changeRes.ok || !changeData.success) {
        throw new Error(changeData.message || "Failed to change email address");
      }

      const updated = { ...authUser, email: newEmail.trim(), email_verified: true };
      setAuthUser(updated);
      localStorage.setItem("chat-user", JSON.stringify(updated));
      toast.success("Email address updated and verified! ✉️");
      setShowEmailModal(false);
      setNewEmail("");
      setEmailOtp("");
      setEmailOtpSent(false);
    } catch (err) {
      toast.error(err.message || "Failed to verify and update email");
    } finally {
      setEmailLoading(false);
    }
  };

  // =========================================================================
  // 📱 PHONE CHANGE FLOW (DUPLICATE CHECK + OTP VERIFY BEFORE COMMIT)
  // =========================================================================
  const handleSendPhoneOtp = async (e) => {
    e.preventDefault();
    if (!newPhone.trim()) {
      toast.error("Please enter a new phone number");
      return;
    }

    try {
      setPhoneLoading(true);
      const res = await fetch("/api/auth/phone/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: newPhone.trim(), purpose: "signup" })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to send SMS verification code");
      }

      setPhoneOtpSent(true);
      toast.success(data.message || `Verification OTP sent to ${newPhone.trim()} 📲`);
    } catch (err) {
      toast.error(err.message || "Failed to send phone OTP");
    } finally {
      setPhoneLoading(false);
    }
  };

  const handleVerifyAndChangePhone = async (e) => {
    e.preventDefault();
    if (!phoneOtp.trim()) {
      toast.error("Please enter the 6-digit OTP");
      return;
    }

    try {
      setPhoneLoading(true);
      // 1. Verify OTP with backend to get secure phone_token
      const verifyRes = await fetch("/api/auth/phone/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: newPhone.trim(), otp: phoneOtp.trim(), purpose: "signup" })
      });
      const verifyData = await verifyRes.json();
      if (!verifyRes.ok || !verifyData.success) {
        throw new Error(verifyData.message || "Invalid phone verification code");
      }

      // 2. Commit the change on the user document
      const changeRes = await fetch("/api/user/change-phone", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(authUser?.token ? { Authorization: `Bearer ${authUser.token}` } : {})
        },
        body: JSON.stringify({
          newPhone: newPhone.trim(),
          phone_token: verifyData.phone_token
        })
      });
      const changeData = await changeRes.json();
      if (!changeRes.ok || !changeData.success) {
        throw new Error(changeData.message || "Failed to change phone number");
      }

      const updated = { ...authUser, phone: changeData.user?.phone || newPhone.trim(), phone_verified: true };
      setAuthUser(updated);
      localStorage.setItem("chat-user", JSON.stringify(updated));
      toast.success("Phone number updated and verified! 📱");
      setShowPhoneModal(false);
      setNewPhone("");
      setPhoneOtp("");
      setPhoneOtpSent(false);
    } catch (err) {
      toast.error(err.message || "Failed to verify and update phone");
    } finally {
      setPhoneLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col h-full min-h-0 bg-[#111b21] border-r border-slate-800/80 z-10 box-border text-slate-100 select-none">
      {/* 1. Header */}
      <div className="flex items-center gap-4 px-4 py-4 border-b border-slate-800/60 flex-shrink-0">
        <button
          onClick={onBack}
          className="p-1.5 rounded-full hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
          title="Back to Settings"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-bold text-slate-100">Edit profile</h2>
      </div>

      {/* 2. Body */}
      <div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-6">
        {/* Large Center Avatar */}
        <div className="flex flex-col items-center justify-center my-2">
          <div className="relative group cursor-pointer">
            <img
              src={profilePic}
              alt="Profile"
              className="w-32 h-32 rounded-full object-cover border-2 border-slate-700/80 shadow-2xl"
            />
            {/* Hover overlay with camera */}
            <label className="absolute inset-0 bg-black/60 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
              <Camera className="w-7 h-7 text-white mb-1" />
              <span className="text-[10px] font-bold text-white uppercase tracking-wider">
                Change Photo
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Section 1: About */}
        <div className="space-y-2">
          <span className="text-xs font-semibold text-slate-400 block tracking-wide">
            About
          </span>

          {isEditingAbout ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={tempAbout}
                onChange={(e) => setTempAbout(e.target.value)}
                autoFocus
                className="flex-1 py-2 px-3 bg-[#202c33] border border-emerald-500 rounded-xl text-sm text-slate-100 focus:outline-none"
              />
              <button
                onClick={handleSaveAbout}
                className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer"
                title="Save"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsEditingAbout(false)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 cursor-pointer"
                title="Cancel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between py-1">
              <div className="flex items-center gap-3">
                <Smile className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <span className="text-sm font-medium text-slate-200">{about}</span>
              </div>
              <button
                onClick={() => {
                  setTempAbout(about);
                  setIsEditingAbout(true);
                }}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors cursor-pointer"
                title="Edit about status"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Section 2: Email (Primary compulsory verified account identifier) */}
        <div className="space-y-2 pt-1 border-t border-slate-800/60">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 block tracking-wide">
              Email Address (Primary Account ID)
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              <BadgeCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Verified</span>
            </span>
          </div>

          <div className="flex items-center justify-between py-1">
            <div className="flex items-center gap-3 text-slate-300 min-w-0 flex-1 mr-2">
              <Mail className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <span className="text-sm font-medium text-slate-200 truncate font-mono">
                {authUser?.email || "No email linked"}
              </span>
            </div>

            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={handleCopyEmail}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors cursor-pointer"
                title="Copy email address"
              >
                <Copy className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setNewEmail("");
                  setEmailOtp("");
                  setEmailOtpSent(false);
                  setShowEmailModal(true);
                }}
                className="p-2 rounded-xl text-slate-400 hover:text-emerald-400 hover:bg-slate-800/60 transition-colors cursor-pointer"
                title="Change and re-verify email"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Section 3: Name */}
        <div className="space-y-2 pt-1 border-t border-slate-800/60">
          <span className="text-xs font-semibold text-slate-400 block tracking-wide">
            Name
          </span>

          {isEditingName ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                autoFocus
                className="flex-1 py-2 px-3 bg-[#202c33] border border-emerald-500 rounded-xl text-sm text-slate-100 focus:outline-none"
              />
              <button
                onClick={handleSaveName}
                className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer"
                title="Save"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsEditingName(false)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 cursor-pointer"
                title="Cancel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between py-1">
              <span className="text-sm font-medium text-slate-200">{name}</span>
              <button
                onClick={() => {
                  setTempName(name);
                  setIsEditingName(true);
                }}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors cursor-pointer"
                title="Edit name"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Section 4: Phone */}
        <div className="space-y-2 pt-1 border-t border-slate-800/60">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 block tracking-wide">
              Phone (Optional)
            </span>
            {authUser?.phone && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                <BadgeCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Verified</span>
              </span>
            )}
          </div>

          <div className="flex items-center justify-between py-1">
            <div className="flex items-center gap-3 text-slate-300">
              <Phone className="w-5 h-5 text-slate-400 flex-shrink-0" />
              <span className="text-sm font-medium text-slate-200 font-mono">
                {authUser?.phone || "No phone added"}
              </span>
            </div>

            <div className="flex items-center gap-1">
              {authUser?.phone && (
                <button
                  onClick={handleCopyPhone}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors cursor-pointer"
                  title="Copy phone number"
                >
                  <Copy className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => {
                  setNewPhone("");
                  setPhoneOtp("");
                  setPhoneOtpSent(false);
                  setShowPhoneModal(true);
                }}
                className="p-2 rounded-xl text-slate-400 hover:text-emerald-400 hover:bg-slate-800/60 transition-colors cursor-pointer"
                title={authUser?.phone ? "Change phone number" : "Add phone number"}
              >
                <Edit2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ================= MODAL: CHANGE EMAIL ================= */}
      {showEmailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-sm bg-[#111b21] border border-slate-800 rounded-3xl p-6 text-white space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Change Email Address</h3>
              </div>
              <button
                onClick={() => setShowEmailModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              For your security, changing your email requires sending a verification code (OTP) to your new email address.
            </p>

            {!emailOtpSent ? (
              <form onSubmit={handleSendEmailOtp} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    New Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. yourname@example.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    required
                    autoFocus
                    className="w-full py-2.5 px-3.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={emailLoading}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{emailLoading ? "Sending OTP..." : "Send Verification Code"}</span>
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyAndChangeEmail} className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-300">
                      Enter 6-Digit Code
                    </label>
                    <button
                      type="button"
                      onClick={handleSendEmailOtp}
                      disabled={emailLoading}
                      className="text-[11px] text-emerald-400 hover:underline"
                    >
                      Resend code
                    </button>
                  </div>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="123456"
                    value={emailOtp}
                    onChange={(e) => setEmailOtp(e.target.value.replace(/\D/g, ""))}
                    required
                    autoFocus
                    className="w-full py-2.5 px-3.5 bg-slate-900 border border-slate-700 rounded-xl text-sm font-mono tracking-widest text-center text-white focus:outline-none focus:border-emerald-500"
                  />
                  <p className="text-[11px] text-slate-400 mt-1 text-center">
                    Code sent to <strong className="text-slate-200">{newEmail}</strong>
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={emailLoading}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{emailLoading ? "Verifying..." : "Verify & Save New Email"}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ================= MODAL: CHANGE PHONE ================= */}
      {showPhoneModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-sm bg-[#111b21] border border-slate-800 rounded-3xl p-6 text-white space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">
                  {authUser?.phone ? "Change Phone Number" : "Add Phone Number"}
                </h3>
              </div>
              <button
                onClick={() => setShowPhoneModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Each phone number is unique to one account. A verification code (OTP) will be sent to confirm your number.
            </p>

            {!phoneOtpSent ? (
              <form onSubmit={handleSendPhoneOtp} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Mobile Phone Number (with Country Code)
                  </label>
                  <input
                    type="tel"
                    placeholder="e.g. +91 98765 43210"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    required
                    autoFocus
                    className="w-full py-2.5 px-3.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <button
                  type="submit"
                  disabled={phoneLoading}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{phoneLoading ? "Sending OTP..." : "Send Verification Code"}</span>
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyAndChangePhone} className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-300">
                      Enter 6-Digit Code
                    </label>
                    <button
                      type="button"
                      onClick={handleSendPhoneOtp}
                      disabled={phoneLoading}
                      className="text-[11px] text-emerald-400 hover:underline"
                    >
                      Resend code
                    </button>
                  </div>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="123456"
                    value={phoneOtp}
                    onChange={(e) => setPhoneOtp(e.target.value.replace(/\D/g, ""))}
                    required
                    autoFocus
                    className="w-full py-2.5 px-3.5 bg-slate-900 border border-slate-700 rounded-xl text-sm font-mono tracking-widest text-center text-white focus:outline-none focus:border-emerald-500"
                  />
                  <p className="text-[11px] text-slate-400 mt-1 text-center">
                    Code sent to <strong className="text-slate-200 font-mono">{newPhone}</strong>
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={phoneLoading}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{phoneLoading ? "Verifying..." : "Verify & Save Phone Number"}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EditProfileView;
