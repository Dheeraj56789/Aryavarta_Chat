import { useEffect, useRef } from "react";
import { useChatContext } from "../../context/ChatContext";
import MessageBubble from "./MessageBubble";
import { formatChatDate } from "../../utils/formatTime";
import { Sparkles, Video } from "lucide-react";

const MessagesList = ({ selectMode }) => {
  const { messages, loadingMessages, selectedConversation, isCurrentChatTyping } = useChatContext();
  const lastMessageRef = useRef(null);

  // Auto-scroll on message updates or typing changes
  useEffect(() => {
    setTimeout(() => {
      lastMessageRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }, [messages, isCurrentChatTyping]);

  if (loadingMessages) {
    return (
      <div className="flex-1 min-h-0 flex flex-col justify-end p-4 md:p-6 space-y-3 overflow-y-auto">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className={`flex items-end gap-2.5 ${i % 2 === 0 ? "justify-start" : "justify-end"}`}
          >
            {i % 2 === 0 && <div className="w-7 h-7 rounded-full bg-slate-800 animate-pulse" />}
            <div
              className={`h-9 rounded-2xl animate-pulse ${
                i % 2 === 0 ? "w-48 bg-slate-800/80" : "w-60 bg-[#005c4b]/50"
              }`}
            />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 overflow-y-auto p-3.5 md:p-5 space-y-1">
      {/* End to end encryption banner */}
      <div className="flex items-center justify-center my-2">
        <div className="px-4 py-1.5 bg-[#182229] border border-slate-700/60 text-[11px] text-amber-300/80 rounded-xl text-center max-w-md shadow">
          🔒 Messages are end-to-end encrypted. No one outside of this chat can read or listen to them.
        </div>
      </div>

      {messages.length > 0 ? (
        messages.map((message, idx) => {
          const prevMessage = messages[idx - 1];
          const currentDate = formatChatDate(message.createdAt);
          const prevDate = prevMessage ? formatChatDate(prevMessage.createdAt) : null;
          const showDateSeparator = !prevDate || currentDate !== prevDate;

          return (
            <div key={message._id || idx}>
              {/* Date Separator */}
              {showDateSeparator && (
                <div className="flex items-center justify-center my-3">
                  <span className="px-3 py-0.5 bg-[#182229] border border-slate-800 text-[10px] font-semibold text-slate-400 rounded-full shadow-inner">
                    {currentDate}
                  </span>
                </div>
              )}

              <MessageBubble
                message={message}
                senderUser={selectedConversation}
                selectMode={selectMode}
              />
            </div>
          );
        })
      ) : (
        <div className="flex flex-col items-center justify-center h-full text-center p-6">
          <div className="w-12 h-12 rounded-3xl bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-2 shadow-inner">
            <Sparkles className="w-6 h-6 animate-spin-slow" />
          </div>
          <h4 className="text-sm md:text-base font-semibold text-slate-200">
            Say hello to {selectedConversation?.fullname}! 👋
          </h4>
          <p className="text-xs text-slate-400 max-w-xs mt-1">
            Send a message below to start your encrypted real-time conversation.
          </p>
        </div>
      )}

      {/* Real-time typing bubble */}
      {isCurrentChatTyping && (
        <div className="flex items-center gap-2.5 my-2">
          <div className="px-3.5 py-2 bg-[#202c33] rounded-2xl rounded-tl-xs border border-slate-700/50 flex items-center gap-1 shadow-md">
            <span className="w-1.5 h-1.5 bg-[#00a884] rounded-full animate-bounce [animation-delay:-0.3s]" />
            <span className="w-1.5 h-1.5 bg-[#00a884] rounded-full animate-bounce [animation-delay:-0.15s]" />
            <span className="w-1.5 h-1.5 bg-[#00a884] rounded-full animate-bounce" />
          </div>
        </div>
      )}

      <div ref={lastMessageRef} />
    </div>
  );
};

export default MessagesList;
