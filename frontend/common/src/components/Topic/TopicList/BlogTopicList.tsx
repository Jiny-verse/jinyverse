'use client';

import type { ApiOptions } from '../../../types/api';
import type { Topic } from '../../../schemas/topic';
import { BlogTopicCard } from '../TopicCard/BlogTopicCard';

interface BlogTopicListProps {
  topics: Topic[];
  apiOptions: ApiOptions;
  onTopicClick?: (topic: Topic) => void;
}

export function BlogTopicList({ topics, apiOptions, onTopicClick }: BlogTopicListProps) {
  return (
    <div className="divide-y divide-gray-200">
      {topics.map((topic) => (
        <BlogTopicCard
          key={topic.id}
          topic={topic}
          apiOptions={apiOptions}
          onClick={() => onTopicClick?.(topic)}
        />
      ))}
    </div>
  );
}
