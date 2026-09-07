import { useState } from "react";
import { ArrowLeft, Eye, Sparkles, Sliders, Type, Check } from "lucide-react";
import toast from "react-hot-toast";

const AccessibilitySettings = ({ onBack }) => {
  const [highContrast, setHighContrast] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [largeText, setLargeText] = useState(false);
  const [hapticFeedback, setHapticFeedback] = useState(true);

  const Switch = ({ checked, onChange }) => (
    <label className="relative inline-flex items-center cursor-pointer flex-shrink-0 select-none">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only peer"
      />
      <div className="w-11 h-6 bg-[#374151] peer-focus:outline-none rounded-full peer peer-checked:bg-[#6366f1] transition-colors duration-200">
        <div
          className={`absolute top-[2px] left-[2px] bg-white rounded-full h-5 w-5 transition-transform duration-200 shadow-md ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </div>
    </label>
  );

  return (
    <div className="w-full flex flex-col h-full min-h-0 bg-[#0c1317] border-r border-slate-800/80 z-10 box-border text-slate-100 select-none">
      <div className="flex items-center gap-3 px-4 py-4 border-b border-slate-800/60 flex-shrink-0 bg-[#111b21]">
        <button
          onClick={onBack}
          className="p-1.5 rounded-full hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-bold text-slate-100">Accessibility</h2>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
        <div className="bg-[#1a222d] border border-slate-800/80 rounded-2xl overflow-hidden divide-y divide-slate-800/60">
          <div className="p-4 flex items-center justify-between">
            <div className="pr-3">
              <h4 className="text-sm font-semibold text-white">Increase Contrast</h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Sharpens border contrast and message bubble contours
              </p>
            </div>
            <Switch
              checked={highContrast}
              onChange={(v) => {
                setHighContrast(v);
                toast(v ? "High contrast enabled" : "Normal contrast restored");
              }}
            />
          </div>

          <div className="p-4 flex items-center justify-between">
            <div className="pr-3">
              <h4 className="text-sm font-semibold text-white">Reduce Animations</h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Minimizes UI slide and spring transitions for smoother experience
              </p>
            </div>
            <Switch
              checked={reduceMotion}
              onChange={(v) => {
                setReduceMotion(v);
                toast(v ? "Reduced motion active" : "Standard animations active");
              }}
            />
          </div>

          <div className="p-4 flex items-center justify-between">
            <div className="pr-3">
              <h4 className="text-sm font-semibold text-white">Large Text Mode</h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Boosts font size by 15% across conversation messages
              </p>
            </div>
            <Switch checked={largeText} onChange={setLargeText} />
          </div>

          <div className="p-4 flex items-center justify-between">
            <div className="pr-3">
              <h4 className="text-sm font-semibold text-white">Haptic Touch Vibration</h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Vibrates subtly on message reactions and button presses
              </p>
            </div>
            <Switch checked={hapticFeedback} onChange={setHapticFeedback} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccessibilitySettings;
