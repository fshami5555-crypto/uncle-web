import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, User, Bot } from 'lucide-react';
import { chatWithNutritionist } from '../services/geminiService';

export const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'user' | 'model', text: string}[]>([
      { role: 'model', text: 'أهلاً بك! أنا مساعد Uncle Healthy الذكي. كيف يمكنني مساعدتك اليوم في اختيار وجبتك أو نصيحتك الغذائية؟' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const toggleOpen = () => setIsOpen(!isOpen);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
      if (!input.trim()) return;

      const userText = input;
      setInput('');
      setMessages(prev => [...prev, { role: 'user', text: userText }]);
      setLoading(true);

      const response = await chatWithNutritionist(messages, userText);
      
      setMessages(prev => [...prev, { role: 'model', text: response || 'عذراً، لم أستطع الإجابة.' }]);
      setLoading(false);
  };

  return (
    <div className="fixed bottom-20 right-4 md:bottom-8 md:right-8 z-[100] flex flex-col items-end print:hidden">
        {/* Chat Window */}
        {isOpen && (
            <div className="bg-white w-[90vw] md:w-96 h-[500px] rounded-2xl shadow-2xl mb-4 flex flex-col overflow-hidden animate-fade-in border border-uh-cream ring-1 ring-black/5">
                {/* Header */}
                <div className="bg-uh-dark p-4 flex justify-between items-center text-white">
                    <div className="flex items-center gap-2">
                        <div className="bg-uh-green p-1 rounded-full">
                            <Bot size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold text-sm">مساعد Uncle Healthy</h3>
                            <span className="text-[10px] text-green-400 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span> متصل
                            </span>
                        </div>
                    </div>
                    <button onClick={toggleOpen} className="hover:bg-white/10 p-1 rounded"><X size={20}/></button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}>
                            <div className={`max-w-[85%] p-3 text-sm rounded-2xl ${
                                msg.role === 'user' 
                                ? 'bg-uh-green text-white rounded-tr-none' 
                                : 'bg-white text-gray-800 border shadow-sm rounded-tl-none'
                            }`}>
                                {msg.text}
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div className="flex justify-end">
                            <div className="bg-white p-3 rounded-2xl rounded-tl-none border shadow-sm flex gap-1">
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></span>
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-3 bg-white border-t flex gap-2">
                    <input 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="اسألني عن الوجبات..."
                        className="flex-1 bg-gray-100 border-transparent focus:bg-white focus:border-uh-green rounded-xl px-4 py-2 text-sm outline-none transition"
                    />
                    <button 
                        onClick={handleSend}
                        disabled={loading || !input.trim()}
                        className="bg-uh-gold text-uh-dark p-2 rounded-xl hover:bg-yellow-500 disabled:opacity-50 transition"
                    >
                        <Send size={20} />
                    </button>
                </div>
            </div>
        )}

        {/* Toggle Button */}
        <button 
            onClick={toggleOpen}
            className="bg-uh-dark text-white p-4 rounded-full shadow-2xl hover:scale-105 transition-transform group flex items-center gap-2 border-2 border-uh-gold"
        >
            {isOpen ? <X size={24} /> : <MessageSquare size={24} className="text-uh-gold" />}
            {!isOpen && <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap pr-0 group-hover:pr-2 font-bold text-sm">محادثة</span>}
        </button>
    </div>
  );
};