import React, { useState } from 'react';
import { Bot, Send, User, X } from 'lucide-react';
import { sendChatMessage } from '../services/api';

export default function ChatDrawer({ isOpen, onClose, scanId }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Hello! I am your PhishGuard Security Assistant. Ask me anything about this scan assessment or offer details.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const response = await sendChatMessage(scanId, userMsg, messages);
      setMessages((prev) => [...prev, { role: 'assistant', text: response.reply }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: 'Apologies, I encountered an error communicating with Gemini. Please retry.' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-96 bg-[#0A0D14]/95 border-l border-cyan-500/30 backdrop-blur-xl z-50 flex flex-col shadow-2xl">
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Bot className="w-5 h-5 text-[#00F0FF]" />
          <span className="font-mono text-sm font-bold text-white">XAI Chat Assistant</span>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((m, idx) => (
          <div key={idx} className={`flex items-start space-x-2 ${m.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-xs ${
              m.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-cyan-500/20 text-[#00F0FF] border border-cyan-500/40'
            }`}>
              {m.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>
            <div className={`p-3 rounded-xl text-xs max-w-[80%] leading-relaxed ${
              m.role === 'user' 
                ? 'bg-indigo-600/30 border border-indigo-500/40 text-indigo-100' 
                : 'bg-slate-900 border border-slate-800 text-slate-200'
            }`}>
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-center space-x-2 text-xs text-slate-500 font-mono">
            <Bot className="w-4 h-4 animate-spin text-[#00F0FF]" />
            <span>Analyzing explanation...</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSend} className="p-4 border-t border-slate-800 flex items-center space-x-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Why is this flagged as scam?"
          className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-[#00F0FF]"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="p-2 bg-[#00F0FF] text-slate-950 rounded-lg disabled:opacity-40"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}