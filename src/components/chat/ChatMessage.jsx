import React from "react";
import ReactMarkdown from "react-markdown";

const ChatMessage = ({ message }) => {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-2 animate-in fade-in slide-in-from-bottom-2 duration-500`}>
      <div
        className={`max-w-[85%] p-6 rounded-[1.75rem] shadow-xl ${
          isUser
            ? "rounded-tr-none border border-amber-400/20 bg-amber-400/10 text-white"
            : "bg-[#0a0f16] border border-white/5 rounded-tl-none text-white/90"
        }`}
      >
        <div className="flex items-center gap-2 mb-3">
          <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${isUser ? "text-amber-200/60" : "text-white/30"}`}>
            {isUser ? "Authenticated Chef" : "AI Master Chef"}
          </span>
        </div>
        <div className={`text-base leading-relaxed markdown-content ${isUser ? "prose-invert" : ""}`}>
          <ReactMarkdown
            components={{
              p: (props) => <p className="mb-4 last:mb-0" {...props} />,
              ul: (props) => <ul className="list-disc ml-6 mb-4 space-y-2" {...props} />,
              ol: (props) => <ol className="list-decimal ml-6 mb-4 space-y-2" {...props} />,
              li: (props) => <li className="leading-relaxed" {...props} />,
              h1: (props) => <h1 className="font-serif text-2xl font-black mb-4 text-white" {...props} />,
              h2: (props) => <h2 className="font-serif text-xl font-black mb-3 text-white" {...props} />,
              h3: (props) => <h3 className="font-serif text-lg font-black mb-2 text-white" {...props} />,
              code: ({ inline, ...props }) => 
                inline ? 
                  <code className="rounded bg-white/10 px-1.5 py-0.5 text-xs font-mono text-amber-200" {...props} /> :
                  <code className="my-4 block overflow-x-auto rounded-xl border border-white/10 bg-black/40 p-4 text-xs font-mono text-white/80" {...props} />,
              blockquote: (props) => <blockquote className="my-4 border-l-4 border-amber-400/30 bg-white/5 p-4 rounded-r-xl italic text-white/60" {...props} />
            }}
          >
            {message.text}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
