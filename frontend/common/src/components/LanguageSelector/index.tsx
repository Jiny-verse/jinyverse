'use client';

import { useRef, useState, useEffect } from 'react';
import useLanguage from '../../utils/i18n/hooks/useLanguage';
import type { Locale } from '../../utils/i18n/types';

const LANGUAGE_LABELS: Record<Locale, string> = {
  ko: '한국어',
  en: 'English',
  ja: '日本語',
};

interface LanguageSelectorProps {
  direction?: 'up' | 'down';
}

export function LanguageSelector({ direction = 'down' }: LanguageSelectorProps) {
  const { language, supportedLanguages, switchLanguage } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) {
      document.addEventListener('click', close);
      return () => document.removeEventListener('click', close);
    }
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 border-0 bg-transparent px-2 py-1 text-xs text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <svg viewBox="0 0 24 24" width={16} height={16} fill="currentColor" aria-hidden>
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
        </svg>
        <span>{LANGUAGE_LABELS[language]}</span>
      </button>

      {open && (
        <ul
          role="listbox"
          className={`absolute left-0 z-50 min-w-[110px] list-none rounded bg-popover py-1 shadow-lg border border-border ${
            direction === 'up' ? 'bottom-full mb-1' : 'top-full mt-1'
          }`}
        >
          {supportedLanguages.map((lang) => (
            <li key={lang} role="option" aria-selected={lang === language} className="list-none">
              <button
                type="button"
                onClick={() => {
                  switchLanguage(lang);
                  setOpen(false);
                }}
                className={`w-full px-4 py-2 text-left text-sm transition-colors cursor-pointer border-0 bg-transparent ${
                  lang === language
                    ? 'font-medium text-foreground bg-accent'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                }`}
              >
                {LANGUAGE_LABELS[lang]}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
