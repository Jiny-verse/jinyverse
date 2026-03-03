'use client';

import { useLanguage } from 'common/utils';
import { useLandingContext } from '../_hooks/useLandingContext';
import { SectionFormPanel } from './SectionFormPanel';
import { CtaFormPanel } from './CtaFormPanel';

export function RightPanel() {
  const { t } = useLanguage();
  const { selectedSection, selectedCtaId } = useLandingContext();

  if (!selectedSection) {
    return (
      <aside className="w-80 shrink-0 border-l border-border overflow-y-auto flex items-center justify-center text-muted-foreground text-sm p-4 text-center">
        {t('admin.landing.selectSection')}
      </aside>
    );
  }

  return (
    <aside className="w-80 shrink-0 border-l border-border overflow-y-auto">
      <div className="px-4 py-3 border-b border-border">
        <h3 className="text-sm font-semibold truncate">
          {selectedCtaId
            ? `CTA — ${selectedSection.ctas.find((c) => c.id === selectedCtaId)?.label || selectedCtaId.slice(0, 8)}`
            : selectedSection.type}
        </h3>
      </div>
      {selectedCtaId ? <CtaFormPanel /> : <SectionFormPanel />}
    </aside>
  );
}
