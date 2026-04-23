import React, { useState, useRef, useEffect } from "react";
import ChatMessage from "../chat/ChatMessage";
import ChatInput from "../chat/ChatInput";
import { get_ai_response } from "../../../API/ai.api";
import toast from "react-hot-toast";

const AIChefPage = () => {
  const [messages, setMessages] = useState([
    {
      role: "model",
      text: "Hello! I'm your AI Chef. How can I help you today? I can suggest recipes based on ingredients you have, explain cooking techniques, or help you plan a meal!",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const scrollContainerRef = useRef(null);

  const scrollToBottom = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (text) => {
    const userMessage = { role: "user", text };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // We send the current message and the history (excluding the first greeting)
      const history = messages.slice(1); 
      const responseText = await get_ai_response(text, history);
      
      const aiMessage = { role: "model", text: responseText };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      toast.error("The AI Chef is taking a break. Please try again in a moment.");
      console.error("AI Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 flex flex-col h-[calc(100vh-120px)]">
      <div className="text-center mb-8 shrink-0">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2 flex items-center justify-center gap-3">
          <span className="text-4xl">👨‍🍳</span> AI Chef
        </h1>
        <p className="text-gray-600">Your personal culinary assistant, ready to help 24/7.</p>
      </div>

      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto pr-2 custom-scrollbar mb-6 bg-gray-50/50 rounded-2xl p-6 border border-gray-100"
      >
        {messages.map((msg, index) => (
          <ChatMessage key={index} message={msg} />
        ))}
        {isLoading && (
          <div className="flex justify-start mb-4">
            <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-gray-100 shadow-sm flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce"></div>
              <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:0.2s]"></div>
              <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:0.4s]"></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="shrink-0">
        <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
        <p className="text-[10px] text-gray-400 mt-3 text-center">
          Our AI Chef can make mistakes. Always double-check cooking temperatures and ingredient safety.
        </p>
      </div>
    </div>
  );
};

export default AIChefPage;
