import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  X,
  Sparkles,
  User as UserIcon,
  RefreshCw,
  MessageSquare,
  Volume2,
  AlertCircle,
  Mic
} from 'lucide-react';
import { Button } from '../ui/Button';
import { aiApi } from '../../services/aiApi';
import { AIChatMessage } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import { useSpeechSynthesis } from '../../hooks/useSpeechSynthesis';
import { VoiceInputButton } from '../voice/VoiceInputButton';
import { VoiceOutputControl } from '../voice/VoiceOutputControl';
import { LanguageSelector } from '../common/LanguageSelector';

interface AgriGuideDrawerProps {
  farmId?: number;
}

export const AgriGuideDrawer: React.FC<AgriGuideDrawerProps> = ({ farmId }) => {
  const { language, t } = useLanguage();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Voice Output hook
  const {
    isSpeaking,
    isPaused,
    currentSpeakingText,
    speak,
    pause,
    resume,
    stop
  } = useSpeechSynthesis();

  // Voice Input hook
  const {
    isListening,
    transcript,
    interimTranscript,
    voiceState,
    errorMessage: voiceError,
    startListening,
    stopListening,
    resetTranscript
  } = useSpeechRecognition((finalText) => {
    // When final speech is recognized, populate input and automatically send
    if (finalText && finalText.trim()) {
      handleSend(finalText.trim());
    }
  });

  const [messages, setMessages] = useState<AIChatMessage[]>([
    {
      id: '1',
      sender: 'assistant',
      text: t(
        'agriGuide.welcome',
        'Namaste! I am your AgriVision AI Agronomist. How can I help you today? You can ask about soil nutrition (NPK), disease remedies, crop rotation, or market price trends.'
      ),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggested_actions: [
        t('agriGuide.chips.tomato', 'Tomato Disease Remedies'),
        t('agriGuide.chips.npk', 'How to Balance Soil NPK?'),
        t('agriGuide.chips.mandi', 'Check Today Mandi Trends'),
        t('agriGuide.chips.organic', 'Organic Pest Sprays')
      ],
      source: 'AgriVision Agricultural Intelligence'
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Update initial welcome message when language switches
  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].id === '1') {
        return [
          {
            id: '1',
            sender: 'assistant',
            text: t(
              'agriGuide.welcome',
              'Namaste! I am your AgriVision AI Agronomist. How can I help you today? You can ask about soil nutrition (NPK), disease remedies, crop rotation, or market price trends.'
            ),
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            suggested_actions: [
              t('agriGuide.chips.tomato', 'Tomato Disease Remedies'),
              t('agriGuide.chips.npk', 'How to Balance Soil NPK?'),
              t('agriGuide.chips.mandi', 'Check Today Mandi Trends'),
              t('agriGuide.chips.organic', 'Organic Pest Sprays')
            ],
            source: 'AgriVision Agricultural Intelligence'
          }
        ];
      }
      return prev;
    });
  }, [language]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, interimTranscript]);

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || input.trim();
    if (!textToSend || isLoading) return;

    // Stop listening if active
    if (isListening) {
      stopListening();
    }
    resetTranscript();

    const userMsg: AIChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await aiApi.chat(textToSend, farmId, undefined, language);
      const assistantMsg: AIChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: res.response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggested_actions: res.suggested_actions,
        source: res.source
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error('Chat error', err);
      const errorMsg: AIChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: t('common.error', 'I am having trouble connecting to the advisory server. Please try again shortly.'),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMicToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      // Stop speech synthesis if speaking
      stop();
      startListening(language);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 bg-gradient-to-r from-agri-700 to-emerald-600 text-white font-bold px-4 py-3 rounded-full shadow-2xl hover:scale-105 hover:shadow-agri-700/40 transition-all duration-300 border border-white/20"
      >
        <Bot className="w-5 h-5 text-amber-300 animate-bounce" />
        <span className="text-sm">{t('agriGuide.title', 'Ask AgriGuide AI')}</span>
      </button>

      {/* Drawer Overlay & Panel */}
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
            onClick={() => {
              stop();
              stopListening();
              setIsOpen(false);
            }}
          />

          <div className="relative w-full max-w-md bg-white h-full shadow-2xl border-l border-slate-200 flex flex-col z-10 animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-slate-900 via-agri-950 to-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
                    {t('agriGuide.title', 'AgriGuide AI Assistant')}
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  </h3>
                  <p className="text-[11px] text-slate-300">{t('agriGuide.subtitle', 'Agronomy & Smart Farming Advisory')}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <LanguageSelector variant="dark" />
                <button
                  onClick={() => {
                    stop();
                    stopListening();
                    setIsOpen(false);
                  }}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Chat Message Stream */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
              {messages.map((m) => {
                const isUser = m.sender === 'user';
                const isThisSpeaking = isSpeaking && currentSpeakingText === m.text;

                return (
                  <div key={m.id} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                    <div className="flex items-start gap-2 max-w-[85%]">
                      {!isUser && (
                        <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-200">
                          <Bot className="w-4 h-4" />
                        </div>
                      )}
                      <div>
                        <div
                          className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-sm ${
                            isUser
                              ? 'bg-agri-700 text-white rounded-tr-none'
                              : 'bg-white text-slate-800 rounded-tl-none border border-slate-200/80'
                          }`}
                        >
                          <p className="whitespace-pre-line">{m.text}</p>
                        </div>

                        {/* Footer with Timestamp, Source, and Voice Output Control */}
                        <div className="flex items-center justify-between gap-2 mt-1.5 px-1">
                          <div className="flex items-center gap-2 text-[10px] text-slate-400">
                            <span>{m.timestamp}</span>
                            {m.source && <span>• {m.source}</span>}
                          </div>

                          {/* Text-to-Speech Output Button for Assistant Messages */}
                          {!isUser && (
                            <VoiceOutputControl
                              text={m.text}
                              isSpeakingThis={isThisSpeaking}
                              isPaused={isPaused}
                              onSpeak={() => speak(m.text, language)}
                              onPause={pause}
                              onResume={resume}
                              onStop={stop}
                            />
                          )}
                        </div>
                      </div>
                      {isUser && (
                        <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                          <UserIcon className="w-4 h-4" />
                        </div>
                      )}
                    </div>

                    {/* Suggested quick chips */}
                    {!isUser && m.suggested_actions && m.suggested_actions.length > 0 && (
                      <div className="mt-2.5 flex flex-wrap gap-1.5 pl-9">
                        {m.suggested_actions.map((chip, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSend(chip)}
                            className="text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-full hover:bg-emerald-100 transition shadow-2xs"
                          >
                            ⚡ {chip}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Interim voice listening indicator */}
              {isListening && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 space-y-1 animate-pulse pl-9">
                  <div className="flex items-center gap-2 font-bold">
                    <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping"></span>
                    <span>{t('agriGuide.listening', 'Listening to your speech...')}</span>
                  </div>
                  {interimTranscript && (
                    <p className="italic text-slate-700">"{interimTranscript}"</p>
                  )}
                </div>
              )}

              {/* Voice Error Notification */}
              {voiceError && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>{voiceError}</span>
                </div>
              )}

              {isLoading && (
                <div className="flex items-center gap-2 text-xs text-slate-500 pl-9">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-agri-700" />
                  <span>{t('agriGuide.analyzing', 'AgriGuide is analyzing agronomic database...')}</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar with Voice Input (Microphone) */}
            <div className="p-3.5 bg-white border-t border-slate-200 space-y-2">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-center gap-2"
              >
                {/* Voice Input Microphone Button */}
                <VoiceInputButton
                  isListening={isListening}
                  voiceState={voiceState}
                  onStart={handleMicToggle}
                  onStop={handleMicToggle}
                  size="md"
                  disabled={isLoading}
                />

                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={t('agriGuide.askPlaceholder', 'Ask in English, Hindi, or Marathi...')}
                  className="flex-1 bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-agri-600/30 focus:border-agri-600"
                />

                <Button
                  type="submit"
                  size="sm"
                  variant="primary"
                  icon={Send}
                  disabled={!input.trim() || isLoading}
                >
                  {t('agriGuide.send', 'Send')}
                </Button>
              </form>

              <div className="flex items-center justify-between text-[10px] text-slate-400 px-1">
                <span>🎤 {t('agriGuide.tapToSpeak', 'Tap microphone to speak')}</span>
                <span>🔊 {t('agriGuide.listen', 'Listen to answers')}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
