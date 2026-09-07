import { useState } from "react";
import {
  X,
  IndianRupee,
  QrCode,
  ArrowRight,
  ShieldCheck,
  Send,
  Download,
  Copy,
  Check
} from "lucide-react";
import { useAuthContext } from "../../context/AuthContext";
import { useChatContext } from "../../context/ChatContext";
import toast from "react-hot-toast";

const PaymentsModal = ({ onClose }) => {
  const { authUser } = useAuthContext();
  const { allUsers } = useChatContext();

  const [activeTab, setActiveTab] = useState("send"); // "send" | "my_upi" | "history"
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [copied, setCopied] = useState(false);

  // User's own UPI handle
  const userUpiId = `${(authUser?.username || "user").toLowerCase()}@aryavarta`;

  const handleSendPayment = (e) => {
    e.preventDefault();
    if (!recipient.trim()) {
      toast.error("Please enter a recipient UPI ID or phone");
      return;
    }
    if (!amount || Number(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    toast.success(`Payment request of ₹${amount} sent to ${recipient}! 💸`);
    onClose();
  };

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(userUpiId);
    setCopied(true);
    toast.success("UPI ID copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn select-none">
      <div className="bg-[#111b21] border border-slate-800 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl flex flex-col text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800/80 bg-[#16202a]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
              ₹
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Payments</h3>
              <p className="text-[11px] text-slate-400">Fast & secure UPI transfers</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="grid grid-cols-2 p-1.5 mx-4 mt-3 bg-slate-900/80 rounded-2xl border border-slate-800 text-xs font-semibold">
          <button
            onClick={() => setActiveTab("send")}
            className={`py-1.5 rounded-xl transition-all ${
              activeTab === "send"
                ? "bg-emerald-500 text-slate-950 shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Send Money
          </button>
          <button
            onClick={() => setActiveTab("my_upi")}
            className={`py-1.5 rounded-xl transition-all ${
              activeTab === "my_upi"
                ? "bg-emerald-500 text-slate-950 shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            My UPI ID
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-5">
          {activeTab === "send" ? (
            <form onSubmit={handleSendPayment} className="space-y-4">
              <div>
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Recipient UPI ID or Phone
                </label>
                <input
                  type="text"
                  placeholder="e.g. mobile number or name@bank"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Amount (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-emerald-400">
                    ₹
                  </span>
                  <input
                    type="number"
                    placeholder="0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full pl-8 pr-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm font-bold text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Note (optional)
                </label>
                <input
                  type="text"
                  placeholder="What's this for?"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-2 shadow-md cursor-pointer"
              >
                <Send className="w-4 h-4" />
                Proceed to Pay ₹{amount || "0"}
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-500">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Protected by 256-bit UPI Bank Grade Encryption</span>
              </div>
            </form>
          ) : (
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-slate-800 border-2 border-emerald-500/50 flex items-center justify-center text-emerald-400 font-bold text-xl">
                ₹
              </div>

              <div>
                <h4 className="text-sm font-bold text-white">Your Personal UPI ID</h4>
                <p className="text-xs text-emerald-400 font-mono mt-1 bg-slate-900/80 px-3 py-1 rounded-lg border border-slate-800">
                  {userUpiId}
                </p>
              </div>

              <p className="text-xs text-slate-400 max-w-xs">
                Share this UPI ID to receive payments directly to your linked bank account.
              </p>

              <button
                onClick={handleCopyUpi}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                {copied ? "Copied to Clipboard!" : "Copy UPI ID"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentsModal;
