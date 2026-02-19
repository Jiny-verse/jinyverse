'use client';

import { useEffect, useState, useCallback } from 'react';
import type { ApiOptions } from '../../types/api';
import type { FileAttachmentItem } from '../../schemas/file';
import { useImageUrlFromFileId } from '../../hooks/useImageUrlFromFileId';

interface ThumbnailProps {
  fileId: string;
  apiOptions: ApiOptions;
  selected: boolean;
  onClick: () => void;
}

function Thumbnail({ fileId, apiOptions, selected, onClick }: ThumbnailProps) {
  const url = useImageUrlFromFileId(fileId, apiOptions);
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full aspect-square overflow-hidden border-2 transition-colors ${
        selected ? 'border-blue-500' : 'border-transparent hover:border-gray-400'
      }`}
    >
      {url ? (
        <img src={url} alt="" className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full bg-gray-200 animate-pulse" />
      )}
    </button>
  );
}

interface MainImageProps {
  fileId: string;
  apiOptions: ApiOptions;
}

function MainImage({ fileId, apiOptions }: MainImageProps) {
  const url = useImageUrlFromFileId(fileId, apiOptions);
  return (
    <div className="w-full h-full flex items-center justify-center bg-black">
      {url ? (
        <img src={url} alt="" className="max-w-full max-h-full object-contain" />
      ) : (
        <div className="w-64 h-64 bg-gray-800 animate-pulse" />
      )}
    </div>
  );
}

export interface ImageSplitViewerProps {
  images: FileAttachmentItem[];
  initialIndex?: number;
  apiOptions: ApiOptions;
  onClose: () => void;
}

export function ImageSplitViewer({
  images,
  initialIndex = 0,
  apiOptions,
  onClose,
}: ImageSplitViewerProps) {
  const [selectedIndex, setSelectedIndex] = useState(
    Math.max(0, Math.min(initialIndex, images.length - 1))
  );

  const goTo = useCallback(
    (index: number) => {
      setSelectedIndex(Math.max(0, Math.min(index, images.length - 1)));
    },
    [images.length]
  );

  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') goTo(selectedIndex - 1);
      if (e.key === 'ArrowRight') goTo(selectedIndex + 1);
    };
    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [selectedIndex, onClose, goTo]);

  const current = images[selectedIndex];
  if (!current) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex bg-black/95"
      role="dialog"
      aria-modal="true"
    >
      {/* 왼쪽: 썸네일 목록 */}
      <div className="w-32 sm:w-40 flex-shrink-0 bg-gray-950 flex flex-col overflow-y-auto p-2 gap-2">
        {images.map((img, i) => (
          <Thumbnail
            key={img.fileId}
            fileId={img.fileId}
            apiOptions={apiOptions}
            selected={i === selectedIndex}
            onClick={() => goTo(i)}
          />
        ))}
      </div>

      {/* 오른쪽: 선택 이미지 */}
      <div className="flex-1 relative flex flex-col">
        {/* 상단 바 */}
        <div className="flex items-center justify-between px-4 py-2 bg-black/60">
          <span className="text-gray-300 text-sm">
            {selectedIndex + 1} / {images.length}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-300 hover:text-white text-2xl leading-none"
            aria-label="닫기"
          >
            ×
          </button>
        </div>

        {/* 이미지 */}
        <div className="flex-1 relative overflow-hidden">
          <MainImage fileId={current.fileId} apiOptions={apiOptions} />

          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => goTo(selectedIndex - 1)}
                disabled={selectedIndex === 0}
                aria-label="이전"
                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 text-white text-2xl flex items-center justify-center hover:bg-black/70 disabled:opacity-30 transition-colors"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={() => goTo(selectedIndex + 1)}
                disabled={selectedIndex === images.length - 1}
                aria-label="다음"
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 text-white text-2xl flex items-center justify-center hover:bg-black/70 disabled:opacity-30 transition-colors"
              >
                ›
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
