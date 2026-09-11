import React from 'react';
import { Mic, MicOff, Loader2, AlertCircle, Volume2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { VoiceInputState } from '../../hooks/useSpeechRecognition';
import { useLanguage } from '../../context/LanguageContext';

interface VoiceInputButtonProps {
  isListening: boolean;
  voiceState: VoiceInputState;
  onStart: () => void;
  onStop: () => void;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
  disabled?: boolean;
}

export const VoiceInputButton: React.FC<VoiceInputButtonProps> = ({
  isListening,
  voiceState,
  onStart,
  onStop,
  size = 'md',
  showLabel = false,
  className = '',
  disabled = false
}) => {
  const { t } = useLanguage();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (disabled) return;

    if (isListening) {
      onStop();
    } else {
      onStart();
    }
  };

  const sizeClasses = {
    sm: 'p-2 text-xs',
    md: 'p-2.5 text-xs sm:text-sm',
    lg: 'p-3.5 text-sm sm:text-base'
  };

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  return (
    <div className={`relative inline-flex items-center gap-2 ${className}`}>
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled}
        aria-label={isListening ? t('voice.listening', 'Listening...') : t('voice.idle', 'Tap microphone to speak')}
        className={`relative flex items-center justify-center rounded-2xl font-bold transition-all duration-200 shadow-sm border ${
          sizeClasses[size]
        } ${
          isListening
            ? 'bg-rose-600 hover:bg-rose-700 text-white border-rose-500 shadow-rose-600/30'
            : voiceState === 'PROCESSING'
            ? 'bg-amber-600 hover:bg-amber-700 text-white border-amber-500'
            : voiceState === 'ERROR'
            ? 'bg-slate-100 hover:bg-slate-200 text-rose-600 border-rose-200'
            : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300/80 hover:border-emerald-400'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer active:scale-95'}`}
      >
        {/* Subtle Pulse Animation When Listening */}
        {isListening && (
          <motion.span
            className="absolute inset-0 rounded-2xl bg-rose-500"
            initial={{ opacity: 0.6, scale: 1 }}
            animate={{ opacity: 0, scale: 1.4 }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeOut' }}
          />
        )}

        <AnimatePresence mode="wait">
          {isListening ? (
            <motion.div
              key="listening"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="flex items-center gap-1.5 z-10"
            >
              <MicOff className={iconSizes[size]} />
              {showLabel && <span>{t('voice.listening', 'Listening...')}</span>}
            </motion.div>
          ) : voiceState === 'PROCESSING' ? (
            <motion.div
              key="processing"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="flex items-center gap-1.5 z-10"
            >
              <Loader2 className={`${iconSizes[size]} animate-spin`} />
              {showLabel && <span>{t('voice.processing', 'Processing...')}</span>}
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="flex items-center gap-1.5 z-10"
            >
              <Mic className={iconSizes[size]} />
              {showLabel && <span>{t('voice.speak', 'Speak')}</span>}
            </motion.div>
          )}
        </AnimatePresence>
      </button>
    </div>
  );
};
