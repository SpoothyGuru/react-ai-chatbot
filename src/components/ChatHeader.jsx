import { Sun, Moon } from "lucide-react";

export default function ChatHeader({ darkMode, setDarkMode }) {

  return (
    <div className="flex justify-between items-center p-4 border-b border-white/10">

      <h1 className="text-white text-xl font-bold">
        🤖 AI Assistant
      </h1>

      <button
        onClick={() => setDarkMode(!darkMode)}
        className="text-white"
      >
        {darkMode ? <Sun size={20}/> : <Moon size={20}/>}
      </button>

    </div>
  );
}