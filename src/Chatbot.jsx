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
    } catch {}
    return [defaultIntro];
  });

  const [conversations, setConversations] = useState(() => {
    try {
      const raw = localStorage.getItem("chat_conversations");
      if (raw) return JSON.parse(raw);
    } catch {}
    return [];
  });

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    localStorage.setItem("chat_history", JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem("chat_conversations", JSON.stringify(conversations));
  }, [conversations]);

  const newConversation = () => {
    setMessages([defaultIntro]);
  };

  const saveConversation = () => {

    const name = prompt(
      "Name for this conversation:",
      `Conversation ${conversations.length + 1}`
    );

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
    if (!slot?.messages) return;
    setMessages(slot.messages);
  };

  const deleteConversation = (id) => {
    if (!confirm("Delete this conversation?")) return;
    setConversations(conversations.filter((c) => c.id !== id));
  };

  const clearHistory = () => {
    localStorage.removeItem("chat_history");
    setMessages([defaultIntro]);
  };

  const exportHistory = () => {

    const dataStr = JSON.stringify(messages, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");

    a.href = url;
    a.download = `chat-history-${Date.now()}.json`;

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

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          conversation: updatedMessages
        })
      });

      const data = await res.json();

      const botReply =
        data?.text ||
        data?.choices?.[0]?.message?.content ||
        "Sorry, I couldn't generate a response.";

      const botMessage = {
        id: Date.now() + 1,
        role: "assistant",
        content: botReply
      };

      setTimeout(() => {
        setMessages([...updatedMessages, botMessage]);
        setLoading(false);
      }, 800);

    } catch {

      const errorMessage = {
        id: Date.now() + 2,
        role: "assistant",
        content: "⚠️ Server error. Please try again."
      };

      setMessages([...updatedMessages, errorMessage]);
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4">

      {/* Responsive container */}
      <div className="w-full max-w-6xl flex flex-col md:flex-row gap-4">

        {/* Sidebar */}
        <aside className="w-full md:w-64 bg-white/5 backdrop-blur rounded-2xl p-4 flex flex-col h-[40vh] md:h-[80vh]">

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
              Save
            </button>

            <button
              onClick={() => setConversations([])}
              className="text-sm bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md"
            >
              Clear
            </button>

          </div>

          <ul className="flex-1 overflow-y-auto space-y-2">
            {conversations.length === 0 && (
              <li className="text-sm text-white/60">
                No saved conversations
              </li>
            )}

            {conversations.map((c) => (
              <li
                key={c.id}
                className="bg-white/6 p-2 rounded-md flex justify-between items-center"
              >

                <button
                  onClick={() => loadConversation(c)}
                  className="text-left flex-1"
                >

                  <div className="text-sm font-medium text-white">
                    {c.name}
                  </div>

                  <div className="text-xs text-white/60">
                    {new Date(c.createdAt).toLocaleString()}
                  </div>

                </button>

                <button
                  onClick={() => deleteConversation(c.id)}
                  className="text-xs bg-red-600 px-2 py-1 rounded ml-2"
                >
                  Del
                </button>

              </li>
            ))}
          </ul>
        </aside>

        {/* Chat Panel */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex-1 bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-4 md:p-6 flex flex-col h-[60vh] md:h-[80vh]"
        >

          <div className="flex flex-col sm:flex-row sm:justify-between gap-3 mb-4">

            <h1 className="text-white text-xl md:text-2xl font-semibold">
              ✨ AI Assistant
            </h1>

            <div className="flex gap-2">

              <button
                onClick={exportHistory}
                className="text-sm bg-white/10 hover:bg-white/20 text-white px-3 py-1 rounded-md"
              >
                Export
              </button>

              <button
                onClick={clearHistory}
                className="text-sm bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md"
              >
                Clear
              </button>

            </div>

          </div>

          <div className="flex-1 overflow-y-auto space-y-4">

            <AnimatePresence>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, x: msg.role === "user" ? 200 : -200 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4 }}
                  className={`p-4 rounded-2xl max-w-[85%] md:max-w-[70%] shadow-xl ${
                    msg.role === "user"
                      ? "bg-gradient-to-r from-cyan-400 to-teal-500 text-black ml-auto"
                      : "bg-white/20 text-white"
                  }`}
                >
                  {msg.content}
                </motion.div>
              ))}
            </AnimatePresence>

            {loading && (
              <div className="flex space-x-2">
                <div className="w-3 h-3 bg-white rounded-full animate-bounce"></div>
                <div className="w-3 h-3 bg-white rounded-full animate-bounce delay-150"></div>
                <div className="w-3 h-3 bg-white rounded-full animate-bounce delay-300"></div>
              </div>
            )}

            <div ref={bottomRef}></div>
          </div>

          <div className="mt-4 flex flex-col sm:flex-row gap-2">

            <input
              type="text"
              className="flex-1 p-3 rounded-xl bg-white/20 text-white outline-none placeholder-gray-300 w-full"
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
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-xl shadow-lg w-full sm:w-auto"
            >
              Send
            </motion.button>

          </div>

        </motion.div>
      </div>
    </div>
  );
}