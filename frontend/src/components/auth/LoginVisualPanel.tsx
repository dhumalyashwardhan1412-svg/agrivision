import React from 'react';
import { motion } from 'framer-motion';
import { Sprout, ShieldCheck, Sparkles, TrendingUp, Handshake } from 'lucide-react';

export const LoginVisualPanel: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -35 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      className="relative w-full lg:w-[48%] min-h-[480px] lg:min-h-[540px] flex flex-col justify-between p-7 sm:p-9 lg:p-11 rounded-[28px] sm:rounded-[36px] overflow-hidden border border-white/25 shadow-2xl backdrop-blur-md bg-gradient-to-b from-white/12 via-black/20 to-black/55 text-white"
    >
      {/* Decorative Outer White Frame Inner Glow */}
      <div className="absolute inset-0 rounded-[28px] sm:rounded-[36px] pointer-events-none ring-1 ring-inset ring-white/20" />
      <div className="absolute -top-24 -left-24 w-72 h-72 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none" />

      {/* Top Branding & Social Proof Section */}
      <div className="relative z-10 space-y-6">
        {/* Brand Mark */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: 'easeOut' }}
          className="flex items-center gap-3"
        >
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#163300] via-[#2F6B1B] to-[#65A30D] border border-lime-300/40 flex items-center justify-center text-white shadow-lg shadow-black/20">
            <Sprout className="w-6 h-6 text-[#C7FF00]" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-1.5">
              Agri<span className="text-[#C7FF00]">Vision</span>
            </div>
            <div className="text-[10px] tracking-widest font-extrabold uppercase text-[#C7FF00]/90">
              SMART FARMING PLATFORM
            </div>
          </div>
        </motion.div>

        {/* User Trust & Social Proof Avatars */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3, ease: 'easeOut' }}
          className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-black/30 backdrop-blur-md border border-white/15 shadow-sm"
        >
          {/* 3 Circular User Avatars with Stagger */}
          <div className="flex -space-x-2.5 overflow-hidden">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.45 }}
              className="inline-block h-8 w-8 rounded-full ring-2 ring-emerald-500 bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-xs font-bold text-white shadow-xs"
              title="Verified Farmer"
            >
              🌾
            </motion.div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.55 }}
              className="inline-block h-8 w-8 rounded-full ring-2 ring-lime-400 bg-gradient-to-tr from-emerald-700 to-teal-500 flex items-center justify-center text-xs font-bold text-white shadow-xs"
              title="Verified Buyer"
            >
              🏢
            </motion.div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.65 }}
              className="inline-block h-8 w-8 rounded-full ring-2 ring-emerald-300 bg-gradient-to-tr from-lime-600 to-emerald-800 flex items-center justify-center text-xs font-bold text-white shadow-xs"
              title="Agri-Input Dealer"
            >
              🚜
            </motion.div>
          </div>
          <div className="text-xs font-semibold text-white/90 tracking-wide flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#C7FF00] animate-pulse" />
            Trusted by Farmers, Buyers & Dealers
          </div>
        </motion.div>
      </div>

      {/* Middle Decorative Badge Pill */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="my-auto hidden sm:flex items-center gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm max-w-sm"
      >
        <div className="w-9 h-9 rounded-xl bg-lime-400/20 border border-lime-300/30 flex items-center justify-center text-[#C7FF00]">
          <TrendingUp className="w-5 h-5" />
        </div>
        <div className="text-xs text-white/85 leading-snug">
          <span className="font-bold text-white">Direct Market Disintermediation</span>
          <br />
          Fair farmgate prices & verified B2B negotiations
        </div>
      </motion.div>

      {/* Bottom Main Headline & Slogan Section */}
      <div className="relative z-10 pt-6 space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-1"
        >
          <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-black tracking-tight leading-[1.06] text-white">
            Grow Smarter.
            <br />
            Sell Better.
            <br />
            <span className="text-[#C7FF00] drop-shadow-[0_2px_12px_rgba(199,255,0,0.35)]">
              Earn More.
            </span>
          </h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.65, ease: 'easeOut' }}
          className="text-sm sm:text-base text-white/85 max-w-md font-medium leading-relaxed"
        >
          Smart farming, better markets and stronger connections — all in one platform.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="pt-2 border-t border-white/15 flex items-center justify-between text-xs font-semibold text-white/60 tracking-wider uppercase"
        >
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#C7FF00]" />
            From Soil to Sale
          </span>
          <span className="text-white/40">Powered by AgriVision</span>
        </motion.div>
      </div>
    </motion.div>
  );
};
