'use client';

import { useRef, useState } from 'react';
import { useLanguage } from 'common/utils';
import { useLandingContext } from '../_hooks/useLandingContext';
import { SectionBlock } from './SectionBlock';

interface LandingCanvasProps {
  className?: string;
}

export function LandingCanvas({ className }: LandingCanvasProps) {
  const { t } = useLanguage();
  const { sections, reorderSection, openAddSectionModal } = useLandingContext();
  const canvasRef = useRef<HTMLDivElement>(null);

  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  const handleDragStart = (index: number, e: React.DragEvent) => {
    setDraggingIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (index: number, e: React.DragEvent) => {
    e.preventDefault();
    if (index !== overIndex) {
      setOverIndex(index);
    }
  };

  const handleDrop = (toIndex: number) => {
    if (draggingIndex !== null && draggingIndex !== toIndex) {
      reorderSection(draggingIndex, toIndex);
    }
    setDraggingIndex(null);
    setOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggingIndex(null);
    setOverIndex(null);
  };

  return (
    <div ref={canvasRef} className={`relative ${className ?? ''}`} onDragEnd={handleDragEnd}>
      {sections.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 text-muted-foreground text-sm">
          <p className="mb-4">{t('admin.landing.selectSection')}</p>
          <button
            type="button"
            onClick={openAddSectionModal}
            className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors text-sm"
          >
            + {t('admin.landing.addSection')}
          </button>
        </div>
      ) : (
        <>
          {sections.map((section, index) => (
            <SectionBlock
              key={section.id}
              section={section}
              index={index}
              isDragOver={overIndex === index && draggingIndex !== index}
              canvasRef={canvasRef}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            />
          ))}
          <div className="flex justify-center py-4">
            <button
              type="button"
              onClick={openAddSectionModal}
              className="px-6 py-2 border-2 border-dashed border-border rounded-lg text-muted-foreground hover:border-primary hover:text-primary transition-colors text-sm"
            >
              + {t('admin.landing.addSection')}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
