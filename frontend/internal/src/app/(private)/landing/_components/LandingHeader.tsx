'use client';

import { useEffect } from 'react';
import { useLanguage } from 'common/utils';
import { useLandingContext } from '../_hooks/useLandingContext';

export function LandingHeader() {
  const { t } = useLanguage();
  const {
    isDirty,
    isSaving,
    saveAll,
    discard,
    viewportMode,
    setViewportMode,
    canUndo,
    canRedo,
    undo,
    redo,
  } = useLandingContext();

  // Keyboard shortcuts: Cmd+Z = undo, Cmd+Shift+Z = redo
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [undo, redo]);

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0 gap-4">
      <div className="flex items-center gap-2 shrink-0">
        <h1 className="text-xl font-bold">{t('admin.landing.title')}</h1>
        {isDirty && (
          <span
            className="w-2 h-2 rounded-full bg-orange-400 inline-block"
            title={t('admin.landing.unsaved')}
          />
        )}
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {/* Undo/Redo */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={!canUndo}
            onClick={undo}
            title={t('admin.landing.undo')}
            className="px-2 py-1.5 text-sm border border-border rounded hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            ↩
          </button>
          <button
            type="button"
            disabled={!canRedo}
            onClick={redo}
            title={t('admin.landing.redo')}
            className="px-2 py-1.5 text-sm border border-border rounded hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            ↪
          </button>
        </div>

        {/* Viewport toggle */}
        <div className="flex border border-border rounded overflow-hidden text-xs">
          <button
            type="button"
            onClick={() => setViewportMode('desktop')}
            className={`px-2 py-1.5 transition-colors ${
              viewportMode === 'desktop'
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-muted'
            }`}
          >
            🖥 {t('admin.landing.viewport.desktop')}
          </button>
          <button
            type="button"
            onClick={() => setViewportMode('mobile')}
            className={`px-2 py-1.5 border-l border-border transition-colors ${
              viewportMode === 'mobile'
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-muted'
            }`}
          >
            📱 {t('admin.landing.viewport.mobile')}
          </button>
        </div>

        {/* Save/Discard */}
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
