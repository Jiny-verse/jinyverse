'use client';

import { useState } from 'react';
import type { ApiOptions } from '../../types/api';
import type { Topic } from '../../schemas/topic';
import { Badge } from '../../ui/Badge';
import { formatRelativeOrAbsolute } from '../../utils/formatDateTime';
import { useImageUrlFromFileId } from '../../hooks/useImageUrlFromFileId';
import { ImageSplitViewer } from '../ImageSplitView';

function GalleryImage({
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
    <button
      type="button"
      onClick={onClick}
      className="block w-full cursor-zoom-in focus:outline-none"
      aria-label="이미지 크게 보기"
    >
      {url ? (
        <img src={url} alt="" className="w-full h-auto" />
      ) : (
        <div className="w-full aspect-video bg-gray-200 animate-pulse" />
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

  const sortedFiles = [...(topic.files ?? [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  return (
    <>
      <article className="max-w-2xl mx-auto">
        {/* 제목 + 설명 + 메타 */}
        <header className="mb-6">
          <h1 className="text-xl font-bold text-gray-900 mb-2">{topic.title}</h1>
          {topic.content && topic.content.trim() && (
            <p className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed mb-3">
              {topic.content}
            </p>
          )}
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>{topic.author?.nickname ?? '-'}</span>
            <span>·</span>
            <span>{formatRelativeOrAbsolute(topic.createdAt)}</span>
            <span>·</span>
            <span>조회 {topic.viewCount ?? 0}</span>
          </div>
        </header>

        {topic.tags?.length ? (
          <div className="flex flex-wrap gap-2 mb-6">
            {topic.tags.map((t) => (
              <Badge key={t.id} variant="info">
                #{t.name}
              </Badge>
            ))}
          </div>
        ) : null}

        {/* 이미지 수직 스크롤 목록 */}
        {sortedFiles.length > 0 && (
          <div className="flex flex-col gap-4">
            {sortedFiles.map((file, i) => (
              <GalleryImage
                key={file.fileId}
                fileId={file.fileId}
                apiOptions={apiOptions}
                onClick={() => setSplitViewIndex(i)}
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
