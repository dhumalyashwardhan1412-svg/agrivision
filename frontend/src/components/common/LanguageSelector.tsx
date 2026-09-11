import React, { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { useLanguage, LanguageCode } from '../../context/LanguageContext';

interface LanguageSelectorProps {
  variant?: 'light' | 'dark' | 'compact';
  className?: string;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  variant = 'light',
  className = ''
}) => {
  const { language, setLanguage, languages } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentLang = languages.find((l) => l.code === language) || languages[0];

  const handleSelect = (code: LanguageCode) => {
    setLanguage(code);
    setIsOpen(false);
  };

  const isDark = variant === 'dark';

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 border ${
          isDark
            ? 'bg-slate-800/90 text-white border-slate-700 hover:bg-slate-700'
            : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-50 shadow-2xs'
        }`}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span className="text-sm">{currentLang.flag}</span>
        <span className="truncate">{currentLang.native}</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''} opacity-60`} />
      </button>

      {isOpen && (
        <div
          className={`absolute right-0 mt-1.5 w-44 rounded-2xl shadow-xl border p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 ${
            isDark
              ? 'bg-slate-900 border-slate-800 text-white shadow-black/40'
              : 'bg-white border-slate-200 text-slate-900 shadow-slate-300/50'
          }`}
        >
          <div className="px-2.5 py-1.5 text-[10px] font-extrabold uppercase tracking-wider opacity-50">
            Select Language
          </div>
          {languages.map((lang) => {
            const isSelected = lang.code === language;
            return (
              <button
                key={lang.code}
                onClick={() => handleSelect(lang.code)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition ${
                  isSelected
                    ? isDark
                      ? 'bg-emerald-600/30 text-emerald-400 font-extrabold'
                      : 'bg-emerald-50 text-emerald-800 font-extrabold'
                    : isDark
                    ? 'hover:bg-slate-800 text-slate-300'
                    : 'hover:bg-slate-100 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-sm">{lang.flag}</span>
                  <div className="text-left">
                    <div className="leading-none">{lang.native}</div>
                    <div className="text-[10px] opacity-60 font-normal mt-0.5">{lang.name}</div>
                  </div>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
