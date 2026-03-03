'use client';

import { useRef, useState } from 'react';
import type { LandingSection } from 'common/schemas';
import { useLandingContext } from '../_hooks/useLandingContext';

interface SectionPreviewProps {
  section: LandingSection;
  apiBaseUrl: string;
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

export function SectionPreview({ section, apiBaseUrl }: SectionPreviewProps) {
  const bgImage =
    section.fileIds && section.fileIds.length > 0
      ? `${apiBaseUrl}/api/files/${section.fileIds[0]}/download`
      : null;

  const showFilmstrip = FILMSTRIP_TYPES.includes(section.type);

  if (section.type === 'hero') {
    return (
      <div
        className="h-[400px] w-full relative overflow-hidden"
        style={
          bgImage
            ? { backgroundImage: `url(${bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
            : { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }
        }
      >
        {showFilmstrip && <ImageFilmstrip section={section} apiBaseUrl={apiBaseUrl} />}
      </div>
    );
  }

  if (section.type === 'image') {
    return (
      <div className="h-[300px] w-full flex overflow-hidden relative">
        <div className="w-1/2 bg-gray-200 flex items-center justify-center relative overflow-hidden">
          {bgImage ? (
            <img src={bgImage} alt="" className="w-full h-full object-cover" />
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
        {showFilmstrip && <ImageFilmstrip section={section} apiBaseUrl={apiBaseUrl} />}
      </div>
    );
  }

  if (section.type === 'board_top') {
    return (
      <div className="h-[240px] w-full p-4 bg-background">
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
      <div className="h-[300px] w-full flex gap-2 p-4 bg-background relative">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="flex-1 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400 text-sm"
          >
            Image {i + 1}
          </div>
        ))}
        {showFilmstrip && <ImageFilmstrip section={section} apiBaseUrl={apiBaseUrl} />}
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
