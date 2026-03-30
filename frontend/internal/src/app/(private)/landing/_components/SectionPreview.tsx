'use client';

import { useEffect, useRef, useState } from 'react';
import type { LandingSection } from 'common/schemas';
import { useLandingContext } from '../_hooks/useLandingContext';

interface SectionPreviewProps {
  section: LandingSection;
  apiBaseUrl: string | undefined;
}

interface SlideSettings {
  enabled: boolean;
  autoPlay: boolean;
  interval: number;
  showControls: boolean;
  showIndicators: boolean;
}

const FILMSTRIP_TYPES = ['hero', 'image', 'image_link'];

function ImageFilmstrip({
  section,
  apiBaseUrl,
}: {
  section: LandingSection;
  apiBaseUrl: string;
}) {
  const { reorderSectionFiles } = useLandingContext();
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const dragIdRef = useRef<string | null>(null);

  if (!section.fileIds || section.fileIds.length === 0) return null;

  const handleDragStart = (fileId: string) => {
    dragIdRef.current = fileId;
  };

  const handleDragOver = (e: React.DragEvent, fileId: string) => {
    e.preventDefault();
    setDragOverId(fileId);
  };

  const handleDrop = async (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    setDragOverId(null);
    const fromId = dragIdRef.current;
    dragIdRef.current = null;
    if (!fromId || fromId === targetId) return;

    const fileIds = section.fileIds ?? [];
    const fromIdx = fileIds.indexOf(fromId);
    const toIdx = fileIds.indexOf(targetId);
    if (fromIdx < 0 || toIdx < 0) return;

    const reordered = [...fileIds];
    reordered.splice(fromIdx, 1);
    reordered.splice(toIdx, 0, fromId);
    await reorderSectionFiles(section.id, reordered);
  };

  const handleDragEnd = () => {
    setDragOverId(null);
    dragIdRef.current = null;
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 flex gap-1 p-2 bg-black/50 overflow-x-auto z-20">
      {section.fileIds.map((fileId, idx) => (
        <div
          key={fileId}
          draggable
          onDragStart={() => handleDragStart(fileId)}
          onDragOver={(e) => handleDragOver(e, fileId)}
          onDrop={(e) => handleDrop(e, fileId)}
          onDragEnd={handleDragEnd}
          className={`shrink-0 w-12 h-9 rounded overflow-hidden border-2 cursor-grab relative ${
            dragOverId === fileId ? 'border-primary' : 'border-white/60'
          }`}
          title={`Drag to reorder (${idx + 1})`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={fileId}
            src={`${apiBaseUrl}/api/files/${fileId}/download`}
            alt=""
            className="w-full h-full object-cover"
          />
          {idx === 0 && (
            <span className="absolute bottom-0 left-0 right-0 text-center text-white bg-black/60 text-[9px] leading-tight">
              main
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

function HeroCarousel({
  section,
  apiBaseUrl,
  slideSettings,
}: {
  section: LandingSection;
  apiBaseUrl: string;
  slideSettings: SlideSettings;
}) {
  const fileIds = section.fileIds ?? [];
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    if (!slideSettings.autoPlay || fileIds.length <= 1) return;
    const timer = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % fileIds.length);
    }, slideSettings.interval || 3000);
    return () => clearInterval(timer);
  }, [slideSettings.autoPlay, slideSettings.interval, fileIds.length]);

  const prev = () => setActiveIdx((i) => (i - 1 + fileIds.length) % fileIds.length);
  const next = () => setActiveIdx((i) => (i + 1) % fileIds.length);

  return (
    <>
      {fileIds.map((fileId, idx) => (
        <div
          key={fileId}
          className={`absolute inset-0 transition-opacity duration-700 ${
            idx === activeIdx ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`${apiBaseUrl}/api/files/${fileId}/download`}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>
      ))}
      {slideSettings.showControls && fileIds.length > 1 && (
        <>
          <button
            type="button"
            onClick={prev}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-30 w-9 h-9 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 text-xl leading-none"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={next}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-30 w-9 h-9 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 text-xl leading-none"
          >
            ›
          </button>
        </>
      )}
      {slideSettings.showIndicators && fileIds.length > 1 && (
        <div className="absolute bottom-10 left-0 right-0 flex justify-center gap-1.5 z-30">
          {fileIds.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActiveIdx(i)}
              className={`w-2 h-2 rounded-full transition-colors ${
                i === activeIdx ? 'bg-white' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      )}
    </>
  );
}

export function SectionPreview({ section, apiBaseUrl }: SectionPreviewProps) {
  const base = apiBaseUrl ?? '';
  const fileIds = section.fileIds ?? [];
  const bgImage = fileIds.length > 0 ? `${base}/api/files/${fileIds[0]}/download` : null;

  const showFilmstrip = FILMSTRIP_TYPES.includes(section.type);
  const customHeight = section.extraConfig?.customHeight as number | undefined;
  const slideSettings = section.extraConfig?.slideSettings as SlideSettings | undefined;

  const defaultHeightStyle: React.CSSProperties = customHeight
    ? { height: `${customHeight}px` }
    : { height: '500px' };

  // ── Hero ──
  if (section.type === 'hero') {
    const isCarousel = slideSettings?.enabled && fileIds.length > 1;
    return (
      <div className="w-full relative overflow-hidden bg-slate-800" style={defaultHeightStyle}>
        <div className="absolute inset-0 overflow-hidden">
          {isCarousel ? (
            <HeroCarousel section={section} apiBaseUrl={base} slideSettings={slideSettings!} />
          ) : bgImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={fileIds[0]} src={bgImage} alt="" className="absolute inset-0 w-full h-full object-cover" />
          ) : null}
        </div>
        {showFilmstrip && <ImageFilmstrip section={section} apiBaseUrl={base} />}
      </div>
    );
  }

  // ── Image (DescriptionImage) ──
  if (section.type === 'image') {
    return (
      <div className="w-full relative overflow-hidden bg-muted" style={defaultHeightStyle}>
        <div className="absolute inset-0 overflow-hidden">
          {bgImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={fileIds[0]} src={bgImage} alt="" className="absolute inset-0 w-full h-full object-cover" />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-900" />
          )}
        </div>
        {showFilmstrip && <ImageFilmstrip section={section} apiBaseUrl={base} />}
      </div>
    );
  }

  // ── Image Link ──
  if (section.type === 'image_link') {
    return (
      <div className="w-full relative overflow-hidden bg-slate-700" style={defaultHeightStyle}>
        <div className="absolute inset-0 overflow-hidden">
          {bgImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={fileIds[0]} src={bgImage} alt="" className="absolute inset-0 w-full h-full object-cover" />
          ) : null}
        </div>
        {showFilmstrip && <ImageFilmstrip section={section} apiBaseUrl={base} />}
      </div>
    );
  }

  // ── Board Top ──
  if (section.type === 'board_top') {
    return (
      <div className="w-full py-12 bg-background">
        <div className="max-w-5xl mx-auto px-4">
          <div className="h-6 bg-muted rounded mb-6 w-1/3" />
          <div className="grid grid-cols-3 gap-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="rounded-lg border border-border overflow-hidden bg-card">
                <div className="w-full h-40 bg-gradient-to-br from-slate-600 to-slate-800" />
                <div className="p-3">
                  <div className="h-4 bg-muted rounded mb-2 w-3/4" />
                  <div className="flex items-center justify-between mt-2">
                    <div className="h-3 bg-muted/50 rounded w-1/3" />
                    <div className="h-3 bg-muted/50 rounded w-1/4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Fallback ──
  return (
    <div className="h-[200px] w-full flex items-center justify-center bg-muted text-muted-foreground">
      [{section.type}]
    </div>
  );
}
