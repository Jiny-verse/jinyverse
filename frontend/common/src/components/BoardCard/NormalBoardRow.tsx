'use client';

import type { Topic } from '../../schemas/topic';
import { Badge } from '../../ui/Badge';
import { formatRelativeOrAbsolute } from '../../utils/formatDateTime';
import { getExcerpt } from '../../utils/post';

interface NormalBoardRowProps {
  topic: Topic;
  onClick?: () => void;
}

export function NormalBoardRow({ topic, onClick }: NormalBoardRowProps) {
  const excerpt = topic.content ? getExcerpt(topic.content, 120) : null;

  return (
    <div
      className="py-6 hover:bg-accent/50 transition-colors cursor-pointer border-b border-border"
      onClick={onClick}
    >
      <div className="flex items-start gap-2">
        {topic.isNotice && (
          <Badge variant="default" className="text-xs shrink-0 mt-0.5">
            공지
          </Badge>
        )}
        {topic.isPinned && (
          <Badge variant="info" className="text-xs shrink-0 mt-0.5">
            고정
          </Badge>
        )}
        <h3 className="m-0 text-base font-semibold text-foreground truncate leading-snug">
          {topic.title}
        </h3>
      </div>
      {excerpt && <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{excerpt}</p>}
      <p className="mt-2 text-xs text-muted-foreground">
        {topic.author?.nickname ?? '-'} · {formatRelativeOrAbsolute(topic.createdAt)} · 조회{' '}
        {topic.viewCount ?? 0}
      </p>
    </div>
  );
}
