'use client';

import { useState } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const WHATSAPP_NUMBER = '919052681374'; // India country code + number
const WHATSAPP_MESSAGE = 'Hello! I am interested in your luxury products. Can you help me?';

export function WhatsAppButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isTooltipVisible, setIsTooltipVisible] = useState(true);

  const openWhatsApp = () => {
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Chat Popup */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="w-72 bg-white rounded-lg shadow-2xl border border-border overflow-hidden"
          >
            {/* Header */}
            <div className="bg-[#25D366] px-4 py-3 flex items-center gap-3">
              <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
                <MessageCircle className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-white text-sm font-medium">Chat with Us</p>
                <p className="text-white/80 text-[11px]">We typically reply within minutes</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-4 space-y-3">
              <div className="bg-[#25D366]/10 rounded-lg p-3">
                <p className="text-sm text-foreground leading-relaxed">
                  👋 Hi there! Welcome to our luxury store. How can we help you today?
                </p>
                <p className="text-[10px] text-warm-gray mt-1.5">Admin • Online</p>
              </div>
              <button
                onClick={openWhatsApp}
                className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-lg px-4 py-2.5 text-sm font-medium flex items-center justify-center gap-2 transition-colors"
              >
                <Send className="h-4 w-4" />
                Start Chat on WhatsApp
              </button>
              <p className="text-[10px] text-warm-gray text-center">
                +91 90526 81374
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tooltip - auto hides after 5s */}
      <AnimatePresence>
        {isTooltipVisible && !isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            onAnimationComplete={() => {
              if (isTooltipVisible) {
                const timer = setTimeout(() => setIsTooltipVisible(false), 5000);
                return () => clearTimeout(timer);
              }
            }}
            className="bg-charcoal text-white text-xs px-3 py-2 rounded-lg shadow-lg whitespace-nowrap"
          >
            💬 Need help? Chat with us!
            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 w-0 h-0 border-t-4 border-b-4 border-l-4 border-transparent border-l-charcoal" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="w-14 h-14 bg-[#25D366] hover:bg-[#20bd5a] rounded-full flex items-center justify-center shadow-lg transition-colors group"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <X className="h-6 w-6 text-white" />
            </motion.div>
          ) : (
            <motion.div
              key="whatsapp"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <svg
                viewBox="0 0 32 32"
                className="h-7 w-7 text-white"
                fill="currentColor"
              >
                <path d="M16.004 0h-.008C7.174 0 0 7.176 0 16c0 3.5 1.132 6.744 3.054 9.378L1.054 31.456l6.256-1.96A15.918 15.918 0 0016.004 32C24.826 32 32 24.822 32 16S24.826 0 16.004 0zm9.314 22.61c-.39 1.1-1.932 2.014-3.17 2.28-.846.18-1.95.322-5.67-1.218-4.762-1.97-7.826-6.81-8.064-7.126-.23-.316-1.928-2.568-1.928-4.896s1.22-3.476 1.654-3.95c.39-.478.916-.6 1.222-.6.154 0 .292.008.418.014.39.016.588.04 1.046.812.39.656 1.422 3.47 1.548 3.722.128.18.23.39.048.628-.174.246-.262.398-.524.612-.262.218-.498.386-.72.618-.224.218-.476.454-.194.898.282.438 1.254 2.068 2.69 3.35 1.848 1.654 3.408 2.168 3.87 2.39.46.224.728.186 1.004-.114.282-.306.852-.994 1.08-1.336.224-.346.454-.286.764-.172.314.116 2.008.948 2.354 1.12.346.174.578.258.662.402.086.142.086.824-.304 1.926z" />
              </svg>
            </motion.div>
          )}
        </AnimatePresence>

        {!isOpen && (
          <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-white" />
          </span>
        )}
      </motion.button>
    </div>
  );
}
