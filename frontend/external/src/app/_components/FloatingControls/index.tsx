'use client';

import { useEffect, useRef, useState } from 'react';
import { useTheme } from 'next-themes';
import { useLanguage } from 'common/utils';
import type { Locale } from 'common/utils';

const LANGUAGE_LABELS: Record<Locale, string> = {
  ko: 'KO',
  en: 'EN',
  ja: 'JA',
};

function CircleThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="w-10 h-10" />;

  const isDark = theme === 'dark';
  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={isDark ? '라이트 모드로 전환' : '다크 모드로 전환'}
      className="w-10 h-10 flex items-center justify-center rounded-full bg-background border border-border shadow-md text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
    >
      {isDark ? (
        <svg viewBox="0 0 24 24" width={18} height={18} fill="currentColor" aria-hidden>
          <path d="M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10zm0 2a7 7 0 1 1 0-14 7 7 0 0 1 0 14zM11 1h2v3h-2V1zm0 19h2v3h-2v-3zM3.515 4.929l1.414-1.414L7.05 5.636 5.636 7.05 3.515 4.93zM16.95 18.364l1.414-1.414 2.121 2.121-1.414 1.414-2.121-2.121zm2.121-14.85 1.414 1.415-2.121 2.121-1.414-1.414 2.121-2.121zM5.636 16.95l1.414 1.414-2.121 2.121-1.414-1.414 2.121-2.121zM23 11v2h-3v-2h3zM4 11v2H1v-2h3z" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" width={18} height={18} fill="currentColor" aria-hidden>
          <path d="M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 0 1-4.4 2.26 5.403 5.403 0 0 1-3.14-9.8c-.44-.06-.9-.1-1.36-.1z" />
        </svg>
      )}
    </button>
  );
}

function CircleLanguageToggle() {
  const { language, supportedLanguages, switchLanguage } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="언어 선택"
        className="w-10 h-10 flex items-center justify-center rounded-full bg-background border border-border shadow-md text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors text-xs font-bold"
      >
        {LANGUAGE_LABELS[language]}
      </button>

      {open && (
        <div className="absolute bottom-full left-0 mb-2 min-w-[80px] rounded-lg border border-border bg-background shadow-lg overflow-hidden">
          {supportedLanguages.map((lang) => (
            <button
              key={lang}
              type="button"
              onClick={() => { switchLanguage(lang); setOpen(false); }}
              className={`w-full px-3 py-2 text-left text-xs transition-colors ${
                lang === language
                  ? 'font-bold text-foreground bg-muted'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              {lang.toUpperCase()}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function FloatingControls() {
  return (
    <div className="fixed bottom-6 left-6 z-40 flex flex-col gap-3">
      <CircleLanguageToggle />
      <CircleThemeToggle />
    </div>
  );
}
