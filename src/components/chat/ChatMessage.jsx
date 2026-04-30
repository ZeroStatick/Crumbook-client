import React from "react";
import ReactMarkdown from "react-markdown";

const ChatMessage = ({ message }) => {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4 animate-in fade-in slide-in-from-bottom-2 duration-300`}>
      <div
        className={`max-w-[85%] p-4 rounded-2xl shadow-sm ${
          isUser
            ? "rounded-tr-none bg-gradient-to-r from-[#9a3d16] to-[#c86b16] text-white"
            : "bg-[#10141e]/95 border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.45)] rounded-tl-none text-cb-text"
        }`}
      >
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">
            {isUser ? "You" : "AI Chef"}
          </span>
        </div>
        <div className={`text-sm leading-relaxed markdown-content ${isUser ? "prose-invert" : ""}`}>
          <ReactMarkdown
            components={{
              p: (props) => <p className="mb-2 last:mb-0" {...props} />,
              ul: (props) => <ul className="list-disc ml-4 mb-2" {...props} />,
              ol: (props) => <ol className="list-decimal ml-4 mb-2" {...props} />,
              li: (props) => <li className="mb-1" {...props} />,
              h1: (props) => <h1 className="text-lg font-bold mb-2" {...props} />,
              h2: (props) => <h2 className="text-md font-bold mb-2" {...props} />,
              h3: (props) => <h3 className="text-sm font-bold mb-1" {...props} />,
              code: ({ inline, ...props }) => 
                inline ? 
                  <code className="rounded bg-amber-50 px-1 text-xs font-mono" {...props} /> :
                  <code className="my-2 block overflow-x-auto rounded bg-amber-50 p-2 text-xs font-mono" {...props} />,
              blockquote: (props) => <blockquote className="my-2 border-l-4 border-amber-200 pl-4 italic" {...props} />
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
