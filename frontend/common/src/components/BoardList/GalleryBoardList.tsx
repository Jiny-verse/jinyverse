'use client';

import type { ApiOptions } from '../../types/api';
import type { Topic } from '../../schemas/topic';
import { GalleryBoardCard } from '../BoardCard/GalleryBoardCard';

interface GalleryBoardListProps {
  topics: Topic[];
  apiOptions: ApiOptions;
  onTopicClick?: (topic: Topic) => void;
}

export function GalleryBoardList({ topics, apiOptions, onTopicClick }: GalleryBoardListProps) {
  return (
    <div className="grid grid-cols-3 gap-0">
      {topics.map((topic) => (
        <GalleryBoardCard
          key={topic.id}
          topic={topic}
          apiOptions={apiOptions}
          onClick={() => onTopicClick?.(topic)}
        />
      ))}
    </div>
  );
}
