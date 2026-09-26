import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Sparkles, Star, ShoppingBag, Bot } from 'lucide-react';
import { COOKIES } from '../data/cookies';
import { useCart } from '../context/CartContext';

const QUICK_PROMPTS = [
  'What is your best seller?',
  'Best cookie for dark espresso?',
  'Tell me about Midnight Noir',
  'Which cookie has caramel?',
];

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: 'hello! I am your Coral Cookie Sommelier. Tell me your taste preference, and I will recommend your perfect artisanal match.',
      recommendedCookie: null,
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const { addToCart } = useCart();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      inputRef.current?.focus();
    }
  }, [isOpen, messages, isTyping]);

  const generateBotReply = (query) => {
    const q = query.toLowerCase();

    if (q.includes('espresso') || q.includes('coffee') || q.includes('bitter')) {
      const cookie = COOKIES.find((c) => c.name.includes('Sea Salt Obsidian')) || COOKIES[1];
      return {
        text: 'For dark espresso, nothing elevates the crema like our Sea Salt Obsidian. The crunchy Maldon sea salt crystals cut through the intense 70% dark chocolate.',
        recommendedCookie: cookie,
      };
    }

    if (q.includes('caramel') || q.includes('sweet') || q.includes('butter')) {
      const cookie = COOKIES.find((c) => c.name.includes('Amber Glow')) || COOKIES[2];
      return {
        text: 'If you adore caramelized decadence, Amber Glow is unmatched. Infused with slow-cooked artisanal burnt sugar and rich golden butter.',
        recommendedCookie: cookie,
      };
    }

    if (q.includes('midnight') || q.includes('noir') || q.includes('dark')) {
      const cookie = COOKIES.find((c) => c.name.includes('Midnight Noir')) || COOKIES[0];
      return {
        text: 'Midnight Noir is our signature dark masterpiece crafted with 74% Venezuelan single-origin cocoa and an aromatic hint of roasted espresso.',
        recommendedCookie: cookie,
      };
    }

    if (q.includes('nut') || q.includes('hazelnut')) {
      const cookie = COOKIES.find((c) => c.name.includes('Nutty Nirvana')) || COOKIES[5];
      return {
        text: 'Nutty Nirvana is loaded with slow-roasted Piedmont hazelnuts and smooth milk chocolate ganache for an irresistible buttery crunch.',
        recommendedCookie: cookie,
      };
    }

    if (q.includes('matcha') || q.includes('tea') || q.includes('green')) {
      const cookie = COOKIES.find((c) => c.name.includes('Matcha Zen')) || COOKIES[4];
      return {
        text: 'Matcha Zen combines ceremonial-grade Uji matcha with velvety white chocolate for an earthy, sublime harmony.',
        recommendedCookie: cookie,
      };
    }

    if (q.includes('best') || q.includes('popular') || q.includes('recommend') || q.includes('favorite')) {
      const cookie = COOKIES.find((c) => c.name.includes('Belgium Chocolate')) || COOKIES[6];
      return {
        text: 'Our crown jewel is the Belgium Chocolate cookie! Melted brown butter, gourmet Belgian chocolate chunks, and hand-harvested sea salt.',
        recommendedCookie: cookie,
      };
    }

    // Default response
    const randomCookie = COOKIES[Math.floor(Math.random() * COOKIES.length)];
    return {
      text: `Every batch is baked fresh each morning at 185°C. I highly suggest exploring "${randomCookie.name}" — ${randomCookie.description}`,
      recommendedCookie: randomCookie,
    };
  };

  const handleSend = (textToSend) => {
    const text = textToSend || inputValue.trim();
    if (!text) return;

    // Add user message
    setMessages((prev) => [...prev, { sender: 'user', text }]);
    setInputValue('');
    setIsTyping(true);

    setTimeout(() => {
      const reply = generateBotReply(text);
      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: reply.text,
          recommendedCookie: reply.recommendedCookie,
        },
      ]);
      setIsTyping(false);
    }, 700);
  };

  return (
    <>
      {/* ============================================================== */}
      {/* FLOATING TRIGGER BUTTON (CTA)                                 */}
      {/* ============================================================== */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-40">
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => setIsOpen(true)}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            className="group cursor-pointer flex items-center justify-center w-12 h-12 rounded-full bg-[#1c120f]/95 hover:bg-[#251814] backdrop-blur-xl border border-white/10 hover:border-caramel/60 shadow-2xl shadow-black/80 transition-all duration-300"
            aria-label="Open Coral Concierge Chatbot"
            title="Coral AI Sommelier"
          >
            {/* Animated Glow Aura */}
            <div className="absolute inset-0 rounded-full bg-caramel/15 blur-lg group-hover:bg-caramel/30 transition-all pointer-events-none" />

            {/* Icon with pulsing status dot */}
            <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-tr from-[#d48c45] to-[#f5e6d3] text-[#2b1b17] shadow-md shadow-caramel/30">
              <Sparkles className="w-4 h-4" />
              <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#d48c45] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#d48c45]" />
              </span>
            </div>
          </motion.button>
        </div>
      )}

      {/* ============================================================== */}
      {/* CHATBOT MODAL DRAWER                                           */}
      {/* ============================================================== */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.94 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-6 right-4 sm:bottom-8 sm:right-8 z-[9999] w-[calc(100vw-32px)] sm:w-[390px] h-[520px] max-h-[calc(100dvh-130px)] flex flex-col rounded-3xl bg-[#18100d]/95 backdrop-blur-2xl border border-white/10 shadow-[0_25px_60px_rgba(0,0,0,0.85),0_0_35px_rgba(212,140,69,0.2)] overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <div className="relative w-9 h-9 rounded-full bg-gradient-to-tr from-[#d48c45] to-[#f5e6d3] p-[1.5px] shadow-md shadow-caramel/20">
                  <div className="w-full h-full rounded-full bg-[#18100d] flex items-center justify-center text-[#d48c45]">
                    <Bot className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <h3 className="font-serif text-base text-cream font-medium tracking-wide flex items-center gap-2">
                    Coral Concierge
                    <span className="w-1.5 h-1.5 rounded-full bg-[#d48c45] animate-pulse" />
                  </h3>
                  <p className="text-[10px] font-sans tracking-wider text-cream/50 uppercase">
                    Haute Cookie Sommelier
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="cursor-pointer w-8 h-8 rounded-full border border-white/10 hover:border-caramel/50 flex items-center justify-center text-cream/60 hover:text-cream transition-colors"
                aria-label="Close chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Chat Messages Body */}
            <div
              className="flex-1 overflow-y-auto p-4 space-y-3.5 no-scrollbar"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-3.5 text-xs sm:text-[13px] leading-relaxed tracking-wide ${
                      msg.sender === 'user'
                        ? 'bg-caramel text-[#2b1b17] font-medium rounded-tr-xs shadow-md shadow-caramel/20'
                        : 'bg-white/5 border border-white/10 text-cream/90 rounded-tl-xs'
                    }`}
                  >
                    {msg.text}
                  </div>

                  {/* Recommended Cookie Card Bubble */}
                  {msg.recommendedCookie && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2.5 max-w-[85%] rounded-2xl bg-[#231511] border border-[#d48c45]/30 p-3 flex items-center gap-3 shadow-lg shadow-black/40"
                    >
                      <img
                        src={msg.recommendedCookie.image}
                        alt={msg.recommendedCookie.name}
                        className="w-12 h-12 object-contain drop-shadow-md"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-serif text-xs font-semibold text-cream truncate">
                          {msg.recommendedCookie.name}
                        </h4>
                        <div className="flex items-center gap-1 text-[10px] text-caramel mt-0.5">
                          <Star className="w-2.5 h-2.5 fill-caramel text-caramel" />
                          <span>{msg.recommendedCookie.rating}</span>
                          <span className="text-white/30">•</span>
                          <span className="text-cream font-medium">${msg.recommendedCookie.price.toFixed(2)}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => addToCart(msg.recommendedCookie)}
                        className="cursor-pointer shrink-0 p-2 rounded-xl bg-caramel hover:bg-[#e29d52] text-[#2b1b17] transition-colors"
                        title="Add to bag"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                      </button>
                    </motion.div>
                  )}
                </div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex items-center gap-1.5 p-3 rounded-2xl bg-white/5 border border-white/10 w-16">
                  <span className="w-1.5 h-1.5 rounded-full bg-caramel animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-caramel animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-caramel animate-bounce [animation-delay:0.4s]" />
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompts Chips */}
            <div
              className="px-4 py-2.5 border-t border-white/5 flex gap-1.5 overflow-x-auto no-scrollbar"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {QUICK_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(prompt)}
                  className="cursor-pointer text-[10px] tracking-wider whitespace-nowrap px-3 py-1.5 rounded-full bg-white/5 hover:bg-caramel hover:text-[#2b1b17] border border-white/10 text-cream/70 transition-all duration-200"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <div className="p-3 sm:p-4 border-t border-white/10 bg-black/20">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-center gap-2"
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask for pairings, flavors, cocoa %..."
                  className="flex-1 bg-white/5 border border-white/10 focus:border-caramel/60 rounded-full px-4 py-2.5 text-xs text-cream placeholder:text-cream/40 focus:outline-none transition-colors"
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim()}
                  className="cursor-pointer w-9 h-9 rounded-full bg-caramel hover:bg-[#e29d52] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center text-[#2b1b17] transition-all shadow-md shadow-caramel/20"
                >
                  <Send className="w-3.5 h-3.5 -translate-x-0.5" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
