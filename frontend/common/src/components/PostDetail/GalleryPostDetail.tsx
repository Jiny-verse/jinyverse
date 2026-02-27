'use client';

import { useState } from 'react';
import type { ApiOptions } from '../../types/api';
import type { Topic } from '../../schemas/topic';
import { Badge } from '../../ui/Badge';
import { formatRelativeOrAbsolute } from '../../utils/formatDateTime';
import { useImageUrlFromFileId } from '../../hooks/useImageUrlFromFileId';
import { ImageSplitViewer } from '../ImageSplitView';
import useLanguage from '../../utils/i18n/hooks/useLanguage';

function GalleryImage({
  fileId,
  apiOptions,
  onClick,
  ariaLabel,
}: {
  fileId: string;
  apiOptions: ApiOptions;
  onClick: () => void;
  ariaLabel: string;
}) {
  const url = useImageUrlFromFileId(fileId, apiOptions);
  return (
    <button
      type="button"
      onClick={onClick}
      className="block w-full cursor-zoom-in focus:outline-none"
      aria-label={ariaLabel}
    >
      {url ? (
        <img src={url} alt="" className="w-full h-auto" />
      ) : (
        <div className="w-full aspect-video bg-muted animate-pulse" />
      )}
    </button>
  );
}

interface GalleryPostDetailProps {
  topic: Topic;
  apiOptions: ApiOptions;
}

export function GalleryPostDetail({ topic, apiOptions }: GalleryPostDetailProps) {
  const [splitViewIndex, setSplitViewIndex] = useState<number | null>(null);
  const { t } = useLanguage();

  const sortedFiles = [...(topic.files ?? [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  return (
    <>
      <article className="py-10 px-4">
        {/* 제목 + 설명 + 메타 */}
        <header className="mb-6">
          <div className="flex items-baseline justify-between gap-4 mb-2">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">{topic.title}</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground shrink-0">
              <span>{topic.author?.nickname ?? '-'}</span>
              <span>·</span>
              <span>{formatRelativeOrAbsolute(topic.createdAt)}</span>
              <span>·</span>
              <span>{t('post.viewCount', { count: topic.viewCount ?? 0 })}</span>
            </div>
          </div>
          {topic.content && topic.content.trim() && (
            <p className="text-muted-foreground whitespace-pre-wrap text-sm leading-relaxed">
              {topic.content}
            </p>
          )}
        </header>

        {topic.tags?.length ? (
          <div className="flex flex-wrap gap-2 mb-6">
            {topic.tags.map((tag) => (
              <Badge key={tag.id} variant="info">
                #{tag.name}
              </Badge>
            ))}
          </div>
        ) : null}

        {/* 이미지 수직 스크롤 목록 */}
        {sortedFiles.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {sortedFiles.map((file, i) => (
              <GalleryImage
                key={file.fileId}
                fileId={file.fileId}
                apiOptions={apiOptions}
                onClick={() => setSplitViewIndex(i)}
                ariaLabel={t('post.zoomIn')}
              />
            ))}
          </div>
        )}
      </article>

      {/* 이미지 스플릿뷰 */}
      {splitViewIndex !== null && (
        <ImageSplitViewer
          images={sortedFiles}
          initialIndex={splitViewIndex}
          apiOptions={apiOptions}
          onClose={() => setSplitViewIndex(null)}
        />
      )}
    </>
  );
}
