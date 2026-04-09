'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import type { LandingSection, Board, Topic } from 'common/schemas';
import { getTopics, getBoard } from 'common/services';
import { getMainFileId, getExcerpt, formatRelativeOrAbsolute } from 'common/utils';
import { useLandingContext } from '../_hooks/useLandingContext';
import { useApiOptions } from '@/app/providers/ApiProvider';

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

// ── BoardTopPreview ──
function GalleryGrid({ topics, boardId, apiBaseUrl }: { topics: Topic[]; boardId: string; apiBaseUrl: string }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {topics.map((topic) => {
        const fileId = getMainFileId(topic);
        const thumbUrl = fileId ? `${apiBaseUrl}/api/files/${fileId}/download` : null;
        return (
          <div key={topic.id} className="relative aspect-square overflow-hidden group bg-muted rounded">
            {thumbUrl ? (
              <Image src={thumbUrl} alt={topic.title} fill className="object-cover" unoptimized />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-slate-600 to-slate-800" />
            )}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors duration-200 flex items-end p-3">
              <p className="text-white text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-200 line-clamp-2">
                {topic.title}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ProjectGrid({ topics, boardId, apiBaseUrl }: { topics: Topic[]; boardId: string; apiBaseUrl: string }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {topics.map((topic) => {
        const fileId = getMainFileId(topic);
        const thumbUrl = fileId ? `${apiBaseUrl}/api/files/${fileId}/download` : null;
        const excerpt = getExcerpt(topic.content, 100);
        return (
          <div key={topic.id} className="rounded-xl overflow-hidden border border-border bg-card">
            <div className="relative aspect-video bg-muted overflow-hidden">
              {thumbUrl ? (
                <Image src={thumbUrl} alt={topic.title} fill className="object-cover" unoptimized />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-slate-600 to-slate-800" />
              )}
            </div>
            {topic.tags && topic.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 px-4 pt-3">
                {topic.tags.slice(0, 4).map((tag) => (
                  <span key={tag.id} className="text-xs text-primary/80">#{tag.name}</span>
                ))}
              </div>
            )}
            <div className="px-4 pb-4 pt-2">
              <h3 className="text-base font-semibold text-foreground truncate">{topic.title}</h3>
              {excerpt && <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{excerpt}</p>}
              <p className="mt-2 text-xs text-muted-foreground">
                {topic.author?.nickname ?? '-'} · {formatRelativeOrAbsolute(topic.createdAt)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function BlogList({ topics, boardId, apiBaseUrl }: { topics: Topic[]; boardId: string; apiBaseUrl: string }) {
  return (
    <div className="flex flex-col divide-y divide-border">
      {topics.map((topic) => {
        const fileId = getMainFileId(topic);
        const thumbUrl = fileId ? `${apiBaseUrl}/api/files/${fileId}/download` : null;
        const excerpt = getExcerpt(topic.content, 120);
        return (
          <div key={topic.id} className="flex gap-4 py-4">
            <div className="shrink-0 w-32 h-24 rounded-lg overflow-hidden bg-muted relative">
              {thumbUrl ? (
                <Image src={thumbUrl} alt={topic.title} fill className="object-cover" unoptimized />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-slate-600 to-slate-800" />
              )}
            </div>
            <div className="flex flex-col justify-between min-w-0 flex-1">
              <div>
                <h3 className="text-base font-semibold text-foreground truncate">{topic.title}</h3>
                {excerpt && <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{excerpt}</p>}
              </div>
              <p className="text-xs text-muted-foreground">
                {topic.author?.nickname ?? '-'} · {formatRelativeOrAbsolute(topic.createdAt)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function NormalList({ topics }: { topics: Topic[] }) {
  return (
    <div className="flex flex-col divide-y divide-border">
      {topics.map((topic) => {
        const excerpt = getExcerpt(topic.content, 120);
        return (
          <div key={topic.id} className="py-4">
            <h3 className="text-base font-semibold text-foreground truncate">{topic.title}</h3>
            {excerpt && <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{excerpt}</p>}
            <p className="mt-1.5 text-xs text-muted-foreground">
              {topic.author?.nickname ?? '-'} · {formatRelativeOrAbsolute(topic.createdAt)} · 조회 {topic.viewCount ?? 0}
            </p>
          </div>
        );
      })}
    </div>
  );
}

function renderBoardTopics(board: Board | null, topics: Topic[], boardId: string, apiBaseUrl: string) {
  switch (board?.type) {
    case 'gallery': return <GalleryGrid topics={topics} boardId={boardId} apiBaseUrl={apiBaseUrl} />;
    case 'project': return <ProjectGrid topics={topics} boardId={boardId} apiBaseUrl={apiBaseUrl} />;
    case 'blog': return <BlogList topics={topics} boardId={boardId} apiBaseUrl={apiBaseUrl} />;
    default: return <NormalList topics={topics} />;
  }
}

function BoardTopPreview({ section, apiBaseUrl }: { section: LandingSection; apiBaseUrl: string | undefined }) {
  const options = useApiOptions();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [board, setBoard] = useState<Board | null>(null);
  const limit = (section.extraConfig?.limit as number) ?? 5;
  const base = apiBaseUrl ?? options.baseUrl ?? '';

  useEffect(() => {
    if (!section.boardId) return;
    Promise.all([
      getTopics(options, { boardId: section.boardId, size: limit, page: 0 }),
      getBoard(options, section.boardId),
    ]).then(([res, b]) => {
      setTopics(res.content);
      setBoard(b);
    }).catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section.boardId, limit]);

  return (
    <div className="w-full py-12 bg-background">
      <div className="max-w-5xl mx-auto px-4">
        <h2 className="text-2xl font-bold mb-6 text-foreground">{board?.name ?? '게시글'}</h2>
        {topics.length === 0 ? (
          <p className="text-muted-foreground text-sm">게시글이 없습니다</p>
        ) : (
          renderBoardTopics(board, topics, section.boardId!, base)
        )}
      </div>
    </div>
  );
}

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

  const heightStyle: React.CSSProperties | undefined = customHeight
    ? { height: `${customHeight}px` }
    : undefined;

  // ── Hero ──
  if (section.type === 'hero') {
    const isCarousel = slideSettings?.enabled && fileIds.length > 1;
    if (customHeight) {
      return (
        <div className="w-full relative overflow-hidden bg-slate-800" style={heightStyle}>
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
    return (
      <div className="w-full relative overflow-hidden bg-slate-800">
        {isCarousel ? (
          <HeroCarousel section={section} apiBaseUrl={base} slideSettings={slideSettings!} />
        ) : bgImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={fileIds[0]} src={bgImage} alt="" className="w-full h-auto block" />
        ) : (
          <div className="w-full h-[200px]" />
        )}
        {showFilmstrip && <ImageFilmstrip section={section} apiBaseUrl={base} />}
      </div>
    );
  }

  // ── Image (DescriptionImage) ──
  if (section.type === 'image') {
    if (customHeight) {
      return (
        <div className="w-full relative overflow-hidden bg-muted" style={heightStyle}>
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
    return (
      <div className="w-full relative overflow-hidden bg-muted">
        {bgImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={fileIds[0]} src={bgImage} alt="" className="w-full h-auto block" />
        ) : (
          <div className="w-full h-[200px] bg-gradient-to-br from-slate-700 to-slate-900" />
        )}
        {showFilmstrip && <ImageFilmstrip section={section} apiBaseUrl={base} />}
      </div>
    );
  }

  // ── Image Link ──
  if (section.type === 'image_link') {
    if (customHeight) {
      return (
        <div className="w-full relative overflow-hidden bg-slate-700" style={heightStyle}>
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
    return (
      <div className="w-full relative overflow-hidden bg-slate-700">
        {bgImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={fileIds[0]} src={bgImage} alt="" className="w-full h-auto block" />
        ) : (
          <div className="w-full h-[200px]" />
        )}
        {showFilmstrip && <ImageFilmstrip section={section} apiBaseUrl={base} />}
      </div>
    );
  }

  // ── Board Top ──
  if (section.type === 'board_top') {
    return <BoardTopPreview section={section} apiBaseUrl={base} />;
  }

  // ── Fallback ──
  return (
    <div className="h-[200px] w-full flex items-center justify-center bg-muted text-muted-foreground">
      [{section.type}]
    </div>
  );
}
