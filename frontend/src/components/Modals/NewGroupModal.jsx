import { useState } from "react";
import { useChatContext } from "../../context/ChatContext";
import { X, Users, Check, Sparkles } from "lucide-react";
import toast from "react-hot-toast";

const NewGroupModal = ({ onClose }) => {
  const { allUsers, setSelectedConversation } = useChatContext();
  const [groupName, setGroupName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);

  const toggleMember = (user) => {
    if (selectedMembers.find((m) => m._id === user._id)) {
      setSelectedMembers(selectedMembers.filter((m) => m._id !== user._id));
    } else {
      setSelectedMembers([...selectedMembers, user]);
    }
  };

  const handleCreateGroup = (e) => {
    e.preventDefault();
    if (!groupName.trim()) {
      toast.error("Please enter a group name");
      return;
    }

    if (selectedMembers.length === 0) {
      toast.error("Please select at least 1 member");
      return;
    }

    // Mock new group conversation
    const newGroup = {
      _id: "group_" + Date.now(),
      fullname: groupName,
      username: groupName.toLowerCase().replace(/\s+/g, "_"),
      isGroup: true,
      members: selectedMembers,
      profilepic: `https://avatar.iran.liara.run/public/boy?username=${encodeURIComponent(groupName)}`,
      lastMessage: `Group "${groupName}" created 🎉`,
      lastMessageTime: new Date().toISOString()
    };

    setSelectedConversation(newGroup);
    toast.success(`Group "${groupName}" created with ${selectedMembers.length} members! 🎉`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div
        className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-400" />
            <h3 className="text-lg font-bold text-white">Create New Group</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleCreateGroup} className="py-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Group Name / Subject
            </label>
            <input
              type="text"
              placeholder="e.g. Coding Club India, Study Group..."
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="w-full py-3 px-4 bg-slate-950/80 border border-slate-700/80 rounded-2xl text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Add Participants
              </label>
              <span className="text-xs text-emerald-400 font-semibold">
                {selectedMembers.length} selected
              </span>
            </div>

            <div className="max-h-52 overflow-y-auto space-y-1.5 pr-1">
              {allUsers.map((user) => {
                const isSelected = !!selectedMembers.find((m) => m._id === user._id);
                return (
                  <div
                    key={user._id}
                    onClick={() => toggleMember(user)}
                    className={`flex items-center justify-between p-2.5 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? "bg-emerald-950/40 border-emerald-500/60 text-white"
                        : "bg-slate-800/40 border-slate-700/40 text-slate-300 hover:bg-slate-800"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={
                          user.profilepic ||
                          `https://avatar.iran.liara.run/public/${user.gender === "female" ? "girl" : "boy"}?username=${encodeURIComponent(user.username)}`
                        }
                        alt={user.fullname}
                        className="w-8 h-8 rounded-full object-cover bg-slate-700"
                      />
                      <div>
                        <p className="text-xs font-bold">{user.fullname}</p>
                        <p className="text-[10px] text-slate-400">@{user.username}</p>
                      </div>
                    </div>

                    <div
                      className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-colors ${
                        isSelected
                          ? "bg-emerald-500 border-emerald-400 text-white"
                          : "border-slate-600 bg-slate-900"
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Create Group
          </button>
        </form>
      </div>
    </div>
  );
};

export default NewGroupModal;
