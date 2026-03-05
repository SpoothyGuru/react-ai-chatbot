import { motion } from "framer-motion";

export default function ChatInput({ input, setInput, sendMessage }) {

  return (
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
        whileHover={{ scale:1.1 }}
        whileTap={{ scale:0.9 }}
        onClick={sendMessage}
        className="bg-indigo-600 px-5 rounded-lg text-white"
      >
        Send
      </motion.button>

    </div>
  );
}