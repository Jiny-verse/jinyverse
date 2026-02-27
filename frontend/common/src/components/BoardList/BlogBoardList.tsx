'use client';

import type { ApiOptions } from '../../types/api';
import type { Topic } from '../../schemas/topic';
import { BlogBoardCard } from '../BoardCard/BlogBoardCard';

interface BlogBoardListProps {
  topics: Topic[];
  apiOptions: ApiOptions;
  onTopicClick?: (topic: Topic) => void;
}

export function BlogBoardList({ topics, apiOptions, onTopicClick }: BlogBoardListProps) {
  return (
    <div className="divide-y divide-border">
      {topics.map((topic) => (
        <BlogBoardCard
          key={topic.id}
          topic={topic}
          apiOptions={apiOptions}
          onClick={() => onTopicClick?.(topic)}
        />
      ))}
    </div>
  );
}
