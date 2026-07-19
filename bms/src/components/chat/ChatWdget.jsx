import { useEffect, useRef, useState } from "react";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutlined";
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";
import api from "../../api/axios";

/**
 * Floating AI chat bubble. Sits fixed in the bottom-right corner of the
 * viewport; clicking it opens a small chat panel above it.
 *
 * Wire this up to your real backend by replacing the `api.post(...)` call
 * in `handleSend` below with your actual chat endpoint.
 */
export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi! How can I help you today?" },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, open]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending) return;

    const nextMessages = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);
    setInput("");
    setSending(true);

    try {
      const res = await api.post("/chat", { messages: nextMessages });
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: res.data.reply },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, something went wrong. Please try again.",
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
 {/* Chat panel */}
      {open && (
        <div className="fixed bottom-52 lg:bottom-24 right-6 z-50 w-80 sm:w-96 h-112 max-h-[70vh] flex flex-col bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-indigo-600">
            <h2 className="text-sm font-semibold text-white">Ask AI</h2>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              className="text-white/80 hover:text-white transition"
            >
              <CloseIcon fontSize="small" />
            </button>
          </div>

          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-4 py-3 space-y-3"
          >
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                    m.role === "user"
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-100"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {sending && (
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-lg px-3 py-2 text-sm bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500">
                  Typing...
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 px-3 py-3 border-t border-slate-200 dark:border-slate-700">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              rows={1}
              className="flex-1 resize-none rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-slate-700 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={sending || !input.trim()}
              aria-label="Send message"
              className="w-9 h-9 rounded-full flex items-center justify-center bg-indigo-600 text-white hover:bg-indigo-700 transition disabled:opacity-50"
            >
              <SendIcon fontSize="small" />
            </button>
          </div>
        </div>
      )}

    {/* Floating bubble */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label={open ? "Close chat" : "Open chat"}
        className="fixed bottom-36 lg:bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 hover:scale-105 transition flex items-center justify-center"
      >
        {open ? (
          <CloseIcon fontSize="medium" />
        ) : (
          <ChatBubbleOutlineIcon fontSize="medium" />
        )}
      </button>
    </>
  );
}