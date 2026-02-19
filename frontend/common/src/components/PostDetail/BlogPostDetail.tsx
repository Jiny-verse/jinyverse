'use client';

import type { ApiOptions } from '../../types/api';
import type { Topic } from '../../schemas/topic';
import { ContentViewer } from '../Editor/Viewer/ContentViewer';
import { Badge } from '../../ui/Badge';
import { formatRelativeOrAbsolute } from '../../utils/formatDateTime';
import { getMainFileId } from '../../utils/post';
import { useImageUrlFromFileId } from '../../hooks/useImageUrlFromFileId';

interface BlogPostDetailProps {
  topic: Topic;
  apiOptions: ApiOptions;
}

export function BlogPostDetail({ topic, apiOptions }: BlogPostDetailProps) {
  const mainFileId = getMainFileId(topic);
  const coverUrl = useImageUrlFromFileId(mainFileId, apiOptions);

  return (
    <article className="max-w-3xl mx-auto">
      {coverUrl && (
        <div className="w-full aspect-video overflow-hidden mb-8">
          <img src={coverUrl} alt={topic.title} className="w-full h-full object-cover" />
        </div>
      )}

      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">{topic.title}</h1>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span>{topic.author?.nickname ?? '-'}</span>
          <span>·</span>
          <span>{formatRelativeOrAbsolute(topic.createdAt)}</span>
          <span>·</span>
          <span>조회 {topic.viewCount ?? 0}</span>
        </div>
      </header>

      <hr className="border-gray-200 mb-8" />

      <ContentViewer content={topic.content} apiOptions={apiOptions} className="prose-lg" />

      {topic.tags?.length ? (
        <div className="mt-8 pt-6 border-t border-gray-200 flex flex-wrap gap-2">
          {topic.tags.map((t) => (
            <Badge key={t.id} variant="info">
              #{t.name}
            </Badge>
          ))}
        </div>
      ) : null}
    </article>
  );
}
