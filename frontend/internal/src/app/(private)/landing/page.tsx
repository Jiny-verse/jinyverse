'use client';

import { useApiOptions } from '@/app/providers/ApiProvider';
import { LandingProvider } from './_hooks/useLandingContext';
import {
  LandingHeader,
  LandingCanvas,
  RightPanel,
  AddSectionTypeModal,
} from './_components';

export default function LandingPage() {
  const options = useApiOptions();
  return (
    <LandingProvider apiOptions={options}>
      <div className="flex flex-col h-[calc(100%+3rem)] -mx-[4%] -my-6">
        <LandingHeader />
        <div className="flex flex-1 overflow-hidden">
          <LandingCanvas className="flex-1 overflow-y-auto" />
          <RightPanel />
        </div>
        <AddSectionTypeModal />
      </div>
    </LandingProvider>
  );
}
