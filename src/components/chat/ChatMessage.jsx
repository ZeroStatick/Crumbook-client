import React from "react";
import ReactMarkdown from "react-markdown";

const ChatMessage = ({ message }) => {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4 animate-in fade-in slide-in-from-bottom-2 duration-300`}>
      <div
        className={`max-w-[85%] p-4 rounded-2xl shadow-sm ${
          isUser
            ? "bg-blue-600 text-white rounded-tr-none"
            : "bg-white text-gray-800 border border-gray-100 rounded-tl-none"
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
              p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
              ul: ({ node, ...props }) => <ul className="list-disc ml-4 mb-2" {...props} />,
              ol: ({ node, ...props }) => <ol className="list-decimal ml-4 mb-2" {...props} />,
              li: ({ node, ...props }) => <li className="mb-1" {...props} />,
              h1: ({ node, ...props }) => <h1 className="text-lg font-bold mb-2" {...props} />,
              h2: ({ node, ...props }) => <h2 className="text-md font-bold mb-2" {...props} />,
              h3: ({ node, ...props }) => <h3 className="text-sm font-bold mb-1" {...props} />,
              code: ({ node, inline, ...props }) => 
                inline ? 
                  <code className="bg-gray-100 px-1 rounded text-xs font-mono" {...props} /> :
                  <code className="block bg-gray-100 p-2 rounded text-xs font-mono my-2 overflow-x-auto" {...props} />,
              blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-gray-200 pl-4 italic my-2" {...props} />
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
