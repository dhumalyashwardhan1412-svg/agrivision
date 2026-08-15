import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Sprout, Cpu, ArrowRight } from 'lucide-react';

interface StartupAnimationProps {
  onComplete: () => void;
  durationMs?: number; // default 3200ms
}

export const StartupAnimation: React.FC<StartupAnimationProps> = ({
  onComplete,
  durationMs = 3200,
}) => {
  const [isVisible, setIsVisible] = useState<boolean>(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 600); // allow exit animation to complete smoothly
    }, durationMs);

    return () => clearTimeout(timer);
  }, [durationMs, onComplete]);

  const handleSkip = () => {
    setIsVisible(false);
    setTimeout(onComplete, 300);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="agrivision-startup-splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#02130c] text-white overflow-hidden select-none"
        >
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(16,185,129,0.18)_0%,rgba(6,78,59,0.08)_45%,rgba(2,19,12,0.98)_85%)] pointer-events-none" />

          {/* Futuristic Subtle Agricultural Neural Circuit Grid */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#064e3b12_1px,transparent_1px),linear-gradient(to_bottom,#064e3b12_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

          {/* Quick Skip Button */}
          <button
            onClick={handleSkip}
            className="absolute top-6 right-6 z-50 text-[11px] font-bold text-emerald-400/70 hover:text-emerald-300 bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-500/20 rounded-full px-3.5 py-1.5 backdrop-blur-md transition flex items-center gap-1 group"
          >
            <span>Skip</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </button>

          {/* Center Visual Core Animation */}
          <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-md w-full">
            {/* 1. Pulsing Concentric Neural Halos */}
            <div className="relative w-28 h-28 flex items-center justify-center mb-6">
              {/* Outer Pulse Wave */}
              <motion.div
                initial={{ scale: 0.4, opacity: 0 }}
                animate={{ scale: [0.8, 1.35, 1.15], opacity: [0, 0.7, 0.3] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute inset-0 rounded-full border border-emerald-400/40 bg-emerald-500/10 blur-[2px]"
              />

              {/* Inner AI Hexagonal Ring */}
              <motion.div
                initial={{ rotate: 0, scale: 0 }}
                animate={{ rotate: 360, scale: 1 }}
                transition={{ duration: 12, repeat: Infinity, ease: 'linear', scale: { duration: 0.8, ease: 'easeOut' } }}
                className="absolute inset-2 rounded-full border border-dashed border-emerald-400/50"
              />

              {/* Glowing Sprout / Leaf Core Icon */}
              <motion.div
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  type: 'spring',
                  stiffness: 260,
                  damping: 18,
                  delay: 0.2,
                }}
                className="relative w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 p-[1.5px] shadow-2xl shadow-emerald-500/40 flex items-center justify-center"
              >
                <div className="w-full h-full bg-[#032014] rounded-[14px] flex items-center justify-center relative overflow-hidden">
                  <motion.div
                    animate={{
                      scale: [1, 1.12, 1],
                    }}
                    transition={{
                      duration: 2.0,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  >
                    <Sprout className="w-8 h-8 text-emerald-400 drop-shadow-[0_0_12px_rgba(52,211,153,0.8)]" />
                  </motion.div>

                  {/* Sparkle Accent */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: [0, 1, 0], scale: [0, 1.2, 0] }}
                    transition={{ duration: 1.6, repeat: Infinity, delay: 0.8 }}
                    className="absolute top-1.5 right-1.5"
                  >
                    <Sparkles className="w-3 h-3 text-amber-300" />
                  </motion.div>
                </div>
              </motion.div>
            </div>

            {/* 2. AgriVision Brand Typography Reveal */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-1.5"
            >
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white flex items-center justify-center gap-2">
                <span>Agri</span>
                <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-200 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(52,211,153,0.4)]">
                  Vision
                </span>
              </h1>

              {/* Sub-badge */}
              <div className="flex items-center justify-center gap-1.5 text-[10px] uppercase font-extrabold tracking-[0.25em] text-emerald-400/90">
                <Cpu className="w-3 h-3 text-emerald-400" />
                <span>Smart Agriculture Intelligence</span>
              </div>
            </motion.div>

            {/* 3. Punchy Tagline with Sequential Word Animation */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.1, ease: 'easeOut' }}
              className="mt-5 flex items-center justify-center gap-2 text-xs sm:text-sm font-medium text-slate-300"
            >
              <span className="text-emerald-300 font-semibold">Grow Smarter.</span>
              <span className="text-slate-500">•</span>
              <span className="text-teal-300 font-semibold">Sell Better.</span>
              <span className="text-slate-500">•</span>
              <span className="text-amber-300 font-semibold">Earn More.</span>
            </motion.div>

            {/* 4. Elegant Glowing Progress Bar */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.6 }}
              className="w-44 h-1 bg-emerald-950/80 rounded-full mt-7 overflow-hidden p-[1px] border border-emerald-500/20"
            >
              <motion.div
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 2.2, delay: 0.6, ease: [0.65, 0, 0.35, 1] }}
                className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-300 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.8)]"
              />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
