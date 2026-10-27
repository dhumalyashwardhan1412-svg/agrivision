import React from 'react';
import { motion } from 'framer-motion';
import farmlandBg from '../../assets/login-farmland-bg.jpg';

export const AuthBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none select-none z-0">
      {/* High-Resolution Farmland Background with slow ambient breath */}
      <motion.div
        initial={{ scale: 1.06, opacity: 0 }}
        animate={{ scale: 1.0, opacity: 1 }}
        transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${farmlandBg})`,
          filter: 'brightness(0.92) contrast(1.04)',
        }}
      />

      {/* Primary Cinematic Dark & Emerald Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-tr from-[#0a1b0d]/90 via-[#0e2712]/60 to-[#07170a]/80 backdrop-blur-[1px]" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />

      {/* Atmospheric Soft Light Radiance */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-emerald-500/20 blur-3xl" />
      <div className="absolute -bottom-32 -right-32 w-[32rem] h-[32rem] rounded-full bg-lime-400/15 blur-3xl" />

      {/* Micro-floating ambient light particles */}
      <motion.div
        animate={{
          y: [-10, 10, -10],
          opacity: [0.2, 0.5, 0.2],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/4 left-1/5 w-2 h-2 rounded-full bg-[#C7FF00]/40 blur-xs"
      />
      <motion.div
        animate={{
          y: [10, -12, 10],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        className="absolute bottom-1/3 left-1/3 w-3 h-3 rounded-full bg-emerald-300/30 blur-xs"
      />
      <motion.div
        animate={{
          y: [-15, 12, -15],
          opacity: [0.2, 0.5, 0.2],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        className="absolute top-1/3 right-1/4 w-2 h-2 rounded-full bg-[#C7FF00]/30 blur-xs"
      />
    </div>
  );
};
