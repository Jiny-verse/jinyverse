'use client';

import { useState } from 'react';
import { ConfirmDialog } from 'common/ui';
import { useLanguage } from 'common/utils';
import type { LandingCta } from 'common/schemas';
import { useLandingContext } from '../_hooks/useLandingContext';

export function CtaPanel() {
  const { t } = useLanguage();
  const domain = useLandingContext();
  const { selectedSection, ctaDomain } = domain;
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  if (!selectedSection) {
    return (
      <div className="p-4 text-muted-foreground text-sm">
        {t('admin.landing.cta.noSection')}
      </div>
    );
  }

  const ctas = selectedSection.ctas;

  const handleDeleteConfirm = async () => {
    if (!pendingDeleteId) return;
    await ctaDomain.crud.delete(pendingDeleteId);
    setPendingDeleteId(null);
  };

  return (
    <div className="flex flex-col h-full">
      <ConfirmDialog
        isOpen={pendingDeleteId !== null}
        message={t('message.confirmDelete')}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setPendingDeleteId(null)}
      />
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h3 className="font-semibold text-sm text-foreground">
          {t('admin.landing.cta.title')} — {selectedSection.title || selectedSection.type}
        </h3>
        <button
          type="button"
          onClick={ctaDomain.dialogs.create.onOpen}
          className="text-xs px-3 py-1.5 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
        >
          {t('admin.landing.cta.create')}
        </button>
      </div>
      <div className="flex-1 overflow-auto">
        {ctas.length === 0 ? (
          <p className="p-4 text-sm text-muted-foreground">{t('common.noData')}</p>
        ) : (
          <ul className="divide-y divide-border">
            {ctas.map((cta: LandingCta) => (
              <li key={cta.id} className="px-4 py-3 flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate text-foreground">
                    [{cta.type}] {cta.label || cta.href}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{cta.href}</p>
                </div>
                <div className="flex items-center gap-2 ml-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => ctaDomain.dialogs.update.onOpen(cta)}
                    className="text-xs px-2 py-1 border border-border rounded hover:bg-muted transition-colors"
                  >
                    {t('ui.button.edit')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPendingDeleteId(cta.id)}
                    className="text-xs px-2 py-1 border border-destructive/40 text-destructive rounded hover:bg-destructive/10 transition-colors"
                  >
                    {t('ui.button.delete')}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
