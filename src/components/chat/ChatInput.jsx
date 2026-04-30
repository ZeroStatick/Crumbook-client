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
    <form onSubmit={handleSubmit} className="relative group">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        disabled={isLoading}
        placeholder="Ask the AI Chef anything..."
        className="rounded-2xl border border-white/15 bg-white/10 text-[#f8f4e7] outline-none shadow-[inset_0_1px_2px_rgba(0,0,0,0.35)] placeholder:text-[#f8f4e7]/60 focus:border-white/30 focus:shadow-[0_0_0_4px_rgba(255,185,95,0.16)] focus:bg-white/15 transition-all w-full rounded-2xl bg-white/95 py-4 pl-6 pr-14 shadow-sm disabled:cursor-not-allowed disabled:bg-amber-50/60"
      />
      <button
        type="submit"
        disabled={!input.trim() || isLoading}
        className={`absolute right-2 top-2 bottom-2 px-4 rounded-xl font-bold transition-all flex items-center justify-center ${
          !input.trim() || isLoading
            ? "cursor-not-allowed bg-amber-50 text-amber-300"
            : "rounded-xl font-bold text-white bg-gradient-to-br from-[#b45309] to-[#d88b1c] shadow-[0_12px_30px_rgba(216,139,28,0.26)] hover:brightness-105 active:scale-95 transition-all text-white shadow-sm active:scale-95"
        }`}
      >
        {isLoading ? (
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
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
