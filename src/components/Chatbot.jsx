import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { Sun, Moon, Menu } from "lucide-react";

export default function Chatbot() {

  const defaultIntro = {
    id: Date.now(),
    role: "assistant",
    content: "Hello! How can I help you today?",
    time: new Date().toLocaleTimeString()
  };

  const [conversations, setConversations] = useState(() => {
    const saved = localStorage.getItem("chat_conversations");
    return saved ? JSON.parse(saved) : [];
  });

  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([defaultIntro]);
  const [input, setInput] = useState("");
  const [darkMode, setDarkMode] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const bottomRef = useRef(null);

  /* Save to localStorage */
  useEffect(() => {
    localStorage.setItem("chat_conversations", JSON.stringify(conversations));
  }, [conversations]);

  /* Scroll */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* Update messages inside active chat */
  useEffect(() => {

    if (!activeChat) return;

    setConversations(prev =>
      prev.map(chat =>
        chat.id === activeChat ? { ...chat, messages } : chat
      )
    );

  }, [messages]);

  /* Create new chat */
  const newChat = () => {

    const chat = {
      id: Date.now(),
      title: "New Chat",
      messages: [defaultIntro]
    };

    setConversations(prev => [chat, ...prev]);
    setActiveChat(chat.id);
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

    const userMsg = {
      id: Date.now(),
      role: "user",
      content: input,
      time: new Date().toLocaleTimeString()
    };

    const updated = [...messages, userMsg];

    setMessages(updated);
    setInput("");

    try {

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversation: updated })
      });

      const data = await res.json();

      const reply =
        data?.text ||
        data?.choices?.[0]?.message?.content ||
        "No response.";

      const botMsg = {
        id: Date.now(),
        role: "assistant",
        content: reply,
        time: new Date().toLocaleTimeString()
      };

      setMessages([...updated, botMsg]);

    } catch {

      setMessages([
        ...updated,
        {
          id: Date.now(),
          role: "assistant",
          content: "Server error",
          time: new Date().toLocaleTimeString()
        }
      ]);

    }

  };

  return (

    <div className={`${darkMode ? "bg-slate-900" : "bg-gray-100"} min-h-screen flex`}>

      {/* Sidebar */}
      <aside className={`fixed md:relative w-64 h-full bg-black/40 p-4 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 transition`}>

        <h2 className="text-white text-lg mb-4">Conversations</h2>

        <button
          onClick={newChat}
          className="w-full bg-indigo-600 text-white py-2 rounded mb-4"
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

      {/* Main */}
      <div className="flex-1 flex flex-col h-screen">

        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-white/10">

          <button
            className="md:hidden text-white"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu size={20}/>
          </button>

          <h1 className="text-white text-xl font-bold">
            🤖 AI Assistant
          </h1>

          <button
            onClick={() => setDarkMode(!darkMode)}
            className="text-white"
          >
            {darkMode ? <Sun size={18}/> : <Moon size={18}/>}
          </button>

        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">

          {messages.map(msg => (

            <motion.div
              key={msg.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`flex ${msg.role === "user" ? "justify-end" : ""}`}
            >

              <div className={`p-4 rounded-xl max-w-[70%] ${
                msg.role === "user"
                  ? "bg-cyan-500 text-black"
                  : "bg-white/20 text-white"
              }`}>

                <ReactMarkdown>{msg.content}</ReactMarkdown>

                <div className="text-xs opacity-60 mt-2">
                  {msg.time}
                </div>

              </div>

            </motion.div>

          ))}

          <div ref={bottomRef}></div>

        </div>

        {/* Input */}
        <div className="p-4 flex gap-2 border-t border-white/10">

          <input
            value={input}
            onChange={(e)=>setInput(e.target.value)}
            onKeyDown={(e)=>e.key==="Enter" && sendMessage()}
            placeholder="Type your message..."
            className="flex-1 p-3 rounded bg-white/20 text-white outline-none"
          />

          <button
            onClick={sendMessage}
            className="bg-indigo-600 px-5 rounded text-white"
          >
            Send
          </button>

        </div>

      </div>

    </div>

  );
}