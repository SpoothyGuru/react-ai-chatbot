import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { Sun, Moon, Menu, Copy } from "lucide-react";

export default function Chatbot() {

  const today = new Date().toLocaleDateString();

  const defaultIntro = {
    id: Date.now(),
    role: "assistant",
    content: `Hello! Today is ${today}. How can I help you today?`,
    time: new Date().toLocaleTimeString()
  };

  const [conversations, setConversations] = useState(() => {
    const saved = localStorage.getItem("ai_conversations");
    return saved ? JSON.parse(saved) : [];
  });

  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([defaultIntro]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const bottomRef = useRef(null);

  /* Save conversations */
  useEffect(() => {
    localStorage.setItem("ai_conversations", JSON.stringify(conversations));
  }, [conversations]);

  /* Scroll to bottom */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* Update messages inside conversation */
  useEffect(() => {

    if (!activeChat) return;

    const updated = conversations.map(chat => {

      if (chat.id === activeChat) {
        return { ...chat, messages };
      }

      return chat;

    });

    setConversations(updated);

  }, [messages]);

  /* Create new chat */
  const createNewChat = () => {

    const newChat = {
      id: Date.now(),
      title: "New Chat",
      messages: [defaultIntro]
    };

    setConversations(prev => [newChat, ...prev]);
    setActiveChat(newChat.id);
    setMessages([defaultIntro]);

  };

  /* Load chat */
  const loadChat = (chat) => {
    setActiveChat(chat.id);
    setMessages(chat.messages);
  };

  /* Send message */
  const sendMessage = async () => {

    if (!input.trim()) return;

    const userMessage = {
      id: Date.now(),
      role: "user",
      content: input,
      time: new Date().toLocaleTimeString()
    };

    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversation: updatedMessages })
      });

      const data = await res.json();

      const botReply =
        data?.text ||
        data?.choices?.[0]?.message?.content ||
        "Sorry, I couldn't generate a response.";

      const botMessage = {
        id: Date.now(),
        role: "assistant",
        content: botReply,
        time: new Date().toLocaleTimeString()
      };

      setMessages([...updatedMessages, botMessage]);
      setLoading(false);

    } catch {

      const errorMessage = {
        id: Date.now(),
        role: "assistant",
        content: "⚠️ Server error. Please try again.",
        time: new Date().toLocaleTimeString()
      };

      setMessages([...updatedMessages, errorMessage]);
      setLoading(false);

    }
  };

  const copyText = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (

    <div className={`${darkMode ? "bg-slate-900" : "bg-gray-100"} min-h-screen flex`}>

      {/* Sidebar */}
      <aside className={`fixed md:relative z-40 w-64 h-full bg-black/40 backdrop-blur-lg p-4 transition-transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}>

        <h2 className="text-white text-lg font-semibold mb-4">
          Conversations
        </h2>

        <button
          onClick={createNewChat}
          className="w-full bg-indigo-600 text-white py-2 rounded-lg mb-4"
        >
          + New Chat
        </button>

        <div className="space-y-2">

          {conversations.map(chat => (

            <div
              key={chat.id}
              onClick={() => loadChat(chat)}
              className="text-white p-2 hover:bg-white/10 rounded cursor-pointer"
            >
              {chat.title}
            </div>

          ))}

        </div>

      </aside>

      {/* Main Chat */}
      <div className="flex-1 flex flex-col h-screen">

        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-white/10">

          <div className="flex items-center gap-3">

            <button
              className="md:hidden text-white"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu size={22}/>
            </button>

            <h1 className="text-white text-xl font-bold">
              🤖 AI Assistant
            </h1>

          </div>

          <button
            onClick={() => setDarkMode(!darkMode)}
            className="text-white"
          >
            {darkMode ? <Sun size={20}/> : <Moon size={20}/>}
          </button>

        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">

          <AnimatePresence>

            {messages.map((msg) => (

              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === "user" ? "justify-end" : ""}`}
              >

                <div className={`relative p-4 rounded-xl max-w-[70%] ${
                  msg.role === "user"
                    ? "bg-cyan-500 text-black"
                    : "bg-white/20 text-white"
                }`}>

                  <ReactMarkdown>
                    {msg.content}
                  </ReactMarkdown>

                  {msg.role === "assistant" && (
                    <button
                      onClick={() => copyText(msg.content)}
                      className="absolute top-2 right-2 opacity-60 hover:opacity-100"
                    >
                      <Copy size={14}/>
                    </button>
                  )}

                  <div className="text-xs opacity-60 mt-2">
                    {msg.time}
                  </div>

                </div>

              </motion.div>

            ))}

          </AnimatePresence>

          {loading && (
            <div className="text-white animate-pulse">
              AI is typing...
            </div>
          )}

          <div ref={bottomRef}></div>

        </div>

        {/* Input */}
        <div className="p-4 flex gap-2 border-t border-white/10">

          <input
            type="text"
            value={input}
            onChange={(e)=>setInput(e.target.value)}
            onKeyDown={(e)=>e.key==="Enter" && sendMessage()}
            placeholder="Type your message..."
            className="flex-1 p-3 rounded-lg bg-white/20 text-white outline-none"
          />

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={sendMessage}
            className="bg-indigo-600 px-5 rounded-lg text-white"
          >
            Send
          </motion.button>

        </div>

      </div>

    </div>
  );
}