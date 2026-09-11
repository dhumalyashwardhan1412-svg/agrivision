import { useState, useEffect, useRef, useCallback } from 'react';

export interface UseSpeechSynthesisReturn {
  isSpeaking: boolean;
  isPaused: boolean;
  isSupported: boolean;
  currentSpeakingText: string | null;
  errorMessage: string | null;
  speak: (text: string, langCode?: string) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
}

export const useSpeechSynthesis = (): UseSpeechSynthesisReturn => {
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [currentSpeakingText, setCurrentSpeakingText] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Load available speech synthesis voices
  useEffect(() => {
    if (!isSupported) return;

    const updateVoices = () => {
      const available = window.speechSynthesis.getVoices();
      setVoices(available);
    };

    updateVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, [isSupported]);

  // Clean markdown for pleasant audio narration
  const cleanMarkdownForSpeech = (rawText: string): string => {
    return rawText
      .replace(/\*\*(.*?)\*\*/g, '$1') // remove bold
      .replace(/\*(.*?)\*/g, '$1')     // remove italic
      .replace(/#{1,6}\s+/g, '')       // remove headings
      .replace(/•|\*|-/g, ', ')        // bullet to pause
      .replace(/\[(.*?)\]\(.*?\)/g, '$1') // links
      .replace(/`{1,3}.*?`{1,3}/gs, '') // code blocks
      .trim();
  };

  const getBestVoice = (lang: string = 'en'): { voice: SpeechSynthesisVoice | null; langCode: string } => {
    const langLower = lang.toLowerCase();

    if (langLower.startsWith('hi')) {
      const hiVoice = voices.find((v) => v.lang === 'hi-IN' || v.lang.startsWith('hi'));
      if (hiVoice) return { voice: hiVoice, langCode: 'hi-IN' };
      return { voice: null, langCode: 'hi-IN' };
    }

    if (langLower.startsWith('mr')) {
      const mrVoice = voices.find((v) => v.lang === 'mr-IN' || v.lang.startsWith('mr'));
      if (mrVoice) return { voice: mrVoice, langCode: 'mr-IN' };
      // Fallback to Hindi voice for Devanagari script phonetics if Marathi is missing
      const hiFallback = voices.find((v) => v.lang === 'hi-IN' || v.lang.startsWith('hi'));
      if (hiFallback) return { voice: hiFallback, langCode: 'mr-IN' };
      return { voice: null, langCode: 'mr-IN' };
    }

    // Default English
    const enInVoice = voices.find((v) => v.lang === 'en-IN');
    if (enInVoice) return { voice: enInVoice, langCode: 'en-IN' };
    const anyEnVoice = voices.find((v) => v.lang.startsWith('en'));
    return { voice: anyEnVoice || null, langCode: 'en-IN' };
  };

  const speak = useCallback(
    (text: string, langCode: string = 'en') => {
      setErrorMessage(null);

      if (!isSupported) {
        setErrorMessage('Text-to-speech is not supported in this browser.');
        return;
      }

      // Stop any existing playback
      window.speechSynthesis.cancel();

      const cleanedText = cleanMarkdownForSpeech(text);
      if (!cleanedText) return;

      try {
        const utterance = new SpeechSynthesisUtterance(cleanedText);
        currentUtteranceRef.current = utterance;

        const { voice, langCode: selectedLang } = getBestVoice(langCode);
        utterance.lang = selectedLang;
        if (voice) {
          utterance.voice = voice;
        }

        utterance.rate = 0.95; // comfortable cadence
        utterance.pitch = 1.0;

        utterance.onstart = () => {
          setIsSpeaking(true);
          setIsPaused(false);
          setCurrentSpeakingText(text);
        };

        utterance.onend = () => {
          setIsSpeaking(false);
          setIsPaused(false);
          setCurrentSpeakingText(null);
        };

        utterance.onerror = (e) => {
          console.warn('SpeechSynthesis error:', e);
          setIsSpeaking(false);
          setIsPaused(false);
          setCurrentSpeakingText(null);
        };

        utterance.onpause = () => {
          setIsPaused(true);
        };

        utterance.onresume = () => {
          setIsPaused(false);
        };

        window.speechSynthesis.speak(utterance);
      } catch (err: any) {
        setIsSpeaking(false);
        setIsPaused(false);
        setErrorMessage('Failed to play audio response.');
      }
    },
    [isSupported, voices]
  );

  const pause = useCallback(() => {
    if (isSupported && isSpeaking && !isPaused) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  }, [isSupported, isSpeaking, isPaused]);

  const resume = useCallback(() => {
    if (isSupported && isSpeaking && isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    }
  }, [isSupported, isSpeaking, isPaused]);

  const stop = useCallback(() => {
    if (isSupported) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setIsPaused(false);
      setCurrentSpeakingText(null);
    }
  }, [isSupported]);

  useEffect(() => {
    return () => {
      if (isSupported) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isSupported]);

  return {
    isSpeaking,
    isPaused,
    isSupported,
    currentSpeakingText,
    errorMessage,
    speak,
    pause,
    resume,
    stop
  };
};
