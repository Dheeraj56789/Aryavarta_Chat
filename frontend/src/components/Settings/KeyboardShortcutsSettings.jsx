import { ArrowLeft } from "lucide-react";

const SHORTCUTS = [
  { key: "Ctrl + N", desc: "Start new conversation" },
  { key: "Ctrl + Shift + M", desc: "Mute sound effects" },
  { key: "Ctrl + Shift + U", desc: "Mark chat as unread" },
  { key: "Ctrl + Shift + P", desc: "Open Aryavarta AI Assistant" },
  { key: "Ctrl + / -", desc: "Zoom in or zoom out text size" },
  { key: "Esc", desc: "Close active conversation" }
];

const KeyboardShortcutsSettings = ({ onBack }) => {
  return (
    <div className="w-full flex flex-col h-full min-h-0 bg-[#111b21] border-r border-slate-800/80 z-10 box-border text-slate-100 select-none">
      <div className="flex items-center gap-4 px-4 py-4 border-b border-slate-800/60 flex-shrink-0">
        <button
          onClick={onBack}
          className="p-1.5 rounded-full hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-bold text-slate-100">Keyboard shortcuts</h2>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-2.5">
        {SHORTCUTS.map((sc, i) => (
          <div
            key={i}
            className="flex items-center justify-between p-3.5 rounded-2xl bg-[#202c33] border border-slate-700/60"
          >
            <span className="text-xs font-semibold text-slate-200">{sc.desc}</span>
            <kbd className="px-2 py-1 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-emerald-400 shadow-inner">
              {sc.key}
            </kbd>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KeyboardShortcutsSettings;
