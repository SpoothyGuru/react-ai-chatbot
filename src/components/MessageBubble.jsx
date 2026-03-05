import ReactMarkdown from "react-markdown";
import { Copy } from "lucide-react";

export default function MessageBubble({ msg, copy }) {

  return (
    <div
      className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}
    >

      {msg.role === "assistant" && (
        <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white">
          🤖
        </div>
      )}

      <div
        className={`relative p-4 rounded-xl max-w-[70%] ${
          msg.role === "user"
            ? "bg-cyan-500 text-black"
            : "bg-white/20 text-white"
        }`}
      >

        <ReactMarkdown>
          {msg.content}
        </ReactMarkdown>

        {msg.role === "assistant" && (
          <button
            onClick={() => copy(msg.content)}
            className="absolute top-2 right-2 opacity-60 hover:opacity-100"
          >
            <Copy size={14}/>
          </button>
        )}

      </div>

      {msg.role === "user" && (
        <div className="w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center">
          👤
        </div>
      )}

    </div>
  );
}