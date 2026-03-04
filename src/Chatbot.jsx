import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Chatbot() {
  const defaultIntro = {
    id: Date.now(),
    role: "assistant",
    content: "Hello! How can I help you today?"
  };

  const [messages, setMessages] = useState(() => {
    try {
      const raw = localStorage.getItem("chat_history");
      if (raw) return JSON.parse(raw);
    } catch (e) {
      // ignore parse errors
    }

    return [defaultIntro];
  });

  // Saved conversation slots (sidebar)
  const [conversations, setConversations] = useState(() => {
    try {
      const raw = localStorage.getItem("chat_conversations");
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem("chat_conversations", JSON.stringify(conversations));
    } catch (e) {}
  }, [conversations]);

  const saveConversation = () => {
    const name = prompt("Name for this conversation:", `Conversation ${conversations.length + 1}`);
    if (!name) return;

    const slot = {
      id: Date.now(),
      name,
      messages,
      createdAt: new Date().toISOString()
    };

    setConversations([slot, ...conversations]);
  };

  const loadConversation = (slot) => {
    if (!slot || !slot.messages) return;
    setMessages(slot.messages);
  };

  const deleteConversation = (id) => {
    if (!confirm("Delete this conversation?")) return;
    setConversations(conversations.filter((c) => c.id !== id));
  };

  const newConversation = () => {
    setMessages([defaultIntro]);
  };

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  // Auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Persist messages to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem("chat_history", JSON.stringify(messages));
    } catch (e) {
      // ignore storage errors (e.g., quota)
    }
  }, [messages]);

  const clearHistory = () => {
    try {
      localStorage.removeItem("chat_history");
    } catch (e) {}
    setMessages([defaultIntro]);
  };

  const exportHistory = () => {
    const dataStr = JSON.stringify(messages, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `chat-history-${new Date().toISOString()}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = {
      id: Date.now(),
      role: "user",
      content: input
    };

    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ conversation: updatedMessages })
      });

      const data = await res.json();

      // Delay for visible animation
      setTimeout(() => {
        const botReply =
          data?.text ||
          data?.choices?.[0]?.message?.content ||
         "Sorry, I couldn't generate a response.";

        const botMessage = {
          id: Date.now() + 1,
          role: "assistant",
          content: botReply
        };

        setMessages([...updatedMessages, botMessage]);
        setLoading(false);
      }, 1000);

    } catch (err) {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-5xl flex gap-4">

        {/* Sidebar: saved conversations */}
        <aside className="w-64 bg-white/5 backdrop-blur rounded-2xl p-4 flex flex-col h-[80vh]">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-white font-semibold">Conversations</h2>
            <button
              onClick={newConversation}
              className="text-xs bg-white/10 hover:bg-white/20 text-white px-2 py-1 rounded-md"
            >
              New
            </button>
          </div>

          <div className="flex gap-2 mb-3">
            <button
              onClick={saveConversation}
              className="flex-1 text-sm bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 rounded-md"
            >
              Save Current
            </button>
            <button
              onClick={() => {
                if (confirm("Clear all saved conversations?")) setConversations([]);
              }}
              className="text-sm bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md"
            >
              Clear
            </button>
          </div>

          <ul className="flex-1 overflow-y-auto space-y-2">
            {conversations.length === 0 && (
              <li className="text-sm text-white/60">No saved conversations</li>
            )}

            {conversations.map((c) => (
              <li key={c.id} className="bg-white/6 p-2 rounded-md flex items-center justify-between">
                <div className="flex-1 pr-2">
                  <button onClick={() => loadConversation(c)} className="text-left w-full">
                    <div className="text-sm font-medium text-white">{c.name}</div>
                    <div className="text-xs text-white/60">{new Date(c.createdAt).toLocaleString()}</div>
                  </button>
                </div>

                <div className="flex gap-2 ml-2">
                  <button onClick={() => loadConversation(c)} className="text-xs px-2 py-1 bg-white/10 rounded">Load</button>
                  <button onClick={() => deleteConversation(c.id)} className="text-xs px-2 py-1 bg-red-600 rounded">Del</button>
                </div>
              </li>
            ))}
          </ul>
        </aside>

        {/* Main chat panel */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex-1 bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-6 flex flex-col h-[80vh]"
        >
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-white text-2xl font-semibold text-center">✨ AI Assistant</h1>

            <div className="flex gap-2">
              <button onClick={exportHistory} className="text-sm bg-white/10 hover:bg-white/20 text-white px-3 py-1 rounded-md">Export</button>
              <button onClick={clearHistory} className="text-sm bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md">Clear</button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            <AnimatePresence>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{
                    opacity: 0,
                    x: msg.role === "user" ? 300 : -300,
                    scale: 0.8
                  }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ type: "spring", stiffness: 120, damping: 15 }}
                  className={`p-4 rounded-2xl max-w-[75%] shadow-xl ${msg.role === "user" ? "bg-gradient-to-r from-cyan-400 to-teal-500 text-black ml-auto" : "bg-white/20 text-white backdrop-blur-md"}`}
                >
                  {msg.content}
                </motion.div>
              ))}
            </AnimatePresence>

            {loading && (
              <div className="flex space-x-2 ml-2">
                <div className="w-3 h-3 bg-white rounded-full animate-bounce"></div>
                <div className="w-3 h-3 bg-white rounded-full animate-bounce delay-150"></div>
                <div className="w-3 h-3 bg-white rounded-full animate-bounce delay-300"></div>
              </div>
            )}

            <div ref={bottomRef}></div>
          </div>

          <div className="mt-4 flex gap-2">
            <input
              type="text"
              className="flex-1 p-3 rounded-xl bg-white/20 text-white outline-none placeholder-gray-300"
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={sendMessage}
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 rounded-xl shadow-lg"
            >
              Send
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}