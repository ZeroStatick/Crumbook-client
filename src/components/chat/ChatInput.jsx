import React, { useState } from "react";

const ChatInput = ({ onSendMessage, isLoading }) => {
  const [input, setInput] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input);
      setInput("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative group w-full">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        disabled={isLoading}
        placeholder="Ask the AI Chef anything..."
        className="w-full rounded-2xl border border-white/10 bg-white/5 py-4 pl-6 pr-16 text-white outline-none transition-all placeholder:text-white/20 focus:border-amber-400/30 focus:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
      />
      <button
        type="submit"
        disabled={!input.trim() || isLoading}
        className={`absolute right-2 top-2 bottom-2 px-4 rounded-xl font-bold transition-all flex items-center justify-center ${
          !input.trim() || isLoading
            ? "cursor-not-allowed text-white/10"
            : "bg-amber-400/10 text-amber-200 hover:bg-amber-400/20 active:scale-95 shadow-lg shadow-amber-950/20"
        }`}
      >
        {isLoading ? (
          <div className="w-5 h-5 border-2 border-white/30 border-t-amber-400 rounded-full animate-spin"></div>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
          </svg>
        )}
      </button>
    </form>
  );
};

export default ChatInput;
