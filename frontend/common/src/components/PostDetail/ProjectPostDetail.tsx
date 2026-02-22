'use client';

import { useState } from 'react';
import type { ApiOptions } from '../../types/api';
import type { Topic } from '../../schemas/topic';
import { ContentViewer } from '../Editor/Viewer/ContentViewer';
import { Badge } from '../../ui/Badge';
import { formatRelativeOrAbsolute } from '../../utils/formatDateTime';
import { getMainFileId } from '../../utils/post';
import { useImageUrlFromFileId } from '../../hooks/useImageUrlFromFileId';
import useLanguage from '../../utils/i18n/hooks/useLanguage';

interface LightboxProps {
  fileIds: string[];
  initialIndex: number;
  apiOptions: ApiOptions;
  onClose: () => void;
}

function LightboxImage({ fileId, apiOptions }: { fileId: string; apiOptions: ApiOptions }) {
  const url = useImageUrlFromFileId(fileId, apiOptions);
  return url ? (
    <img src={url} alt="" className="max-w-full max-h-[80vh] object-contain" onClick={(e) => e.stopPropagation()} />
  ) : (
    <div className="w-32 h-32 bg-gray-700 animate-pulse rounded" />
  );
}

function Lightbox({ fileIds, initialIndex, apiOptions, onClose }: LightboxProps) {
  const [index, setIndex] = useState(initialIndex);
  const { t } = useLanguage();

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'ArrowLeft' && index > 0) setIndex(index - 1);
    if (e.key === 'ArrowRight' && index < fileIds.length - 1) setIndex(index + 1);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
      onClick={onClose}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <button
        className="absolute top-4 right-4 text-white text-3xl leading-none hover:text-gray-300"
        onClick={onClose}
        aria-label={t('post.close')}
      >
        ×
      </button>
      {index > 0 && (
        <button
          className="absolute left-4 text-white text-5xl leading-none hover:text-gray-300"
          onClick={(e) => { e.stopPropagation(); setIndex(index - 1); }}
          aria-label={t('post.prev')}
        >
          ‹
        </button>
      )}
      <LightboxImage fileId={fileIds[index]} apiOptions={apiOptions} />
      {index < fileIds.length - 1 && (
        <button
          className="absolute right-4 text-white text-5xl leading-none hover:text-gray-300"
          onClick={(e) => { e.stopPropagation(); setIndex(index + 1); }}
          aria-label={t('post.next')}
        >
          ›
        </button>
      )}
      <div className="absolute bottom-4 text-white text-sm">
        {index + 1} / {fileIds.length}
      </div>
    </div>
  );
}

function GridImage({
  fileId,
  apiOptions,
  onClick,
}: {
  fileId: string;
  apiOptions: ApiOptions;
  onClick: () => void;
}) {
  const url = useImageUrlFromFileId(fileId, apiOptions);
  return (
    <div
      className="aspect-square overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
      onClick={onClick}
    >
      {url ? (
        <img src={url} alt="" className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full bg-gray-200 animate-pulse" />
      )}
    </div>
  );
}

function extractEditorImageFileIds(content: string): string[] {
  const pattern = /\/api\/files\/([0-9a-f-]{36})\/download/gi;
  const ids: string[] = [];
  let match;
  while ((match = pattern.exec(content)) !== null) {
    if (!ids.includes(match[1])) ids.push(match[1]);
  }
  return ids;
}

interface ProjectPostDetailProps {
  topic: Topic;
  apiOptions: ApiOptions;
}

export function ProjectPostDetail({ topic, apiOptions }: ProjectPostDetailProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const { t } = useLanguage();

  const mainFileId = getMainFileId(topic);
  const coverUrl = useImageUrlFromFileId(mainFileId, apiOptions);
  const editorImageFileIds = extractEditorImageFileIds(topic.content ?? '');

  return (
    <article className="max-w-4xl mx-auto">
      {coverUrl && (
        <div className="w-full aspect-video overflow-hidden mb-6">
          <img src={coverUrl} alt={topic.title} className="w-full h-full object-cover" />
        </div>
      )}

      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-3">{topic.title}</h1>
        {topic.tags?.length ? (
          <div className="flex flex-wrap gap-2 mb-3">
            {topic.tags.map((tag) => (
              <span key={tag.id} className="text-sm text-blue-600">
                #{tag.name}
              </span>
            ))}
          </div>
        ) : null}
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span>{topic.author?.nickname ?? '-'}</span>
          <span>·</span>
          <span>{formatRelativeOrAbsolute(topic.createdAt)}</span>
        </div>
      </header>

      <hr className="border-gray-200 mb-6" />

      <ContentViewer content={topic.content} apiOptions={apiOptions} />

      {editorImageFileIds.length > 0 && (
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">{t('post.imageGallery')}</h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {editorImageFileIds.map((id, i) => (
              <GridImage
                key={id}
                fileId={id}
                apiOptions={apiOptions}
                onClick={() => setLightboxIndex(i)}
              />
            ))}
          </div>
        </div>
      )}

      {lightboxIndex !== null && (
        <Lightbox
          fileIds={editorImageFileIds}
          initialIndex={lightboxIndex}
          apiOptions={apiOptions}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </article>
  );
}
