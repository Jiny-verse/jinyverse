'use client';

import React, { createContext, useContext, useState, useRef, useCallback, ReactNode } from 'react';
import { useDomainContext } from 'common';
import {
  createLandingSection,
  updateLandingSection,
  deleteLandingSection,
  createLandingCta,
  updateLandingCta,
  deleteLandingCta,
  getAdminLandingSections,
} from 'common/services';
import type { ApiOptions } from 'common/types';
import type {
  LandingSection,
  LandingCta,
  LandingSectionCreateInput,
  LandingSectionUpdateInput,
  LandingCtaCreateInput,
  LandingCtaUpdateInput,
} from 'common/schemas';

type SectionContextValue = ReturnType<
  typeof useDomainContext<LandingSection, LandingSectionCreateInput, LandingSectionUpdateInput>
> & {
  selectedSection: LandingSection | null;
  setSelectedSection: (section: LandingSection | null) => void;
  ctaDomain: ReturnType<typeof useDomainContext<LandingCta, LandingCtaCreateInput, LandingCtaUpdateInput>>;
};

const LandingContext = createContext<SectionContextValue | null>(null);

export function LandingProvider({
  apiOptions,
  children,
}: {
  apiOptions: ApiOptions;
  children: ReactNode;
}) {
  const [selectedSection, setSelectedSection] = useState<LandingSection | null>(null);
  const selectedSectionRef = useRef<LandingSection | null>(null);
  selectedSectionRef.current = selectedSection;
  const apiOptionsRef = useRef(apiOptions);
  apiOptionsRef.current = apiOptions;

  // After CTA changes, reload sections and re-sync the selected section
  const refreshSelectedSection = useCallback(async () => {
    const current = selectedSectionRef.current;
    if (!current) return;
    try {
      const sections = await getAdminLandingSections(apiOptionsRef.current);
      const updated = sections.find((s) => s.id === current.id);
      if (updated) setSelectedSection(updated);
    } catch {
      // ignore
    }
  }, []);

  const sectionDomain = useDomainContext<
    LandingSection,
    LandingSectionCreateInput,
    LandingSectionUpdateInput
  >({
    apiOptions,
    services: {
      create: createLandingSection,
      update: updateLandingSection,
      delete: deleteLandingSection,
    },
  });

  const ctaDomain = useDomainContext<LandingCta, LandingCtaCreateInput, LandingCtaUpdateInput>({
    apiOptions,
    services: {
      create: async (opts, input) => {
        const section = selectedSectionRef.current;
        if (!section) throw new Error('No section selected');
        const result = await createLandingCta(opts, section.id, input);
        await refreshSelectedSection();
        return result;
      },
      update: async (opts, id, input) => {
        const result = await updateLandingCta(opts, id, input);
        await refreshSelectedSection();
        return result;
      },
      delete: async (opts, id) => {
        await deleteLandingCta(opts, id);
        await refreshSelectedSection();
      },
    },
  });

  const value: SectionContextValue = {
    ...sectionDomain,
    selectedSection,
    setSelectedSection,
    ctaDomain,
  };

  return React.createElement(LandingContext.Provider, { value }, children);
}

export function useLandingContext() {
  const context = useContext(LandingContext);
  if (!context) throw new Error('useLandingContext must be used within LandingProvider');
  return context;
}
