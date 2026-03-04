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
    <aside className="w-80 shrink-0 border-l border-border flex flex-col overflow-hidden">
      {selectedCtaId ? <CtaFormPanel /> : <SectionFormPanel />}
    </aside>
  );
}
