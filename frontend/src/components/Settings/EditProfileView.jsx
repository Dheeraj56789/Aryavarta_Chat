import { useState } from "react";
import { useAuthContext } from "../../context/AuthContext";
import { ArrowLeft, Smile, Edit2, Phone, Copy, Check, Camera, X } from "lucide-react";
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

  const handleSaveName = () => {
    if (!tempName.trim()) {
      toast.error("Name cannot be empty");
      return;
    }
    setName(tempName);
    setIsEditingName(false);
    const updated = { ...authUser, fullname: tempName };
    setAuthUser(updated);
    localStorage.setItem("chat-user", JSON.stringify(updated));
    toast.success("Name updated! ✨");
  };

  const handleSaveAbout = () => {
    if (!tempAbout.trim()) {
      toast.error("Status cannot be empty");
      return;
    }
    setAbout(tempAbout);
    setIsEditingAbout(false);
    const updated = { ...authUser, about: tempAbout };
    setAuthUser(updated);
    localStorage.setItem("chat-user", JSON.stringify(updated));
    toast.success("About status updated! 💬");
  };

  const handleCopyPhone = () => {
    const phoneNumber = authUser?.phone || "+91 88581 81459";
    navigator.clipboard.writeText(phoneNumber);
    toast.success("Phone number copied to clipboard! 📋");
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setProfilePic(reader.result);
        const updated = { ...authUser, profilepic: reader.result };
        setAuthUser(updated);
        localStorage.setItem("chat-user", JSON.stringify(updated));
        toast.success("Profile photo updated! 📸");
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="w-full flex flex-col h-full min-h-0 bg-[#111b21] border-r border-slate-800/80 z-10 box-border text-slate-100 select-none">
      {/* 1. Header matching screenshot: ← Edit profile */}
      <div className="flex items-center gap-4 px-4 py-4 border-b border-slate-800/60 flex-shrink-0">
        <button
          onClick={onBack}
          className="p-1.5 rounded-full hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
          title="Back to Settings"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-bold text-slate-100">Edit profile</h2>
      </div>

      {/* 2. Body matching screenshot */}
      <div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-7">
        {/* Large Center Avatar */}
        <div className="flex flex-col items-center justify-center my-2">
          <div className="relative group cursor-pointer">
            <img
              src={profilePic}
              alt="Profile"
              className="w-36 h-36 rounded-full object-cover border-2 border-slate-700/80 shadow-2xl"
            />
            {/* Hover overlay with camera */}
            <label className="absolute inset-0 bg-black/60 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
              <Camera className="w-8 h-8 text-white mb-1" />
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
                className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white"
                title="Save"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsEditingAbout(false)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400"
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
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
                title="Edit about status"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Section 2: Name */}
        <div className="space-y-2 pt-2">
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
                className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white"
                title="Save"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsEditingName(false)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400"
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
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
                title="Edit name"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Section 3: Phone */}
        <div className="space-y-2 pt-2">
          <span className="text-xs font-semibold text-slate-400 block tracking-wide">
            Phone
          </span>

          <div className="flex items-center justify-between py-1">
            <div className="flex items-center gap-3 text-slate-300">
              <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <span className="text-sm font-medium text-slate-200 font-mono">
                {authUser?.phone || "+91 88581 81459"}
              </span>
            </div>

            <button
              onClick={handleCopyPhone}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
              title="Copy phone number"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfileView;
