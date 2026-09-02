import { useState } from "react";
import {
  ArrowLeft,
  UserPlus,
  Key,
  Lock,
  Mail,
  ShieldCheck,
  Shield,
  AtSign,
  PhoneCall,
  Sliders,
  LogOut,
  MoreVertical,
  ChevronRight,
  Check,
  Eye,
  EyeOff,
  AlertCircle,
  Fingerprint,
  Sparkles
} from "lucide-react";
import { useAuthContext } from "../../context/AuthContext";
import toast from "react-hot-toast";

const AccountSettings = ({ onBack }) => {
  const { authUser, logout, setAuthUser } = useAuthContext();

  // Sub-views: null | "passkeys" | "password" | "email" | "two_step" | "security_notifs" | "username" | "change_phone" | "ad_prefs" | "add_account"
  const [subView, setSubView] = useState(null);

  // Form states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);

  const [emailInput, setEmailInput] = useState(authUser?.email || "");
  const [usernameInput, setUsernameInput] = useState(authUser?.username || "");
  const [newPhoneInput, setNewPhoneInput] = useState("");
  const [twoStepPin, setTwoStepPin] = useState("654321");
  const [twoStepEnabled, setTwoStepEnabled] = useState(true);
  const [securityNotifsEnabled, setSecurityNotifsEnabled] = useState(true);
  const [personalizedAds, setPersonalizedAds] = useState(false);
  const [passkeys, setPasskeys] = useState([
    { id: "pk-1", name: "Windows Hello / Touch ID", created: "Added Aug 28, 2026" }
  ]);

  // ================= 1. SUB-VIEW: PASSKEYS =================
  if (subView === "passkeys") {
    return (
      <div className="w-full flex flex-col h-full min-h-0 bg-[#111b21] border-r border-slate-800/80 z-10 box-border text-slate-100 select-none animate-fade-in">
        <div className="flex items-center gap-4 px-4 py-4 border-b border-slate-800/60 flex-shrink-0">
          <button onClick={() => setSubView(null)} className="p-1.5 rounded-full hover:bg-slate-800 text-slate-300 hover:text-white cursor-pointer">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-bold text-slate-100">Passkeys</h2>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
          <div className="p-4 bg-[#182229] border border-slate-800 rounded-2xl space-y-2 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-1">
              <Fingerprint className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-white">Login securely without passwords</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Use your fingerprint, face recognition, or screen lock to sign in to Aryavarta on any device.
            </p>
            <button
              onClick={() => {
                const newKey = { id: `pk-${Date.now()}`, name: "Biometric Passkey", created: "Added just now" };
                setPasskeys([...passkeys, newKey]);
                toast.success("New biometric passkey created! 🔑⚡");
              }}
              className="w-full py-2.5 bg-[#00a884] hover:bg-[#02906f] text-white font-bold text-xs rounded-xl shadow-lg cursor-pointer mt-2"
            >
              Create Passkey
            </button>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-400 block px-1">Active Passkeys</span>
            {passkeys.map((pk) => (
              <div key={pk.id} className="p-3 bg-[#202c33] border border-slate-750 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Key className="w-4 h-4 text-emerald-400" />
                  <div>
                    <h4 className="text-xs font-bold text-white">{pk.name}</h4>
                    <p className="text-[10px] text-slate-400">{pk.created}</p>
                  </div>
                </div>
                <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded font-semibold">Active</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ================= 2. SUB-VIEW: PASSWORD =================
  if (subView === "password") {
    return (
      <div className="w-full flex flex-col h-full min-h-0 bg-[#111b21] border-r border-slate-800/80 z-10 box-border text-slate-100 select-none animate-fade-in">
        <div className="flex items-center gap-4 px-4 py-4 border-b border-slate-800/60 flex-shrink-0">
          <button onClick={() => setSubView(null)} className="p-1.5 rounded-full hover:bg-slate-800 text-slate-300 hover:text-white cursor-pointer">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-bold text-slate-100">Change Password</h2>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (newPassword.length < 6) {
              toast.error("Password must be at least 6 characters");
              return;
            }
            if (newPassword !== confirmPassword) {
              toast.error("Passwords do not match");
              return;
            }
            toast.success("Account password updated successfully! 🔒");
            setSubView(null);
          }}
          className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4"
        >
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Current Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              className="w-full py-2.5 px-3 bg-[#202c33] border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">New Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
              className="w-full py-2.5 px-3 bg-[#202c33] border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Confirm New Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              className="w-full py-2.5 px-3 bg-[#202c33] border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-[#00a884] hover:bg-[#02906f] text-white font-bold text-xs rounded-xl shadow-lg cursor-pointer"
          >
            Update Password
          </button>
        </form>
      </div>
    );
  }

  // ================= 3. SUB-VIEW: EMAIL ADDRESS =================
  if (subView === "email") {
    return (
      <div className="w-full flex flex-col h-full min-h-0 bg-[#111b21] border-r border-slate-800/80 z-10 box-border text-slate-100 select-none animate-fade-in">
        <div className="flex items-center gap-4 px-4 py-4 border-b border-slate-800/60 flex-shrink-0">
          <button onClick={() => setSubView(null)} className="p-1.5 rounded-full hover:bg-slate-800 text-slate-300 hover:text-white cursor-pointer">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-bold text-slate-100">Email Address</h2>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
          <p className="text-xs text-slate-400 leading-relaxed">
            Your email address is used to verify account ownership, recover access, and receive security alerts.
          </p>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-300">Linked Email</label>
            <input
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              className="w-full py-2.5 px-3 bg-[#202c33] border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>

          <div className="p-3 bg-[#182229] border border-slate-800 rounded-xl flex items-center justify-between text-xs">
            <span className="text-slate-400">Email Status</span>
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <Check className="w-3.5 h-3.5" />
              <span>Verified</span>
            </span>
          </div>

          <button
            onClick={() => {
              if (!emailInput.includes("@")) {
                toast.error("Please enter a valid email address");
                return;
              }
              const updated = { ...authUser, email: emailInput };
              setAuthUser(updated);
              localStorage.setItem("chat-user", JSON.stringify(updated));
              toast.success("Email address updated! ✉️");
              setSubView(null);
            }}
            className="w-full py-3 bg-[#00a884] hover:bg-[#02906f] text-white font-bold text-xs rounded-xl shadow-lg cursor-pointer"
          >
            Save Email Address
          </button>
        </div>
      </div>
    );
  }

  // ================= 4. SUB-VIEW: TWO-STEP VERIFICATION =================
  if (subView === "two_step") {
    return (
      <div className="w-full flex flex-col h-full min-h-0 bg-[#111b21] border-r border-slate-800/80 z-10 box-border text-slate-100 select-none animate-fade-in">
        <div className="flex items-center gap-4 px-4 py-4 border-b border-slate-800/60 flex-shrink-0">
          <button onClick={() => setSubView(null)} className="p-1.5 rounded-full hover:bg-slate-800 text-slate-300 hover:text-white cursor-pointer">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-bold text-slate-100">Two-step verification</h2>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
          <div className="p-4 bg-[#182229] border border-slate-800 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-sm font-bold text-white block">Two-step verification</span>
              <p className="text-xs text-slate-400 mt-0.5">Require 6-digit PIN when registering number again</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
              <input
                type="checkbox"
                checked={twoStepEnabled}
                onChange={(e) => {
                  setTwoStepEnabled(e.target.checked);
                  toast(e.target.checked ? "Two-step verification enabled 🔒" : "Disabled");
                }}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00a884]"></div>
            </label>
          </div>

          {twoStepEnabled && (
            <div className="p-4 bg-[#182229] border border-slate-800 rounded-2xl space-y-3">
              <span className="text-xs font-semibold text-slate-300 block">Change 6-Digit PIN</span>
              <input
                type="password"
                maxLength={6}
                value={twoStepPin}
                onChange={(e) => setTwoStepPin(e.target.value)}
                className="w-full py-2.5 px-3 bg-[#202c33] border border-slate-700 rounded-xl text-center text-base font-mono tracking-widest text-white focus:outline-none focus:border-emerald-500"
              />
              <button
                onClick={() => toast.success("Two-step PIN saved! 🔑")}
                className="w-full py-2.5 bg-[#00a884] hover:bg-[#02906f] text-white font-bold text-xs rounded-xl shadow cursor-pointer"
              >
                Save 2FA PIN
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ================= 5. SUB-VIEW: SECURITY NOTIFICATIONS =================
  if (subView === "security_notifs") {
    return (
      <div className="w-full flex flex-col h-full min-h-0 bg-[#111b21] border-r border-slate-800/80 z-10 box-border text-slate-100 select-none animate-fade-in">
        <div className="flex items-center gap-4 px-4 py-4 border-b border-slate-800/60 flex-shrink-0">
          <button onClick={() => setSubView(null)} className="p-1.5 rounded-full hover:bg-slate-800 text-slate-300 hover:text-white cursor-pointer">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-bold text-slate-100">Security notifications</h2>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
          <div className="p-4 bg-[#182229] border border-slate-800 rounded-2xl flex items-start justify-between">
            <div className="pr-4">
              <span className="text-sm font-semibold text-white block">Show security notifications</span>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Get notified when your security code changes for a contact's phone. If you have multiple devices, this setting must be enabled on each device.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer flex-shrink-0 mt-0.5">
              <input
                type="checkbox"
                checked={securityNotifsEnabled}
                onChange={(e) => {
                  setSecurityNotifsEnabled(e.target.checked);
                  toast(e.target.checked ? "Security notifications on" : "Security notifications off");
                }}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00a884]"></div>
            </label>
          </div>
        </div>
      </div>
    );
  }

  // ================= 6. SUB-VIEW: USERNAME =================
  if (subView === "username") {
    return (
      <div className="w-full flex flex-col h-full min-h-0 bg-[#111b21] border-r border-slate-800/80 z-10 box-border text-slate-100 select-none animate-fade-in">
        <div className="flex items-center gap-4 px-4 py-4 border-b border-slate-800/60 flex-shrink-0">
          <button onClick={() => setSubView(null)} className="p-1.5 rounded-full hover:bg-slate-800 text-slate-300 hover:text-white cursor-pointer">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-bold text-slate-100">Username</h2>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
          <p className="text-xs text-slate-400 leading-relaxed">
            People can find you on Aryavarta using your unique username without sharing your phone number.
          </p>

          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">@</span>
            <input
              type="text"
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
              placeholder="username"
              className="w-full pl-8 pr-4 py-2.5 bg-[#202c33] border border-slate-700 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>

          <button
            onClick={() => {
              if (usernameInput.length < 3) {
                toast.error("Username must be at least 3 characters");
                return;
              }
              const updated = { ...authUser, username: usernameInput };
              setAuthUser(updated);
              localStorage.setItem("chat-user", JSON.stringify(updated));
              toast.success(`Username updated to @${usernameInput} ✨`);
              setSubView(null);
            }}
            className="w-full py-3 bg-[#00a884] hover:bg-[#02906f] text-white font-bold text-xs rounded-xl shadow-lg cursor-pointer"
          >
            Save Username
          </button>
        </div>
      </div>
    );
  }

  // ================= 7. SUB-VIEW: CHANGE PHONE NUMBER =================
  if (subView === "change_phone") {
    return (
      <div className="w-full flex flex-col h-full min-h-0 bg-[#111b21] border-r border-slate-800/80 z-10 box-border text-slate-100 select-none animate-fade-in">
        <div className="flex items-center gap-4 px-4 py-4 border-b border-slate-800/60 flex-shrink-0">
          <button onClick={() => setSubView(null)} className="p-1.5 rounded-full hover:bg-slate-800 text-slate-300 hover:text-white cursor-pointer">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-bold text-slate-100">Change phone number</h2>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
          <div className="p-4 bg-[#182229] border border-slate-800 rounded-2xl space-y-2">
            <h4 className="text-xs font-bold text-white">Before proceeding:</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Changing your phone number will migrate your account info, groups & settings to your new number.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Current Number</label>
            <input
              type="text"
              disabled
              value={authUser?.phone || "+91 88581 81459"}
              className="w-full py-2.5 px-3 bg-[#202c33] border border-slate-700 rounded-xl text-xs text-slate-400 font-mono opacity-70"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">New Mobile Number</label>
            <input
              type="text"
              placeholder="+91 98765 43210"
              value={newPhoneInput}
              onChange={(e) => setNewPhoneInput(e.target.value)}
              className="w-full py-2.5 px-3 bg-[#202c33] border border-slate-700 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>

          <button
            onClick={() => {
              if (newPhoneInput.length < 10) {
                toast.error("Please enter a valid 10-digit phone number");
                return;
              }
              const updated = { ...authUser, phone: newPhoneInput };
              setAuthUser(updated);
              localStorage.setItem("chat-user", JSON.stringify(updated));
              toast.success("Phone number updated successfully! 📱⚡");
              setSubView(null);
            }}
            className="w-full py-3 bg-[#00a884] hover:bg-[#02906f] text-white font-bold text-xs rounded-xl shadow-lg cursor-pointer"
          >
            Next & Verify OTP
          </button>
        </div>
      </div>
    );
  }

  // ================= 8. SUB-VIEW: AD PREFERENCES =================
  if (subView === "ad_prefs") {
    return (
      <div className="w-full flex flex-col h-full min-h-0 bg-[#111b21] border-r border-slate-800/80 z-10 box-border text-slate-100 select-none animate-fade-in">
        <div className="flex items-center gap-4 px-4 py-4 border-b border-slate-800/60 flex-shrink-0">
          <button onClick={() => setSubView(null)} className="p-1.5 rounded-full hover:bg-slate-800 text-slate-300 hover:text-white cursor-pointer">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-bold text-slate-100">Ad preferences</h2>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
          <div className="p-4 bg-[#182229] border border-slate-800 rounded-2xl flex items-start justify-between">
            <div className="pr-4">
              <span className="text-sm font-semibold text-white block">Ad personalization for Status & Channels</span>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Allow customized recommendations based on channels you follow. Personal chats are never used for advertising.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer flex-shrink-0 mt-0.5">
              <input
                type="checkbox"
                checked={personalizedAds}
                onChange={(e) => {
                  setPersonalizedAds(e.target.checked);
                  toast(e.target.checked ? "Personalization on" : "Ad tracking disabled 🛡️");
                }}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00a884]"></div>
            </label>
          </div>
        </div>
      </div>
    );
  }

  // ================= 9. SUB-VIEW: ADD ACCOUNT =================
  if (subView === "add_account") {
    return (
      <div className="w-full flex flex-col h-full min-h-0 bg-[#111b21] border-r border-slate-800/80 z-10 box-border text-slate-100 select-none animate-fade-in">
        <div className="flex items-center gap-4 px-4 py-4 border-b border-slate-800/60 flex-shrink-0">
          <button onClick={() => setSubView(null)} className="p-1.5 rounded-full hover:bg-slate-800 text-slate-300 hover:text-white cursor-pointer">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-bold text-slate-100">Add Account</h2>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
          <p className="text-xs text-slate-400">Switch between multiple Aryavarta accounts seamlessly.</p>
          <div className="p-3.5 bg-[#202c33] border border-slate-700 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={authUser?.profilepic || "https://avatar.iran.liara.run/public/boy?username=user"}
                alt={authUser?.fullname}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <h4 className="text-xs font-bold text-white">{authUser?.fullname}</h4>
                <p className="text-[10px] text-emerald-400 font-mono">{authUser?.phone || "+91 88581 81459"}</p>
              </div>
            </div>
            <span className="text-xs text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded">Active</span>
          </div>

          <button
            onClick={() => toast("Add secondary account flow 👤+")}
            className="w-full py-3 bg-[#00a884] hover:bg-[#02906f] text-white font-bold text-xs rounded-xl shadow cursor-pointer flex items-center justify-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Another Account</span>
          </button>
        </div>
      </div>
    );
  }

  // ================= MAIN ACCOUNT SCREEN (Exact match from screenshot 1:1) =================
  return (
    <div className="w-full flex flex-col h-full min-h-0 bg-[#111b21] border-r border-slate-800/80 z-10 box-border text-slate-100 select-none">
      {/* 1. Header: ← Account */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-slate-800/60 flex-shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Back to Settings"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-bold text-slate-100">Account</h2>
        </div>

        <button
          onClick={() => toast("Account options")}
          className="p-1.5 rounded-full hover:bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
        >
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>

      {/* 2. Scrollable Body matching screenshot */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-6">
        {/* ================= TOP ACTION: Add account ================= */}
        <div>
          <button
            onClick={() => setSubView("add_account")}
            className="w-full flex items-center gap-4 px-3 py-3 rounded-2xl hover:bg-[#202c33] cursor-pointer transition-colors text-slate-200"
          >
            <UserPlus className="w-5 h-5 text-slate-400 flex-shrink-0" />
            <span className="text-sm font-semibold flex-1 text-left">Add account</span>
          </button>
        </div>

        {/* ================= SECTION 1: Login and security ================= */}
        <div className="space-y-1">
          <span className="text-xs font-semibold text-slate-400 block tracking-wide px-3 pb-1">
            Login and security
          </span>

          {/* Passkeys */}
          <div
            onClick={() => setSubView("passkeys")}
            className="flex items-center gap-4 px-3 py-3 rounded-2xl hover:bg-[#202c33] cursor-pointer transition-colors text-slate-200"
          >
            <Key className="w-5 h-5 text-slate-400 flex-shrink-0" />
            <span className="text-sm font-semibold flex-1">Passkeys</span>
          </div>

          {/* Password */}
          <div
            onClick={() => setSubView("password")}
            className="flex items-center gap-4 px-3 py-3 rounded-2xl hover:bg-[#202c33] cursor-pointer transition-colors text-slate-200"
          >
            <span className="font-mono text-sm tracking-widest text-slate-400 font-bold px-1">***</span>
            <span className="text-sm font-semibold flex-1">Password</span>
          </div>

          {/* Email address */}
          <div
            onClick={() => setSubView("email")}
            className="flex items-center gap-4 px-3 py-3 rounded-2xl hover:bg-[#202c33] cursor-pointer transition-colors text-slate-200"
          >
            <Mail className="w-5 h-5 text-slate-400 flex-shrink-0" />
            <span className="text-sm font-semibold flex-1">Email address</span>
          </div>

          {/* Two-step verification */}
          <div
            onClick={() => setSubView("two_step")}
            className="flex items-center gap-4 px-3 py-3 rounded-2xl hover:bg-[#202c33] cursor-pointer transition-colors text-slate-200"
          >
            <ShieldCheck className="w-5 h-5 text-slate-400 flex-shrink-0" />
            <span className="text-sm font-semibold flex-1">Two-step verification</span>
          </div>

          {/* Security notifications */}
          <div
            onClick={() => setSubView("security_notifs")}
            className="flex items-center gap-4 px-3 py-3 rounded-2xl hover:bg-[#202c33] cursor-pointer transition-colors text-slate-200"
          >
            <Shield className="w-5 h-5 text-slate-400 flex-shrink-0" />
            <span className="text-sm font-semibold flex-1">Security notifications</span>
          </div>
        </div>

        {/* ================= SECTION 2: Your account ================= */}
        <div className="space-y-1 pt-2 border-t border-slate-800">
          <span className="text-xs font-semibold text-slate-400 block tracking-wide px-3 pb-1">
            Your account
          </span>

          {/* Username */}
          <div
            onClick={() => setSubView("username")}
            className="flex items-center gap-4 px-3 py-3 rounded-2xl hover:bg-[#202c33] cursor-pointer transition-colors text-slate-200"
          >
            <AtSign className="w-5 h-5 text-slate-400 flex-shrink-0" />
            <span className="text-sm font-semibold flex-1">Username</span>
          </div>

          {/* Change phone number */}
          <div
            onClick={() => setSubView("change_phone")}
            className="flex items-center gap-4 px-3 py-3 rounded-2xl hover:bg-[#202c33] cursor-pointer transition-colors text-slate-200"
          >
            <PhoneCall className="w-5 h-5 text-slate-400 flex-shrink-0" />
            <span className="text-sm font-semibold flex-1">Change phone number</span>
          </div>

          {/* Ad preferences for Status & Channels */}
          <div
            onClick={() => setSubView("ad_prefs")}
            className="flex items-center gap-4 px-3 py-3 rounded-2xl hover:bg-[#202c33] cursor-pointer transition-colors text-slate-200"
          >
            <Sliders className="w-5 h-5 text-slate-400 flex-shrink-0" />
            <span className="text-sm font-semibold flex-1">Ad preferences for Status & Channels</span>
          </div>
        </div>

        {/* ================= BOTTOM ACTION: Log out ================= */}
        <div className="pt-2 border-t border-slate-800">
          <button
            onClick={() => {
              if (window.confirm("Are you sure you want to log out from Aryavarta?")) {
                logout();
              }
            }}
            className="w-full flex items-center gap-4 px-3 py-3 rounded-2xl hover:bg-rose-950/30 cursor-pointer transition-colors text-rose-500 font-semibold text-sm"
          >
            <LogOut className="w-5 h-5 text-rose-500 flex-shrink-0" />
            <span>Log out</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;
