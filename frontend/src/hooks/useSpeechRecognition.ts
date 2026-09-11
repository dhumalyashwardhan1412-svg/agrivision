import { useState, useEffect, useRef, useCallback } from 'react';

// SpeechRecognition type declarations for browsers
interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

export type VoiceInputState = 'IDLE' | 'LISTENING' | 'PROCESSING' | 'ERROR';

export interface UseSpeechRecognitionReturn {
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
  voiceState: VoiceInputState;
  errorMessage: string | null;
  isSupported: boolean;
  startListening: (langCode?: string) => void;
  stopListening: () => void;
  resetTranscript: () => void;
}

export const useSpeechRecognition = (
  onFinalTranscript?: (text: string) => void
): UseSpeechRecognitionReturn => {
  const [isListening, setIsListening] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [voiceState, setVoiceState] = useState<VoiceInputState>('IDLE');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);

  // Check browser support
  const isSupported = typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  // Language mapping
  const getSpeechLangCode = (lang: string = 'en'): string => {
    switch (lang.toLowerCase()) {
      case 'hi':
        return 'hi-IN';
      case 'mr':
        return 'mr-IN';
      case 'en':
      default:
        return 'en-IN';
    }
  };

  const startListening = useCallback(
    (langCode: string = 'en') => {
      setErrorMessage(null);
      setTranscript('');
      setInterimTranscript('');

      if (!isSupported) {
        setVoiceState('ERROR');
        setErrorMessage('Voice input is not supported in this browser. You can still type your question.');
        return;
      }

      try {
        const SpeechRecognitionConstructor =
          (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

        if (recognitionRef.current) {
          recognitionRef.current.abort();
        }

        const recognition = new SpeechRecognitionConstructor();
        recognitionRef.current = recognition;

        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = getSpeechLangCode(langCode);
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
          setIsListening(true);
          setVoiceState('LISTENING');
        };

        recognition.onresult = (event: SpeechRecognitionEvent) => {
          let currentInterim = '';
          let finalTrans = '';

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            const res = event.results[i];
            if (res.isFinal) {
              finalTrans += res[0].transcript;
            } else {
              currentInterim += res[0].transcript;
            }
          }

          if (currentInterim) {
            setInterimTranscript(currentInterim);
          }

          if (finalTrans) {
            setTranscript(finalTrans);
            setVoiceState('PROCESSING');
            if (onFinalTranscript) {
              onFinalTranscript(finalTrans);
            }
          }
        };

        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
          setIsListening(false);
          setVoiceState('ERROR');

          switch (event.error) {
            case 'not-allowed':
              setErrorMessage('Microphone permission is required for voice input.');
              break;
            case 'no-speech':
              setErrorMessage('No speech detected. Please try again.');
              break;
            case 'audio-capture':
              setErrorMessage('No microphone was found on this device.');
              break;
            case 'network':
              setErrorMessage('Network error occurred during speech recognition.');
              break;
            default:
              setErrorMessage('Could not understand speech. Please try again.');
              break;
          }
        };

        recognition.onend = () => {
          setIsListening(false);
          setVoiceState((prev) => (prev === 'ERROR' ? 'ERROR' : 'IDLE'));
        };

        recognition.start();
      } catch (err: any) {
        setIsListening(false);
        setVoiceState('ERROR');
        setErrorMessage('Failed to start microphone. Please try again.');
      }
    },
    [isSupported, onFinalTranscript]
  );

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // ignore
      }
    }
    setIsListening(false);
    setVoiceState('IDLE');
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
    setErrorMessage(null);
    setVoiceState('IDLE');
  }, []);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          // ignore
        }
      }
    };
  }, []);

  return {
    isListening,
    transcript,
    interimTranscript,
    voiceState,
    errorMessage,
    isSupported,
    startListening,
    stopListening,
    resetTranscript
  };
};
