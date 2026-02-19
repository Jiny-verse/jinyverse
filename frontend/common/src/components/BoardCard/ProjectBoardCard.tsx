'use client';

import type { ApiOptions } from '../../types/api';
import type { Topic } from '../../schemas/topic';
import { Badge } from '../../ui/Badge';
import { formatRelativeOrAbsolute } from '../../utils/formatDateTime';
import { getMainFileId, getExcerpt } from '../../utils/post';
import { useImageUrlFromFileId } from '../../hooks/useImageUrlFromFileId';

interface ProjectBoardCardProps {
  topic: Topic;
  apiOptions: ApiOptions;
  onClick?: () => void;
}

export function ProjectBoardCard({ topic, apiOptions, onClick }: ProjectBoardCardProps) {
  const mainFileId = getMainFileId(topic);
  const coverUrl = useImageUrlFromFileId(mainFileId, apiOptions);
  const excerpt = getExcerpt(topic.content, 100);

  return (
    <div
      className="rounded-lg overflow-hidden border border-gray-200 bg-white cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <div className="aspect-video bg-gray-200 overflow-hidden">
        {coverUrl ? (
          <img src={coverUrl} alt={topic.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gray-200" />
        )}
      </div>
      {topic.tags?.length ? (
        <div className="flex flex-wrap gap-1 px-4 pt-3">
          {topic.tags.slice(0, 4).map((t) => (
            <span key={t.id} className="text-xs text-blue-600">
              #{t.name}
            </span>
          ))}
        </div>
      ) : null}
      <div className="px-4 pb-4 pt-2">
        <h3 className="text-base font-semibold text-gray-900 truncate">{topic.title}</h3>
        {excerpt && <p className="mt-1 text-sm text-gray-600 truncate">{excerpt}</p>}
        <p className="mt-1 text-xs text-gray-500">
          {topic.author?.nickname ?? '-'} · {formatRelativeOrAbsolute(topic.createdAt)}
        </p>
      </div>
    </div>
  );
}
