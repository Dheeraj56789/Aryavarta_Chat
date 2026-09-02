import { useState } from "react";
import { Megaphone, Plus, X, Search, CheckCircle2, Users } from "lucide-react";
import toast from "react-hot-toast";

const CHANNELS_LIST = [
  {
    id: "ch-1",
    name: "Aryavarta Tech & AI Updates",
    subscribers: "124.5k followers",
    icon: "🚀",
    desc: "Official news and product releases from Aryavarta team",
    isFollowing: true
  },
  {
    id: "ch-2",
    name: "Coding Club India",
    subscribers: "88.2k followers",
    icon: "💻",
    desc: "Daily DSA, Web Dev, C++, and Python resources",
    isFollowing: false
  },
  {
    id: "ch-3",
    name: "World News Brief",
    subscribers: "340k followers",
    icon: "🌍",
    desc: "Breaking news headlines and daily summaries",
    isFollowing: false
  }
];

const ChannelsModal = ({ onClose }) => {
  const [channels, setChannels] = useState(CHANNELS_LIST);
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [newChannelName, setNewChannelName] = useState("");

  const toggleFollow = (id) => {
    setChannels((prev) =>
      prev.map((ch) => {
        if (ch.id === id) {
          const next = !ch.isFollowing;
          toast(next ? `Following ${ch.name} 📢` : `Unfollowed ${ch.name}`);
          return { ...ch, isFollowing: next };
        }
        return ch;
      })
    );
  };

  const handleCreateChannel = (e) => {
    e.preventDefault();
    if (!newChannelName.trim()) return;

    const newCh = {
      id: `ch-${Date.now()}`,
      name: newChannelName.trim(),
      subscribers: "1 follower",
      icon: "📢",
      desc: "Created by you",
      isFollowing: true
    };

    setChannels([newCh, ...channels]);
    setShowCreate(false);
    setNewChannelName("");
    toast.success(`Channel "${newCh.name}" created! 📢`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in select-none">
      <div className="w-full max-w-md bg-[#111b21] border border-slate-800 rounded-3xl p-6 text-white shadow-2xl space-y-4 relative">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Megaphone className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Channels</h3>
              <p className="text-[11px] text-slate-400">Stay updated on topics you care about</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Create Channel Button */}
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="w-full py-2.5 px-4 bg-[#202c33] hover:bg-[#2a3942] border border-slate-700 rounded-2xl text-xs font-semibold text-emerald-400 flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create Channel</span>
        </button>

        {showCreate && (
          <form onSubmit={handleCreateChannel} className="p-3 bg-slate-900 border border-slate-700 rounded-2xl space-y-2 animate-fade-in">
            <input
              type="text"
              placeholder="Channel name..."
              value={newChannelName}
              onChange={(e) => setNewChannelName(e.target.value)}
              autoFocus
              className="w-full py-2 px-3 bg-[#202c33] border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              className="w-full py-2 bg-[#00a884] hover:bg-[#02906f] text-white font-bold text-xs rounded-xl"
            >
              Create Now
            </button>
          </form>
        )}

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search channels..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#202c33] border border-slate-750 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none"
          />
        </div>

        {/* Channels List */}
        <div className="max-h-56 overflow-y-auto space-y-2">
          {channels
            .filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
            .map((ch) => (
              <div key={ch.id} className="p-3 bg-[#202c33] rounded-2xl border border-slate-750 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-slate-800 flex items-center justify-center text-lg shadow">
                    {ch.icon}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center gap-1">
                      <span>{ch.name}</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400/20" />
                    </h4>
                    <p className="text-[10px] text-slate-400">{ch.subscribers}</p>
                  </div>
                </div>

                <button
                  onClick={() => toggleFollow(ch.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    ch.isFollowing
                      ? "bg-slate-800 text-slate-300 border border-slate-700"
                      : "bg-[#00a884] hover:bg-[#02906f] text-white shadow"
                  }`}
                >
                  {ch.isFollowing ? "Following" : "Follow"}
                </button>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default ChannelsModal;
