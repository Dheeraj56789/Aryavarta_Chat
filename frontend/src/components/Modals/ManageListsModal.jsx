import { useState } from "react";
import {
  X,
  Users,
  Plus,
  Trash2,
  Check,
  Search,
  Tag,
  FolderPlus
} from "lucide-react";
import { useChatContext } from "../../context/ChatContext";
import toast from "react-hot-toast";

const DEFAULT_LISTS = [
  { id: "fav", name: "Favorites", members: [] },
  { id: "family", name: "Family", members: [] },
  { id: "work", name: "Work & Office", members: [] },
  { id: "friends", name: "Close Friends", members: [] }
];

const ManageListsModal = ({ onClose }) => {
  const { allUsers } = useChatContext();
  const [lists, setLists] = useState(() => {
    try {
      const saved = localStorage.getItem("aryavarta_custom_lists");
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_LISTS;
  });

  const [activeListId, setActiveListId] = useState(lists[0]?.id || "fav");
  const [newListName, setNewListName] = useState("");
  const [showAddList, setShowAddList] = useState(false);
  const [memberSearch, setMemberSearch] = useState("");

  const saveLists = (updated) => {
    setLists(updated);
    localStorage.setItem("aryavarta_custom_lists", JSON.stringify(updated));
  };

  const currentList = lists.find((l) => l.id === activeListId) || lists[0];

  const handleCreateList = (e) => {
    e.preventDefault();
    if (!newListName.trim()) return;
    const newList = {
      id: "list_" + Date.now(),
      name: newListName.trim(),
      members: []
    };
    const updated = [...lists, newList];
    saveLists(updated);
    setActiveListId(newList.id);
    setNewListName("");
    setShowAddList(false);
    toast.success(`List "${newList.name}" created!`);
  };

  const handleDeleteList = (id) => {
    if (lists.length <= 1) {
      toast.error("You must keep at least one list");
      return;
    }
    const updated = lists.filter((l) => l.id !== id);
    saveLists(updated);
    setActiveListId(updated[0].id);
    toast.success("List deleted");
  };

  const toggleMember = (userId) => {
    if (!currentList) return;
    const isMember = currentList.members.includes(userId);
    const updatedMembers = isMember
      ? currentList.members.filter((id) => id !== userId)
      : [...currentList.members, userId];

    const updatedLists = lists.map((l) =>
      l.id === currentList.id ? { ...l, members: updatedMembers } : l
    );
    saveLists(updatedLists);
  };

  const filteredUsers = (Array.isArray(allUsers) ? allUsers : []).filter((u) => {
    const name = u.fullname || u.username || "";
    return name.toLowerCase().includes(memberSearch.toLowerCase());
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#111b21] border border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col text-slate-100 max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800/80 bg-[#16202a]">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Tag className="w-5 h-5 text-emerald-400" />
            Lists & Groups
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List Chips Bar */}
        <div className="p-3 border-b border-slate-800/60 bg-slate-900/50 flex items-center gap-2 overflow-x-auto scrollbar-none">
          {lists.map((l) => {
            const isActive = l.id === activeListId;
            return (
              <button
                key={l.id}
                onClick={() => setActiveListId(l.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isActive
                    ? "bg-emerald-500 text-slate-950 shadow"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                }`}
              >
                <span>{l.name}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isActive ? "bg-emerald-600 text-white" : "bg-slate-700 text-slate-300"}`}>
                  {l.members.length}
                </span>
              </button>
            );
          })}

          <button
            onClick={() => setShowAddList((p) => !p)}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 transition-colors flex-shrink-0"
            title="Create new list"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Add list prompt */}
        {showAddList && (
          <form onSubmit={handleCreateList} className="p-3 bg-slate-800/40 border-b border-slate-800 flex gap-2 animate-fadeIn">
            <input
              type="text"
              placeholder="New list name..."
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 rounded-xl text-xs font-bold transition-colors"
            >
              Add
            </button>
          </form>
        )}

        {/* Current list manager */}
        <div className="p-4 flex-1 min-h-0 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="text-sm font-bold text-white">{currentList?.name}</h4>
              <p className="text-xs text-slate-400">
                {currentList?.members.length} contacts assigned to this list
              </p>
            </div>
            {lists.length > 1 && (
              <button
                onClick={() => handleDeleteList(currentList.id)}
                className="p-2 rounded-xl text-rose-400 hover:bg-rose-500/10 transition-colors"
                title="Delete this list"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="relative mb-3">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search contacts to add or remove..."
              value={memberSearch}
              onChange={(e) => setMemberSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto space-y-1 divide-y divide-slate-800/40 pr-1">
            {filteredUsers.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-500">
                No contacts found
              </div>
            ) : (
              filteredUsers.map((user) => {
                const isSelected = currentList?.members.includes(user._id);
                return (
                  <div
                    key={user._id}
                    onClick={() => toggleMember(user._id)}
                    className="flex items-center justify-between py-2 px-2 rounded-lg hover:bg-slate-800/40 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={user.profilePic || "/default-avatar.png"}
                        alt=""
                        className="w-8 h-8 rounded-full object-cover bg-slate-800"
                        onError={(e) => {
                          e.target.src =
                            "https://api.dicebear.com/7.x/bottts/svg?seed=" +
                            (user.username || "user");
                        }}
                      />
                      <div>
                        <span className="text-xs font-semibold text-white block">
                          {user.fullname || user.username}
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          @{user.username}
                        </span>
                      </div>
                    </div>

                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                        isSelected
                          ? "bg-emerald-500 border-emerald-500 text-slate-950"
                          : "border-slate-600 bg-transparent"
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageListsModal;
