'use client';

import type { ApiOptions } from '../../../types/api';
import type { Topic } from '../../../schemas/topic';
import { GalleryTopicCard } from '../TopicCard/GalleryTopicCard';

interface GalleryTopicListProps {
  topics: Topic[];
  apiOptions: ApiOptions;
  onTopicClick?: (topic: Topic) => void;
}

export function GalleryTopicList({ topics, apiOptions, onTopicClick }: GalleryTopicListProps) {
  return (
    <div className="grid grid-cols-3 gap-0">
      {topics.map((topic) => (
        <GalleryTopicCard
          key={topic.id}
          topic={topic}
          apiOptions={apiOptions}
          onClick={() => onTopicClick?.(topic)}
        />
      ))}
    </div>
  );
}
