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
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        key={fileIds[activeIdx]}
        src={`${apiBaseUrl}/api/files/${fileIds[activeIdx]}/download`}
        alt=""
        className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
      />
      {slideSettings.showControls && fileIds.length > 1 && (
        <>
          <button
            type="button"
            onClick={prev}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-30 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={next}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-30 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70"
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
                i === activeIdx ? 'bg-white' : 'bg-white/40'
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
  const customWidth = section.extraConfig?.customWidth as number | undefined;
  const href = section.extraConfig?.href as string | undefined;
  const slideSettings = section.extraConfig?.slideSettings as SlideSettings | undefined;

  const widthStyle: React.CSSProperties = customWidth
    ? { width: `${customWidth}px`, maxWidth: '100%' }
    : {};

  const resolveHref = (h: string) => {
    if (!h) return h;
    if (h.startsWith('http://') || h.startsWith('https://') || h.startsWith('/')) return h;
    return `https://${h}`;
  };

  const wrapWithLink = (content: React.ReactElement, extraClass = '') => {
    if (!href) {
      if (extraClass) return <div className={extraClass}>{content}</div>;
      return content;
    }
    return (
      <a
        href={resolveHref(href)}
        target={href.startsWith('/') ? undefined : '_blank'}
        rel="noopener noreferrer"
        className={`block ${extraClass}`}
      >
        {content}
      </a>
    );
  };

  if (section.type === 'hero') {
    const isCarousel = slideSettings?.enabled && fileIds.length > 1;
    const heightStyle = customHeight ? { height: `${customHeight}px` } : { height: '400px' };
    return (
      <div
        className="w-full relative overflow-hidden"
        style={{ ...heightStyle, ...widthStyle }}
      >
        {isCarousel ? (
          <HeroCarousel section={section} apiBaseUrl={base} slideSettings={slideSettings!} />
        ) : bgImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={fileIds[0]}
            src={bgImage}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
          />
        )}
        {href && (
          <a
            href={resolveHref(href)}
            target={href.startsWith('/') ? undefined : '_blank'}
            rel="noopener noreferrer"
            className="absolute inset-0 z-10"
          />
        )}
        {showFilmstrip && <ImageFilmstrip section={section} apiBaseUrl={base} />}
      </div>
    );
  }

  if (section.type === 'image') {
    return wrapWithLink(
      <div
        className="w-full flex overflow-hidden relative"
        style={{ ...(customHeight ? { height: `${customHeight}px` } : { height: '300px' }), ...widthStyle }}
      >
        <div className="w-1/2 bg-gray-200 flex items-center justify-center relative overflow-hidden">
          {bgImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={fileIds[0]} src={bgImage} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="text-gray-400 text-sm">Image</span>
          )}
        </div>
        <div className="w-1/2 flex flex-col justify-center px-8 bg-background">
          <div className="h-5 bg-gray-200 rounded mb-3 w-3/4" />
          <div className="h-3 bg-gray-100 rounded mb-2 w-full" />
          <div className="h-3 bg-gray-100 rounded mb-2 w-5/6" />
          <div className="h-3 bg-gray-100 rounded w-4/6" />
        </div>
        {showFilmstrip && <ImageFilmstrip section={section} apiBaseUrl={base} />}
      </div>
    );
  }

  if (section.type === 'board_top') {
    return (
      <div
        className="w-full p-4 bg-background"
        style={{ ...(customHeight ? { height: `${customHeight}px` } : { height: '240px' }), ...widthStyle }}
      >
        <div className="h-5 bg-gray-200 rounded mb-4 w-1/3" />
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gray-200 rounded shrink-0" />
            <div className="flex-1">
              <div className="h-3 bg-gray-200 rounded mb-1.5 w-3/4" />
              <div className="h-2 bg-gray-100 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (section.type === 'image_link') {
    return (
      <div
        className="w-full flex gap-2 p-4 bg-background relative"
        style={{ ...(customHeight ? { height: `${customHeight}px` } : { height: '300px' }), ...widthStyle }}
      >
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="flex-1 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400 text-sm"
          >
            Image {i + 1}
          </div>
        ))}
        {showFilmstrip && <ImageFilmstrip section={section} apiBaseUrl={base} />}
      </div>
    );
  }

  // Fallback
  return (
    <div className="h-[200px] w-full flex items-center justify-center bg-gray-100 text-gray-400">
      [{section.type}]
    </div>
  );
}
