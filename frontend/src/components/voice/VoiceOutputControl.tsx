import React from 'react';
import { Volume2, VolumeX, Pause, Play, Square } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext';

interface VoiceOutputControlProps {
  text: string;
  isSpeakingThis: boolean;
  isPaused: boolean;
  onSpeak: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  className?: string;
}

export const VoiceOutputControl: React.FC<VoiceOutputControlProps> = ({
  text,
  isSpeakingThis,
  isPaused,
  onSpeak,
  onPause,
  onResume,
  onStop,
  className = ''
}) => {
  const { t } = useLanguage();

  if (!isSpeakingThis) {
    return (
      <button
        type="button"
        onClick={onSpeak}
        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 transition-all active:scale-95 shadow-2xs ${className}`}
        title={t('agriGuide.listen', 'Listen to response')}
      >
        <Volume2 className="w-3.5 h-3.5 text-emerald-700" />
        <span>{t('agriGuide.listen', 'Listen')}</span>
      </button>
    );
  }

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-3 py-1 bg-slate-900 text-white rounded-xl text-[11px] font-bold border border-slate-700 shadow-md ${className}`}
    >
      {/* Wave animation */}
      <div className="flex items-center gap-0.5 px-1">
        {[0, 1, 2, 3].map((i) => (
          <motion.span
            key={i}
            className="w-1 bg-emerald-400 rounded-full"
            animate={
              isPaused
                ? { height: 4 }
                : {
                    height: [4, 12, 6, 14, 4],
                    transition: {
                      duration: 0.8,
                      repeat: Infinity,
                      delay: i * 0.15,
                      ease: 'easeInOut'
                    }
                  }
            }
          />
        ))}
      </div>

      <span className="text-emerald-300 text-[10px] uppercase font-extrabold mr-1">
        {isPaused ? t('agriGuide.pause', 'Paused') : t('agriGuide.speaking', 'Speaking')}
      </span>

      {/* Pause/Resume Toggle */}
      {isPaused ? (
        <button
          type="button"
          onClick={onResume}
          className="p-1 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition"
          title={t('agriGuide.resume', 'Resume')}
        >
          <Play className="w-3 h-3 fill-current" />
        </button>
      ) : (
        <button
          type="button"
          onClick={onPause}
          className="p-1 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition"
          title={t('agriGuide.pause', 'Pause')}
        >
          <Pause className="w-3 h-3 fill-current" />
        </button>
      )}

      {/* Stop Button */}
      <button
        type="button"
        onClick={onStop}
        className="p-1 text-rose-400 hover:text-rose-300 rounded-lg hover:bg-slate-800 transition"
        title={t('agriGuide.stop', 'Stop')}
      >
        <Square className="w-3 h-3 fill-current" />
      </button>
    </div>
  );
};
