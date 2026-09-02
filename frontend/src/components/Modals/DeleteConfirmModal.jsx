import { AlertTriangle, Trash2, X } from "lucide-react";

const DeleteConfirmModal = ({ title, message, confirmText = "Delete chat", onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in select-none">
      <div className="w-full max-w-md bg-[#222e35] border border-slate-700/80 rounded-3xl p-6 text-white shadow-2xl space-y-4 animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-base md:text-lg font-bold text-white tracking-tight">
            {title || "Delete this chat?"}
          </h3>
          <button
            onClick={onCancel}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message */}
        <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
          {message ||
            "Messages will only be removed from this device and your devices on the newer versions of Aryavarta."}
        </p>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <button
            onClick={onCancel}
            className="px-5 py-2.5 rounded-full text-xs font-semibold text-emerald-400 hover:bg-[#182229] border border-transparent hover:border-slate-700 transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            className="px-5 py-2.5 rounded-full bg-[#ea4335] hover:bg-[#d93025] text-white text-xs font-bold shadow-lg shadow-rose-600/30 transition-transform active:scale-95 cursor-pointer flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
