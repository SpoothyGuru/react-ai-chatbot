import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Chatbot() {
  const [messages, setMessages] = useState([
    {
      id: Date.now(),
      role: "assistant",
      content: "Hello! How can I help you today?"
    }
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  // Auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-3xl bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-6 flex flex-col h-[80vh]"
      >
        <h1 className="text-white text-2xl font-semibold text-center mb-4">
          ✨ AI Assistant
        </h1>

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
                animate={{
                  opacity: 1,
                  x: 0,
                  scale: 1
                }}
                exit={{ opacity: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 120,
                  damping: 15
                }}
                className={`p-4 rounded-2xl max-w-[75%] shadow-xl ${
                  msg.role === "user"
                    ? "bg-gradient-to-r from-cyan-400 to-teal-500 text-black ml-auto"
                    : "bg-white/20 text-white backdrop-blur-md"
                }`}
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
  );
}