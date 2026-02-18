'use client';

import type { ApiOptions } from '../../../types/api';
import type { Topic } from '../../../schemas/topic';
import { ProjectTopicCard } from '../TopicCard/ProjectTopicCard';

interface ProjectTopicListProps {
  topics: Topic[];
  apiOptions: ApiOptions;
  onTopicClick?: (topic: Topic) => void;
}

export function ProjectTopicList({ topics, apiOptions, onTopicClick }: ProjectTopicListProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {topics.map((topic) => (
        <ProjectTopicCard
          key={topic.id}
          topic={topic}
          apiOptions={apiOptions}
          onClick={() => onTopicClick?.(topic)}
        />
      ))}
    </div>
  );
}
