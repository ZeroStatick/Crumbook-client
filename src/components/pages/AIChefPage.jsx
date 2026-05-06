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
    <div className="mx-auto flex h-[calc(100vh-140px)] max-w-5xl flex-col p-4 md:p-8">
      <div className="mb-10 shrink-0 text-center">
        <p className="mb-3 inline-flex rounded-full border border-amber-400/20 bg-amber-400/10 px-4 py-2 text-[10px] tracking-[0.32em] text-amber-200 uppercase">
          Culinary Intelligence
        </p>
        <h1 className="font-serif text-5xl font-black tracking-tight text-white flex items-center justify-center gap-4">
          <span className="text-4xl filter grayscale contrast-125 brightness-200 opacity-50">👨‍🍳</span> AI Chef
        </h1>
        <p className="mt-4 text-lg text-white/60">Your personal culinary assistant, ready to help 24/7.</p>
      </div>

      <div 
        ref={scrollContainerRef}
        className="custom-scrollbar mb-8 flex-1 overflow-y-auto rounded-[2rem] border border-white/10 bg-[#0f141d] p-8 shadow-2xl shadow-black/40 pr-4"
      >
        <div className="space-y-8">
          {messages.map((msg, index) => (
            <ChatMessage key={index} message={msg} />
          ))}
          {isLoading && (
            <div className="flex justify-start animate-in fade-in slide-in-from-left-2 duration-300">
              <div className="flex items-center gap-3 rounded-[1.25rem] rounded-tl-none border border-white/10 bg-[#0a0f16] p-5 shadow-lg">
                <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-amber-400"></div>
                <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-amber-400/60 [animation-delay:0.2s]"></div>
                <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-amber-400/30 [animation-delay:0.4s]"></div>
              </div>
            </div>
          )}
        </div>
        <div ref={messagesEndRef} />
      </div>

      <div className="shrink-0 max-w-3xl mx-auto w-full">
        <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
        <p className="mt-4 text-center text-[10px] font-black tracking-widest text-white/20 uppercase">
          AI generated content can be inaccurate. verify safety before cooking.
        </p>
      </div>
    </div>
  );
};

export default AIChefPage;
