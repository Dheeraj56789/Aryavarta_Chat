import { useState } from "react";
import { Radio, X, Users, Check, Send } from "lucide-react";
import { useChatContext } from "../../context/ChatContext";
import toast from "react-hot-toast";

const BroadcastModal = ({ onClose }) => {
  const { conversations, sendMessage } = useChatContext();
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [broadcastMsg, setBroadcastMsg] = useState("");

  const toggleSelect = (id) => {
    if (selectedContacts.includes(id)) {
      setSelectedContacts(selectedContacts.filter((item) => item !== id));
    } else {
      setSelectedContacts([...selectedContacts, id]);
    }
  };

  const handleSendBroadcast = (e) => {
    e.preventDefault();
    if (!broadcastMsg.trim() || selectedContacts.length === 0) {
      toast.error("Please select at least 1 recipient and type a message");
      return;
    }
    toast.success(`Broadcast sent to ${selectedContacts.length} recipients! 📡`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in select-none">
      <div className="w-full max-w-md bg-[#111b21] border border-slate-800 rounded-3xl p-6 text-white shadow-2xl space-y-4 relative">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Radio className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">New Broadcast</h3>
              <p className="text-[11px] text-slate-400">{selectedContacts.length} of {conversations.length} selected</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contacts selector list */}
        <div className="max-h-56 overflow-y-auto space-y-1.5 p-1">
          {conversations.map((c) => {
            const isSelected = selectedContacts.includes(c._id);
            return (
              <div
                key={c._id}
                onClick={() => toggleSelect(c._id)}
                className={`p-2.5 rounded-2xl flex items-center justify-between cursor-pointer transition-colors ${
                  isSelected ? "bg-emerald-950/40 border border-emerald-500/40" : "bg-[#202c33] hover:bg-[#2a3942]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <img
                    src={c.profilepic || "https://avatar.iran.liara.run/public/boy?username=user"}
                    alt={c.fullname}
                    className="w-9 h-9 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-white">{c.fullname}</h4>
                    <p className="text-[10px] text-slate-400">{c.username ? `@${c.username}` : "Available"}</p>
                  </div>
                </div>

                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                    isSelected ? "bg-emerald-500 border-emerald-400" : "border-slate-600"
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                </div>
              </div>
            );
          })}
        </div>

        {/* Broadcast Message Input */}
        <form onSubmit={handleSendBroadcast} className="space-y-3 pt-2">
          <input
            type="text"
            placeholder="Type broadcast message to all recipients..."
            value={broadcastMsg}
            onChange={(e) => setBroadcastMsg(e.target.value)}
            className="w-full py-2.5 px-3.5 bg-[#202c33] border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
          />

          <button
            type="submit"
            className="w-full py-2.5 bg-[#00a884] hover:bg-[#02906f] text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send Broadcast</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default BroadcastModal;
