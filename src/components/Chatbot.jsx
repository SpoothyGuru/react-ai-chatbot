import { useState, useEffect } from "react";

export default function Chatbot() {
  const defaultIntro = {
    id: Date.now(),
    role: "assistant",
    content: "Hello! How can I help you today?"
  };

  // Load chats
  const [conversations, setConversations] = useState(() => {
    const saved = localStorage.getItem("chats");
    return saved ? JSON.parse(saved) : [];
  });

  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([defaultIntro]);
  const [input, setInput] = useState("");

  // Save chats
  const saveChats = (updatedChats) => {
    setConversations(updatedChats);
    localStorage.setItem("chats", JSON.stringify(updatedChats));
  };

  // Create chat
  const createChat = () => {
    const newChat = {
      id: Date.now(),
      title: "New Chat",
      messages: [defaultIntro]
    };

    const updated = [newChat, ...conversations];
    saveChats(updated);

    setActiveId(newChat.id);
    setMessages(newChat.messages);
  };

  // Load chat
  const loadChat = (chat) => {
    setActiveId(chat.id);
    setMessages(chat.messages);
  };

  // Send message
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

    let reply = "Thinking...";

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ conversation: updatedMessages })
      });

      const data = await res.json();

      reply =
        data?.text ||
        data?.choices?.[0]?.message?.content ||
        "No response";
    } catch {
      reply = "Server error";
    }

    const botMessage = {
      id: Date.now(),
      role: "assistant",
      content: reply
    };

    const finalMessages = [...updatedMessages, botMessage];
    setMessages(finalMessages);

    // Update chat in conversations
    const updatedChats = conversations.map(chat => {
      if (chat.id === activeId) {
        return {...chat, messages: finalMessages};
      }
      return chat;
    });

    saveChats(updatedChats);
  };

  return (
    <div style={{display:"flex",height:"100vh"}}>

      {/* Sidebar */}
      <div style={{width:"250px",background:"#111",color:"white",padding:"10px"}}>
        <h3>Conversations</h3>

        <button onClick={createChat}>+ New Chat</button>

        <div style={{marginTop:"20px"}}>
          {conversations.map(chat => (
            <div
              key={chat.id}
              onClick={() => loadChat(chat)}
              style={{padding:"8px",cursor:"pointer",borderBottom:"1px solid #333"}}
            >
              {chat.title}
            </div>
          ))}
        </div>
      </div>

      {/* Chat */}
      <div style={{flex:1,display:"flex",flexDirection:"column"}}>

        <div style={{flex:1,overflow:"auto",padding:"20px"}}>
          {messages.map(msg => (
            <div
              key={msg.id}
              style={{
                textAlign: msg.role==="user"?"right":"left",
                marginBottom:"10px"
              }}
            >
              {msg.content}
            </div>
          ))}
        </div>

        <div style={{display:"flex",padding:"10px"}}>
          <input
            value={input}
            onChange={(e)=>setInput(e.target.value)}
            style={{flex:1}}
          />

          <button onClick={sendMessage}>Send</button>
        </div>

      </div>

    </div>
  );
}