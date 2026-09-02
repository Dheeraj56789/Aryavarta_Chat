import { useState, useRef, useEffect } from "react";
import {
  QrCode,
  X,
  CheckCircle2,
  ShieldCheck,
  IndianRupee,
  Lock,
  ArrowRight,
  Send,
  Camera,
  RefreshCw,
  Sparkles,
  Zap,
  Check,
  Smartphone,
  Upload
} from "lucide-react";
import { useChatContext } from "../../context/ChatContext";
import confetti from "canvas-confetti";
import toast from "react-hot-toast";

const PRESET_AMOUNTS = [100, 200, 500, 1000, 2000];

const SAMPLE_PAYEES = [
  { name: "Rahul Sharma", upiId: "rahul@okhdfcbank", phone: "+91 98765 43210", avatar: "https://avatar.iran.liara.run/public/boy?username=rahul" },
  { name: "Priya Patel", upiId: "priya@okaxis", phone: "+91 91234 56789", avatar: "https://avatar.iran.liara.run/public/girl?username=priya" },
  { name: "Aryavarta Merchant Pay", upiId: "aryavarta.pay@upi", phone: "Verified Business", avatar: "https://avatar.iran.liara.run/public/boy?username=merchant" }
];

const ScanAndPayModal = ({ onPaymentComplete, onClose }) => {
  const { sendMessage } = useChatContext();

  // Steps: "scan" | "enter_amount" | "enter_pin" | "success"
  const [step, setStep] = useState("scan");
  const [payee, setPayee] = useState(SAMPLE_PAYEES[0]);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [upiPin, setUpiPin] = useState("");
  const [txnId, setTxnId] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(false);

  // Start Scanner Camera
  useEffect(() => {
    if (step === "scan") {
      startScanner();
    } else {
      stopScanner();
    }
    return () => stopScanner();
  }, [step]);

  const startScanner = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
          audio: false
        }).catch(() => navigator.mediaDevices.getUserMedia({ video: true }));

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
        setCameraActive(true);
      }
    } catch (err) {
      console.warn("Scanner camera warning:", err);
      setCameraActive(false);
    }
  };

  const stopScanner = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const handleSelectPayee = (selectedPayee) => {
    setPayee(selectedPayee);
    stopScanner();
    setStep("enter_amount");
  };

  const handleProceedToPin = (e) => {
    e.preventDefault();
    const num = Number(amount);
    if (!num || num <= 0) {
      toast.error("Please enter a valid amount in ₹");
      return;
    }
    setStep("enter_pin");
  };

  const handlePinDigit = (digit) => {
    if (upiPin.length < 4) {
      const nextPin = upiPin + digit;
      setUpiPin(nextPin);
      if (nextPin.length === 4) {
        handleExecutePayment(nextPin);
      }
    }
  };

  const handlePinDelete = () => {
    setUpiPin(upiPin.slice(0, -1));
  };

  const handleExecutePayment = (enteredPin) => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      const generatedTxn = `UPI/${Math.floor(100000000000 + Math.random() * 900000000000)}`;
      setTxnId(generatedTxn);
      setStep("success");

      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {
        // ignore
      }
    }, 1200);
  };

  const handleSendReceiptToChat = () => {
    const receiptText = `💳 **Aryavarta UPI Payment Receipt**\n\n- **Paid To:** ${payee.name} (${payee.upiId})\n- **Amount:** ₹${amount}\n- **Transaction ID:** \`${txnId}\`\n- **Status:** ✅ SUCCESS\n- **Time:** ${new Date().toLocaleTimeString()}\n${note ? `- **Note:** ${note}\n` : ""}\n*Verified Secure by Aryavarta Pay* 🔒`;
    sendMessage(receiptText);
    toast.success("Payment receipt sent to chat! 🧾⚡");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-fade-in select-none text-white">
      <div className="w-full max-w-md bg-[#111b21] border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5 relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shadow">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <span>Scan & Pay (UPI)</span>
                <span className="text-[10px] px-1.5 py-0.2 bg-emerald-500/20 text-emerald-400 font-bold rounded">
                  BHIM UPI
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">Scan any UPI QR Code or contact to pay</p>
            </div>
          </div>

          <button
            onClick={() => {
              stopScanner();
              onClose();
            }}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ================= STEP 1: SCANNER VIEW ================= */}
        {step === "scan" && (
          <div className="space-y-4 animate-fade-in">
            {/* Viewfinder Camera Area */}
            <div className="relative aspect-square bg-black rounded-2xl overflow-hidden border-2 border-[#00a884] shadow-2xl flex items-center justify-center">
              {cameraActive ? (
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
              ) : (
                <div className="text-center p-4">
                  <Camera className="w-12 h-12 text-slate-500 mx-auto mb-2" />
                  <p className="text-xs text-slate-400 font-medium">Position any QR code inside the frame to pay</p>
                </div>
              )}

              {/* Laser Scanning Beam */}
              <div className="absolute inset-x-4 top-1/2 h-0.5 bg-emerald-400 shadow-[0_0_15px_#00a884] animate-pulse" />

              {/* Corner Crosshairs */}
              <div className="absolute top-4 left-4 w-8 h-8 border-t-4 border-l-4 border-[#00a884]" />
              <div className="absolute top-4 right-4 w-8 h-8 border-t-4 border-r-4 border-[#00a884]" />
              <div className="absolute bottom-4 left-4 w-8 h-8 border-b-4 border-l-4 border-[#00a884]" />
              <div className="absolute bottom-4 right-4 w-8 h-8 border-b-4 border-r-4 border-[#00a884]" />
            </div>

            {/* Quick Demo Payees List */}
            <div className="space-y-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Or Tap to Pay Contact / Merchant:
              </span>

              <div className="space-y-2">
                {SAMPLE_PAYEES.map((p, i) => (
                  <div
                    key={i}
                    onClick={() => handleSelectPayee(p)}
                    className="p-3 bg-[#202c33] hover:bg-[#2a3942] border border-slate-750 rounded-2xl flex items-center justify-between cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <img src={p.avatar} alt={p.name} className="w-9 h-9 rounded-full object-cover bg-slate-800" />
                      <div>
                        <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                          <span>{p.name}</span>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400/20" />
                        </h4>
                        <p className="text-[10px] text-slate-400 font-mono">{p.upiId}</p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-emerald-400" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 2: ENTER AMOUNT ================= */}
        {step === "enter_amount" && (
          <form onSubmit={handleProceedToPin} className="space-y-5 animate-fade-in">
            {/* Payee Info Card */}
            <div className="p-4 bg-[#202c33] border border-slate-700 rounded-2xl flex items-center gap-3.5">
              <img src={payee.avatar} alt={payee.name} className="w-12 h-12 rounded-full object-cover bg-slate-800" />
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <span>Paying {payee.name}</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 fill-emerald-400/20" />
                </h4>
                <p className="text-xs text-slate-400 font-mono">{payee.upiId}</p>
                <p className="text-[10px] text-emerald-400 font-semibold mt-0.5">Banking Name: {payee.name}</p>
              </div>
            </div>

            {/* Amount Input */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300">Enter Amount</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-emerald-400">₹</span>
                <input
                  type="number"
                  placeholder="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  autoFocus
                  required
                  min="1"
                  max="100000"
                  className="w-full pl-10 pr-4 py-3 bg-[#182229] border border-slate-700 rounded-2xl text-2xl font-bold text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              {/* Preset Chips */}
              <div className="flex items-center gap-2 pt-1 overflow-x-auto">
                {PRESET_AMOUNTS.map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setAmount(String(amt))}
                    className="px-3 py-1.5 rounded-xl bg-[#202c33] hover:bg-[#2a3942] border border-slate-700 text-xs font-bold text-slate-200 transition-colors cursor-pointer"
                  >
                    +₹{amt}
                  </button>
                ))}
              </div>
            </div>

            {/* Payment Note */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Add a note (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Dinner, Project, Gift..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full py-2.5 px-3.5 bg-[#182229] border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Proceed Button */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep("scan")}
                className="px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 cursor-pointer"
              >
                Back
              </button>

              <button
                type="submit"
                className="flex-1 py-3 bg-[#00a884] hover:bg-[#02906f] text-white font-bold text-xs rounded-2xl shadow-lg shadow-emerald-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Proceed to Pay ₹{amount || "0"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* ================= STEP 3: ENTER UPI PIN ================= */}
        {step === "enter_pin" && (
          <div className="space-y-6 text-center animate-fade-in">
            <div className="space-y-1">
              <div className="w-12 h-12 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto mb-2">
                <Lock className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-white">Enter 4-Digit UPI PIN</h4>
              <p className="text-xs text-slate-400">Paying ₹{amount} to {payee.name}</p>
            </div>

            {/* PIN Dots */}
            <div className="flex items-center justify-center gap-4 py-2">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`w-4 h-4 rounded-full border-2 transition-all ${
                    upiPin.length > i
                      ? "bg-emerald-400 border-emerald-400 scale-110 shadow-[0_0_10px_#00a884]"
                      : "border-slate-600 bg-transparent"
                  }`}
                />
              ))}
            </div>

            {isProcessing ? (
              <div className="py-6 flex flex-col items-center space-y-2">
                <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin" />
                <p className="text-xs text-slate-300 font-semibold">Authorizing with UPI Server...</p>
              </div>
            ) : (
              /* PIN Numeric Keypad */
              <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto pt-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, "C", 0, "⌫"].map((key, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      if (key === "C") setUpiPin("");
                      else if (key === "⌫") handlePinDelete();
                      else handlePinDigit(String(key));
                    }}
                    className="py-3 rounded-2xl bg-[#202c33] hover:bg-[#2a3942] active:scale-95 text-sm font-bold text-white transition-all cursor-pointer"
                  >
                    {key}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================= STEP 4: PAYMENT SUCCESS ================= */}
        {step === "success" && (
          <div className="space-y-5 text-center animate-fade-in py-2">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/30 animate-bounce">
              <Check className="w-8 h-8 text-emerald-400 stroke-[3]" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-extrabold text-white">Payment Successful!</h3>
              <p className="text-3xl font-extrabold text-emerald-400 font-mono">₹{amount}</p>
              <p className="text-xs text-slate-300 font-medium">Paid to {payee.name}</p>
            </div>

            {/* Receipt Summary Card */}
            <div className="p-4 bg-[#202c33] border border-slate-750 rounded-2xl text-left space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>UPI Ref ID</span>
                <span className="font-mono text-white">{txnId}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Payee UPI ID</span>
                <span className="font-mono text-white">{payee.upiId}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Date & Time</span>
                <span className="text-white">{new Date().toLocaleString()}</span>
              </div>
              {note && (
                <div className="flex justify-between text-slate-400">
                  <span>Note</span>
                  <span className="text-white">{note}</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-2">
              <button
                onClick={handleSendReceiptToChat}
                className="w-full py-3 bg-[#00a884] hover:bg-[#02906f] text-white font-bold text-xs rounded-2xl shadow-lg shadow-emerald-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Send Receipt to Chat 🧾⚡</span>
              </button>

              <button
                onClick={onClose}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold text-xs rounded-2xl transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScanAndPayModal;
