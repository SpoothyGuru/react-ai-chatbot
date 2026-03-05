import { Plus } from "lucide-react";

export default function Sidebar({ newChat }) {

  return (
    <aside className="w-64 bg-black/40 backdrop-blur-lg p-4 flex flex-col">

      <h2 className="text-white text-lg font-semibold mb-4">
        Conversations
      </h2>

      <button
        onClick={newChat}
        className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg"
      >
        <Plus size={16}/>
        New Chat
      </button>

    </aside>
  );
}