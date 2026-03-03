import Chatbot from "./Chatbot";

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-black flex flex-col">
      
      <header className="text-white text-2xl font-bold text-center py-6">
        🚀 React AI Chatbot
      </header>

      <main className="flex-1 flex items-center justify-center px-4">
        <Chatbot />
      </main>

      <footer className="text-gray-400 text-center py-4 text-sm">
        Built with Vite + React + OpenRouter
      </footer>

    </div>
  );
}