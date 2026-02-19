'use client';

import type { ApiOptions } from '../../types/api';
import type { Topic } from '../../schemas/topic';
import { Badge } from '../../ui/Badge';
import { formatRelativeOrAbsolute } from '../../utils/formatDateTime';
import { getMainFileId, getExcerpt } from '../../utils/post';
import { useImageUrlFromFileId } from '../../hooks/useImageUrlFromFileId';

interface BlogBoardCardProps {
  topic: Topic;
  apiOptions: ApiOptions;
  onClick?: () => void;
}

export function BlogBoardCard({ topic, apiOptions, onClick }: BlogBoardCardProps) {
  const mainFileId = getMainFileId(topic);
  const thumbnailUrl = useImageUrlFromFileId(mainFileId, apiOptions);
  const excerpt = getExcerpt(topic.content);

  return (
    <div
      className="flex gap-4 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
      onClick={onClick}
    >
      <div className="shrink-0 w-40 h-28 bg-gray-200 overflow-hidden rounded-none">
        {thumbnailUrl ? (
          <img src={thumbnailUrl} alt={topic.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gray-200" />
        )}
      </div>
      <div className="flex flex-col justify-between min-w-0 flex-1 py-1">
        <div>
          <h3 className="text-base font-semibold text-gray-900 truncate">{topic.title}</h3>
          <p className="mt-1 text-sm text-gray-600 line-clamp-2">{excerpt}</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {topic.tags?.slice(0, 3).map((t) => (
            <Badge key={t.id} variant="info" className="text-xs">
              {t.name}
            </Badge>
          ))}
          <span className="text-xs text-gray-400">
            {topic.author?.nickname ?? '-'} · {formatRelativeOrAbsolute(topic.createdAt)}
          </span>
        </div>
      </div>
    </div>
  );
}
