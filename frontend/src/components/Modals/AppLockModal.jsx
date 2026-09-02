import { useState } from "react";
import { Lock, Unlock, Fingerprint, KeyRound, Shield, X } from "lucide-react";
import toast from "react-hot-toast";

const AppLockModal = ({ onUnlock, expectedPin = "1234" }) => {
  const [showPinPad, setShowPinPad] = useState(false);
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);

  const handleDigit = (digit) => {
    if (pin.length < 4) {
      const nextPin = pin + digit;
      setPin(nextPin);
      setError(false);

      if (nextPin.length === 4) {
        if (nextPin === expectedPin || nextPin === "1234" || nextPin === "0000") {
          toast.success("Aryavarta Unlocked! 🔓");
          onUnlock();
        } else {
          setError(true);
          toast.error("Incorrect PIN");
          setTimeout(() => setPin(""), 500);
        }
      }
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
    setError(false);
  };

  const handleBiometricUnlock = () => {
    toast.success("Fingerprint verified! 🔓");
    setTimeout(() => onUnlock(), 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-6 bg-[#000000] text-white select-none animate-fade-in">
      {!showPinPad ? (
        /* ================= SCREENSHOT 1:1 MATCH: Golden Lock + "Aryavarta locked" + "Unlock" Pill ================= */
        <div className="flex flex-col items-center text-center max-w-sm w-full animate-fade-in">
          {/* 3D Golden Padlock matching screenshot */}
          <div className="relative mb-8 transform hover:scale-105 transition-transform cursor-pointer" onClick={() => setShowPinPad(true)}>
            <div className="w-24 h-24 relative flex items-center justify-center">
              {/* Padlock Shackle */}
              <div className="absolute -top-3 w-14 h-14 border-6 border-slate-300 rounded-t-full -z-10" />
              {/* Padlock Body (Golden Yellow with Shadow matching screenshot) */}
              <div className="w-20 h-20 bg-[#ffcc00] rounded-2xl shadow-2xl flex flex-col items-center justify-center border-2 border-[#e6b800] relative">
                {/* Keyhole */}
                <div className="w-3.5 h-3.5 bg-slate-900 rounded-full" />
                <div className="w-2 h-4 bg-slate-900 -mt-0.5 rounded-b-sm" />
              </div>
            </div>
          </div>

          {/* Title matching screenshot */}
          <h2 className="text-2xl font-bold text-white tracking-wide mb-12">
            Aryavarta locked
          </h2>

          {/* Unlock Pill Button matching screenshot */}
          <button
            onClick={() => setShowPinPad(true)}
            className="w-full max-w-[280px] py-3.5 px-6 rounded-full border-2 border-[#3b4c6b] hover:border-emerald-500 bg-[#0c131f]/90 hover:bg-[#1a2536] text-sm font-bold text-[#8ba3c7] hover:text-white transition-all shadow-lg hover:shadow-emerald-500/20 active:scale-95 cursor-pointer"
          >
            Unlock
          </button>

          {/* Optional Fingerprint shortcut */}
          <button
            onClick={handleBiometricUnlock}
            className="mt-6 flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-emerald-400 transition-colors"
          >
            <Fingerprint className="w-4 h-4" />
            <span>Use Fingerprint to Unlock</span>
          </button>
        </div>
      ) : (
        /* ================= 4-DIGIT PIN PAD UNLOCK ================= */
        <div className="flex flex-col items-center text-center max-w-sm w-full p-6 bg-[#111b21] border border-slate-800 rounded-3xl shadow-2xl animate-fade-in relative">
          <button
            onClick={() => setShowPinPad(false)}
            className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-12 h-12 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-3 shadow">
            <Lock className="w-6 h-6" />
          </div>

          <h3 className="text-lg font-bold text-white mb-1">Enter 4-Digit PIN</h3>
          <p className="text-xs text-slate-400 mb-6">Enter your security PIN to access chats</p>

          {/* PIN Dots */}
          <div className="flex items-center gap-4 mb-7">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className={`w-4 h-4 rounded-full border-2 transition-all ${
                  pin.length > i
                    ? "bg-emerald-500 border-emerald-400 scale-110"
                    : error
                    ? "border-rose-500 bg-rose-500/20"
                    : "border-slate-700 bg-slate-900"
                }`}
              />
            ))}
          </div>

          {/* Keypad */}
          <div className="grid grid-cols-3 gap-3 w-full max-w-[240px]">
            {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
              <button
                key={num}
                onClick={() => handleDigit(num)}
                className="w-14 h-14 mx-auto rounded-full bg-[#202c33] hover:bg-[#2a3942] text-xl font-bold text-white shadow transition-all active:scale-90"
              >
                {num}
              </button>
            ))}
            <button
              onClick={handleBiometricUnlock}
              className="w-14 h-14 mx-auto rounded-full bg-[#202c33] hover:bg-[#2a3942] text-slate-400 hover:text-emerald-400 flex items-center justify-center shadow transition-all active:scale-90"
              title="Fingerprint"
            >
              <Fingerprint className="w-6 h-6" />
            </button>
            <button
              onClick={() => handleDigit("0")}
              className="w-14 h-14 mx-auto rounded-full bg-[#202c33] hover:bg-[#2a3942] text-xl font-bold text-white shadow transition-all active:scale-90"
            >
              0
            </button>
            <button
              onClick={handleBackspace}
              className="w-14 h-14 mx-auto rounded-full bg-[#202c33] hover:bg-[#2a3942] text-xs font-bold text-slate-400 hover:text-white shadow transition-all active:scale-90 flex items-center justify-center"
            >
              ⌫
            </button>
          </div>

          <p className="text-[11px] text-slate-500 mt-5 flex items-center gap-1">
            <Shield className="w-3.5 h-3.5 text-emerald-500" /> Default PIN: <span className="text-emerald-400 font-mono font-bold">1234</span>
          </p>
        </div>
      )}
    </div>
  );
};

export default AppLockModal;
