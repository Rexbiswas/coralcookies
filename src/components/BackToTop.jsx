import React, { useState } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useMotionValueEvent } from 'framer-motion';
import { ArrowUp } from 'lucide-react';

export default function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const { scrollY, scrollYProgress } = useScroll();

  // Show button after scrolling past 280px
  useMotionValueEvent(scrollY, 'change', (latest) => {
    setIsVisible(latest > 280);
  });

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  // SVG circular progress parameters
  const radius = 22;
  const circumference = 2 * Math.PI * radius; // ~138.23

  // When scrolling DOWN (0 -> 1): strokeDashoffset moves from circumference (empty) to 0 (full) -> increases
  // When scrolling UP (1 -> 0): strokeDashoffset moves from 0 back to circumference (empty) -> decreases
  const strokeDashoffset = useTransform(scrollYProgress, [0, 1], [circumference, 0]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          key="back-to-top"
          initial={{ opacity: 0, scale: 0.7, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.7, y: 20 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          onClick={scrollToTop}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          className="fixed bottom-22 right-6 sm:bottom-24 sm:right-8 z-40 group cursor-pointer flex items-center justify-center w-12 h-12 rounded-full bg-[#1b120f]/95 backdrop-blur-xl border border-white/10 hover:border-caramel/60 shadow-2xl shadow-black/80 transition-colors"
          aria-label="Back to top"
        >
          {/* Circular SVG Scroll Progress Ring */}
          <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 50 50">
            {/* Background track ring */}
            <circle
              cx="25"
              cy="25"
              r={radius}
              className="text-white/10"
              strokeWidth="2.5"
              stroke="currentColor"
              fill="transparent"
            />
            {/* Dynamic progress ring: increases scrolling down, decreases scrolling up */}
            <motion.circle
              cx="25"
              cy="25"
              r={radius}
              stroke="url(#caramelGradient)"
              strokeWidth="2.5"
              strokeDasharray={circumference}
              style={{ strokeDashoffset }}
              strokeLinecap="round"
              fill="transparent"
            />
            <defs>
              <linearGradient id="caramelGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#d48c45" />
                <stop offset="100%" stopColor="#f5e6d3" />
              </linearGradient>
            </defs>
          </svg>

          {/* Up Arrow Icon with hover float */}
          <ArrowUp className="w-4 h-4 text-cream group-hover:text-caramel group-hover:-translate-y-0.5 transition-all duration-300 relative z-10" />

          {/* Ambient Glow */}
          <div className="absolute inset-0 rounded-full bg-caramel/10 blur-md group-hover:bg-caramel/25 transition-all pointer-events-none" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
