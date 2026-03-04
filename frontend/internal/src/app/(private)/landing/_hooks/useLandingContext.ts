'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useLandingDraft } from './useLandingDraft';
import type { ApiOptions } from 'common/types';
import type {
  LandingSection,
  LandingSectionUpdateInput,
  LandingCtaUpdateInput,
  LandingCta,
} from 'common/schemas';

interface LandingContextValue {
  // draft state
  sections: LandingSection[];
  isDirty: boolean;
  isSaving: boolean;

  // viewport
  viewportMode: 'desktop' | 'mobile';
  setViewportMode: (mode: 'desktop' | 'mobile') => void;

  // undo/redo
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;

  // selection
  selectedSection: LandingSection | null;
  setSelectedSection: (s: LandingSection | null) => void;
  selectedCtaId: string | null;
  setSelectedCtaId: (id: string | null) => void;

  // modal
  isAddSectionModalOpen: boolean;
  openAddSectionModal: () => void;
  closeAddSectionModal: () => void;

  // section actions
  reorderSection: (from: number, to: number) => void;
  updateSection: (id: string, patch: Partial<LandingSectionUpdateInput>) => void;
  deleteSection: (id: string) => Promise<void>;
  addSection: (type: string) => Promise<void>;
  addSectionFile: (sectionId: string, fileId: string) => void;
  removeSectionFile: (sectionId: string, fileId: string) => void;
  reorderSectionFiles: (sectionId: string, fileIds: string[]) => void;

  // CTA actions
  updateCta: (sectionId: string, ctaId: string, patch: Partial<LandingCtaUpdateInput>) => void;
  moveCta: (sectionId: string, ctaId: string, top: number, left: number) => void;
  addCta: (sectionId: string, href: string) => Promise<LandingCta>;
  deleteCta: (sectionId: string, ctaId: string) => Promise<void>;

  // save
  saveAll: () => Promise<void>;
  discard: () => void;
}

const LandingContext = createContext<LandingContextValue | null>(null);

export function LandingProvider({
  apiOptions,
  children,
}: {
  apiOptions: ApiOptions;
  children: ReactNode;
}) {
  const draft = useLandingDraft(apiOptions);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [selectedCtaId, setSelectedCtaId] = useState<string | null>(null);
  const [isAddSectionModalOpen, setIsAddSectionModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [viewportMode, setViewportMode] = useState<'desktop' | 'mobile'>('desktop');

  // Derived: always reflects the latest sections state — no delay
  const selectedSection = selectedSectionId
    ? (draft.sections.find((s) => s.id === selectedSectionId) ?? null)
    : null;

  // Load sections on mount
  useEffect(() => {
    draft.load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setSelectedSection = useCallback((s: LandingSection | null) => {
    setSelectedSectionId(s?.id ?? null);
    setSelectedCtaId(null);
  }, []);

  const openAddSectionModal = useCallback(() => setIsAddSectionModalOpen(true), []);
  const closeAddSectionModal = useCallback(() => setIsAddSectionModalOpen(false), []);

  const saveAll = useCallback(async () => {
    setIsSaving(true);
    try {
      await draft.saveAll();
    } finally {
      setIsSaving(false);
    }
  }, [draft]);

  const value: LandingContextValue = {
    sections: draft.sections,
    isDirty: draft.isDirty,
    isSaving,
    viewportMode,
    setViewportMode,
    canUndo: draft.canUndo,
    canRedo: draft.canRedo,
    undo: draft.undo,
    redo: draft.redo,
    selectedSection,
    setSelectedSection,
    selectedCtaId,
    setSelectedCtaId,
    isAddSectionModalOpen,
    openAddSectionModal,
    closeAddSectionModal,
    reorderSection: draft.reorderSection,
    updateSection: draft.updateSection,
    deleteSection: draft.deleteSection,
    addSection: draft.addSection,
    addSectionFile: draft.addSectionFile,
    removeSectionFile: draft.removeSectionFile,
    reorderSectionFiles: draft.reorderSectionFiles,
    updateCta: draft.updateCta,
    moveCta: draft.moveCta,
    addCta: draft.addCta,
    deleteCta: draft.deleteCta,
    saveAll,
    discard: draft.discard,
  };

  return React.createElement(LandingContext.Provider, { value }, children);
}

export function useLandingContext() {
  const context = useContext(LandingContext);
  if (!context) throw new Error('useLandingContext must be used within LandingProvider');
  return context;
}
