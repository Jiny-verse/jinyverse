'use client';

import { useApiOptions } from '@/app/providers/ApiProvider';
import { useLanguage } from 'common/utils';
import { LandingProvider } from './_hooks/useLandingContext';
import {
  SectionTable,
  CreateSectionDialog,
  UpdateSectionDialog,
  CtaPanel,
  CreateCtaDialog,
  UpdateCtaDialog,
} from './_components';

function LandingContent() {
  const options = useApiOptions();
  const { t } = useLanguage();

  return (
    <div className="">
      <h1 className="text-2xl font-bold mb-6">{t('admin.landing.title')}</h1>
      <div className="flex gap-6">
        <div className="flex-1 min-w-0">
          <SectionTable apiOptions={options} />
        </div>
        <div className="w-80 shrink-0 border border-border rounded-lg overflow-hidden bg-background">
          <CtaPanel />
        </div>
      </div>
      <CreateSectionDialog />
      <UpdateSectionDialog />
      <CreateCtaDialog />
      <UpdateCtaDialog />
    </div>
  );
}

export default function LandingPage() {
  const options = useApiOptions();
  return (
    <LandingProvider apiOptions={options}>
      <LandingContent />
    </LandingProvider>
  );
}
