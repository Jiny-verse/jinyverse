'use client';

import { useLanguage } from 'common/utils';
import { useLandingContext } from '../_hooks/useLandingContext';

export function LandingHeader() {
  const { t } = useLanguage();
  const { isDirty, isSaving, saveAll, discard } = useLandingContext();

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
      <div className="flex items-center gap-2">
        <h1 className="text-xl font-bold">{t('admin.landing.title')}</h1>
        {isDirty && (
          <span
            className="w-2 h-2 rounded-full bg-orange-400 inline-block"
            title={t('admin.landing.unsaved')}
          />
        )}
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={!isDirty}
          onClick={discard}
          className="px-4 py-1.5 text-sm border border-border rounded hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {t('admin.landing.discard')}
        </button>
        <button
          type="button"
          disabled={!isDirty || isSaving}
          onClick={saveAll}
          className="px-4 py-1.5 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {isSaving ? '...' : t('admin.landing.save')}
        </button>
      </div>
    </header>
  );
}
