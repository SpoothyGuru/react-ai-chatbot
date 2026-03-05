import { Plus, Trash2, Pencil } from "lucide-react";

export default function Sidebar({
  conversations,
  setConversations,
  activeId,
  setActiveId
}) {

  const newChat = () => {
    const chat = {
      id: Date.now(),
      title: "New Chat",
      messages: []
    };

    setConversations([chat, ...conversations]);
    setActiveId(chat.id);
  };

  const deleteChat = (id) => {
    const updated = conversations.filter(c => c.id !== id);
    setConversations(updated);

    if (updated.length) {
      setActiveId(updated[0].id);
    }
  };

  const renameChat = (id) => {
    const name = prompt("Rename conversation");

    if (!name) return;

    const updated = conversations.map(c =>
      c.id === id ? { ...c, title: name } : c
    );

    setConversations(updated);
  };

  return (
    <aside className="w-64 bg-black/40 backdrop-blur-lg p-4 flex flex-col">

      <button
        onClick={newChat}
        className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg mb-4"
      >
        <Plus size={16}/>
        New Chat
      </button>

      <div className="flex-1 overflow-y-auto space-y-2">

        {conversations.map(chat => (

          <div
            key={chat.id}
            className={`flex justify-between items-center p-2 rounded-lg cursor-pointer ${
              activeId === chat.id ? "bg-white/20" : "hover:bg-white/10"
            }`}
            onClick={() => setActiveId(chat.id)}
          >

            <span className="text-white text-sm truncate">
              {chat.title}
            </span>

            <div className="flex gap-2">

              <button onClick={(e)=>{
                e.stopPropagation();
                renameChat(chat.id);
              }}>
                <Pencil size={14}/>
              </button>

              <button onClick={(e)=>{
                e.stopPropagation();
                deleteChat(chat.id);
              }}>
                <Trash2 size={14}/>
              </button>

            </div>

          </div>

        ))}

      </div>

    </aside>
  );
}