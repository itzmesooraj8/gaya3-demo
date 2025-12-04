import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, X, Brain, Globe, MapPin, Zap, Send, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { streamGeminiResponse } from '../services/geminiService';
import { ChatMessage, ChatMode } from '../types';

// --- THEME CONFIGURATION ---
const MODES = [
  { 
    id: 'standard' as ChatMode, 
    icon: Sparkles, 
    label: 'MUSE', 
    desc: 'Poetic & Aesthetic',
    color: 'text-purple-300', 
    bg: 'bg-purple-500/10', 
    border: 'border-purple-500/30',
    gradient: 'from-purple-500 to-pink-500' 
  },
  { 
    id: 'thinking' as ChatMode, 
    icon: Brain, 
    label: 'DEEP', 
    desc: 'Strategic Logic',
    color: 'text-indigo-300', 
    bg: 'bg-indigo-500/10', 
    border: 'border-indigo-500/30',
    gradient: 'from-indigo-500 to-blue-600'
  },
  { 
    id: 'search' as ChatMode, 
    icon: Globe, 
    label: 'WEB', 
    desc: 'Live Trends',
    color: 'text-cyan-300', 
    bg: 'bg-cyan-500/10', 
    border: 'border-cyan-500/30',
    gradient: 'from-cyan-400 to-teal-500'
  },
  { 
    id: 'maps' as ChatMode, 
    icon: MapPin, 
    label: 'MAPS', 
    desc: 'Spatial Discovery',
    color: 'text-emerald-300', 
    bg: 'bg-emerald-500/10', 
    border: 'border-emerald-500/30',
    gradient: 'from-emerald-400 to-green-600'
  },
  { 
    id: 'fast' as ChatMode, 
    icon: Zap, 
    label: 'FAST', 
    desc: 'Instant Utility',
    color: 'text-amber-300', 
    bg: 'bg-amber-500/10', 
    border: 'border-amber-500/30',
    gradient: 'from-amber-400 to-orange-500'
  },
];

const GayaChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<ChatMode>('standard');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { 
      id: '0', 
      role: 'model', 
      text: 'I am Gaya. The Muse. How shall we curate your reality today?', 
      timestamp: Date.now() 
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Active Theme
  const activeTheme = MODES.find(m => m.id === mode) || MODES[0];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;

    // 1. Add User Message
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: Date.now()
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    const history = messages.map(m => `${m.role}: ${m.text}`);

    // 2. Add Placeholder Model Message
    const modelMsgId = (Date.now() + 1).toString();
    const modelMsg: ChatMessage = {
      id: modelMsgId,
      role: 'model',
      text: '',
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, modelMsg]);

    try {
      // 3. Stream Response
      const stream = streamGeminiResponse(userMsg.text, history, mode);
      
      let hasReceivedFirstToken = false;

      for await (const chunk of stream) {
        if (!hasReceivedFirstToken) {
          setIsTyping(false); // Stop typing animation as soon as data arrives
          hasReceivedFirstToken = true;
        }

        setMessages(prev => prev.map(msg => {
          if (msg.id === modelMsgId) {
            return {
              ...msg,
              text: msg.text + chunk.text,
              groundingMetadata: chunk.groundingMetadata || msg.groundingMetadata
            };
          }
          return msg;
        }));
      }
    } catch (error) {
      console.error("Streaming error", error);
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* --- TRIGGER BUTTON --- */}
      <div className="fixed bottom-8 right-8 z-50">
        <AnimatePresence>
          {!isOpen && (
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              whileHover={{ scale: 1.05 }}
              onClick={() => setIsOpen(true)}
              className="group relative flex items-center gap-2 px-6 py-4 bg-white/5 backdrop-blur-xl border border-white/20 rounded-full shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:bg-white/10 transition-all overflow-hidden"
            >
              <div className={`absolute inset-0 bg-gradient-to-tr ${activeTheme.gradient} opacity-20`} />
              <Sparkles className={activeTheme.color} size={20} />
              <span className="font-display text-sm tracking-widest text-white relative z-10">ASK GAYA</span>
              
              {/* Pulse Effect */}
              <div className={`absolute inset-0 rounded-full border ${activeTheme.border} animate-ping opacity-20`} />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* --- MAIN CHAT WINDOW --- */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.95 }}
            className={`fixed bottom-8 right-8 z-50 w-96 h-[650px] flex flex-col bg-[#050505]/95 backdrop-blur-3xl border ${activeTheme.border} rounded-[2rem] shadow-2xl overflow-hidden transition-colors duration-500`}
          >
            {/* Header */}
            <div className={`p-5 border-b border-white/5 flex justify-between items-center relative overflow-hidden transition-colors duration-500`}>
              <div className={`absolute inset-0 bg-gradient-to-r ${activeTheme.gradient} opacity-10`} />
              
              <div className="flex items-center gap-4 relative z-10">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${activeTheme.gradient} flex items-center justify-center shadow-lg`}>
                  <activeTheme.icon size={18} className="text-white" />
                </div>
                <div>
                  <h3 className="font-display text-base font-bold tracking-wide">GAYA</h3>
                  <p className={`text-xs uppercase tracking-wider font-medium opacity-70 ${activeTheme.color}`}>{activeTheme.desc}</p>
                </div>
              </div>
              
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors relative z-10"
              >
                <X size={18} />
              </button>
            </div>

            {/* Chat Area */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-6">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed relative overflow-hidden ${
                      msg.role === 'user'
                        ? 'bg-white text-black rounded-tr-none'
                        : `bg-white/5 border border-white/10 text-gray-200 rounded-tl-none`
                    }`}
                  >
                    {/* Subtle gradient for model messages */}
                    {msg.role === 'model' && (
                       <div className={`absolute inset-0 bg-gradient-to-br ${activeTheme.gradient} opacity-5 pointer-events-none`} />
                    )}
                    <div className="relative z-10 whitespace-pre-wrap">{msg.text}</div>
                  </div>

                  {/* Grounding Chips */}
                  {msg.groundingMetadata?.groundingChunks && msg.groundingMetadata.groundingChunks.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2 max-w-[85%]">
                      {msg.groundingMetadata.groundingChunks.map((chunk, i) => {
                         const uri = chunk.web?.uri || chunk.maps?.uri;
                         const title = chunk.web?.title || chunk.maps?.title;
                         if(!uri || !title) return null;
                         
                         return (
                          <a 
                            key={i} 
                            href={uri} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className={`flex items-center gap-2 text-[10px] px-3 py-1.5 rounded-full border transition-all hover:brightness-110 ${
                              chunk.maps 
                                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' 
                                : 'bg-cyan-500/10 border-cyan-500/20 text-cyan-300'
                            }`}
                          >
                            {chunk.maps ? <MapPin size={10} /> : <Globe size={10} />}
                            <span className="truncate max-w-[150px]">{title}</span>
                            <ExternalLink size={10} />
                          </a>
                         );
                      })}
                    </div>
                  )}
                </motion.div>
              ))}
              
              {isTyping && (
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  className="flex items-center gap-3 pl-2"
                >
                  <div className={`text-xs font-display animate-pulse ${activeTheme.color}`}>
                    {mode === 'thinking' ? 'ANALYZING COMPLEXITY...' : 'MANIFESTING RESPONSE...'}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Mode Switcher & Input */}
            <div className="bg-black/40 backdrop-blur-md border-t border-white/5">
              
              {/* Mode Icons */}
              <div className="px-4 py-3 flex justify-between">
                {MODES.map((m) => {
                  const isActive = mode === m.id;
                  return (
                    <button
                      key={m.id}
                      onClick={() => setMode(m.id)}
                      className="group relative flex flex-col items-center gap-1.5"
                    >
                      <div className={`p-2.5 rounded-xl transition-all duration-300 ${
                        isActive 
                          ? `${m.bg} border ${m.border} scale-110 shadow-lg shadow-${m.color.split('-')[1]}-500/20` 
                          : 'bg-transparent border border-transparent hover:bg-white/5'
                      }`}>
                        <m.icon 
                          size={18} 
                          className={`transition-colors duration-300 ${isActive ? m.color : 'text-white/30 group-hover:text-white/70'}`} 
                        />
                      </div>
                      
                      {/* Tooltip on Hover */}
                      <span className={`absolute -top-8 text-[9px] uppercase tracking-widest bg-black border border-white/10 px-2 py-1 rounded transition-opacity duration-200 pointer-events-none ${isActive ? 'opacity-100' : 'opacity-0'}`}>
                        {m.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Input Area */}
              <div className="p-4 pt-0 pb-6">
                <div className={`relative flex items-center transition-all duration-300 group ${isTyping ? 'opacity-50 pointer-events-none' : ''}`}>
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder={`Ask ${activeTheme.label} about ${activeTheme.desc.toLowerCase()}...`}
                    className={`w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-5 pr-14 text-sm text-white focus:outline-none focus:border-white/20 transition-all placeholder:text-white/20 focus:bg-white/10`}
                  />
                  
                  <motion.button 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleSend}
                    disabled={!input.trim()}
                    className={`absolute right-2 p-2.5 rounded-xl text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all ${
                      input.trim() ? `bg-gradient-to-tr ${activeTheme.gradient}` : 'bg-white/10'
                    }`}
                  >
                    <Send size={16} fill={input.trim() ? "currentColor" : "none"} />
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default GayaChat;