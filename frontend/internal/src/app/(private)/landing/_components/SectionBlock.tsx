'use client';

import { useRef, useState } from 'react';
import { ConfirmDialog } from 'common/ui';
import { useLanguage } from 'common/utils';
import type { LandingSection } from 'common/schemas';
import { useLandingContext } from '../_hooks/useLandingContext';
import { SectionPreview } from './SectionPreview';
import { CtaOverlay } from './CtaOverlay';
import { useApiOptions } from '@/app/providers/ApiProvider';

interface SectionBlockProps {
  section: LandingSection;
  index: number;
  isDragOver: boolean;
  onDragStart: (index: number, e: React.DragEvent) => void;
  onDragOver: (index: number, e: React.DragEvent) => void;
  onDrop: (index: number) => void;
}

export function SectionBlock({
  section,
  index,
  isDragOver,
  onDragStart,
  onDragOver,
  onDrop,
}: SectionBlockProps) {
  const { t } = useLanguage();
  const { selectedSection, selectedCtaId, setSelectedSection, deleteSection } = useLandingContext();
  const apiOptions = useApiOptions();
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [snapGuide, setSnapGuide] = useState({ h: false, v: false });
  const sectionRef = useRef<HTMLDivElement>(null);

  const isSelected = selectedSection?.id === section.id;

  const handleDeleteConfirm = async () => {
    if (!pendingDeleteId) return;
    await deleteSection(pendingDeleteId);
    setPendingDeleteId(null);
  };

  return (
    <>
      <ConfirmDialog
        isOpen={pendingDeleteId !== null}
        message={t('message.confirmDelete')}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setPendingDeleteId(null)}
      />
      <div
        ref={sectionRef}
        className={`relative group border-2 transition-colors ${
          isSelected ? 'border-primary' : 'border-transparent'
        } ${isDragOver ? 'border-t-4 border-t-primary' : ''}`}
        onDragOver={(e) => {
          e.preventDefault();
          onDragOver(index, e);
        }}
        onDrop={(e) => {
          e.preventDefault();
          onDrop(index);
        }}
      >
        {/* Hover toolbar */}
        <div className="absolute top-2 right-2 z-20 hidden group-hover:flex items-center gap-1 bg-white/90 border border-border rounded shadow-sm px-1.5 py-1">
          <div
            draggable
            onDragStart={(e) => onDragStart(index, e)}
            className="cursor-grab p-1 text-gray-500 hover:text-gray-800"
            title={t('admin.landing.section.dragHandle')}
          >
            ⠿
          </div>
          <button
            type="button"
            className="p-1 text-gray-500 hover:text-primary transition-colors"
            onClick={() => {
              setSelectedSection(section);
            }}
            title={t('ui.button.edit')}
          >
            ✏️
          </button>
          <button
            type="button"
            className="p-1 text-gray-500 hover:text-destructive transition-colors"
            onClick={() => setPendingDeleteId(section.id)}
            title={t('ui.button.delete')}
          >
            🗑
          </button>
        </div>

        {/* Section preview */}
        <SectionPreview section={section} apiBaseUrl={apiOptions.baseUrl} />

        {/* Snap guide lines */}
        {snapGuide.h && (
          <div className="absolute inset-x-0 top-1/2 h-px bg-red-500 z-30 pointer-events-none" />
        )}
        {snapGuide.v && (
          <div className="absolute inset-y-0 left-1/2 w-px bg-red-500 z-30 pointer-events-none" />
        )}

        {/* CTA overlays */}
        {section.ctas
          .filter((cta) => cta.isActive)
          .map((cta) => (
            <CtaOverlay
              key={cta.id}
              cta={cta}
              sectionId={section.id}
              isSelected={selectedCtaId === cta.id}
              sectionRef={sectionRef}
              onSnap={(h, v) => setSnapGuide({ h, v })}
            />
          ))}
      </div>
    </>
  );
}
