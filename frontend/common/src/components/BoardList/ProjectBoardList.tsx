'use client';

import type { ApiOptions } from '../../types/api';
import type { Topic } from '../../schemas/topic';
import { ProjectBoardCard } from '../BoardCard/ProjectBoardCard';

interface ProjectBoardListProps {
  topics: Topic[];
  apiOptions: ApiOptions;
  onTopicClick?: (topic: Topic) => void;
}

export function ProjectBoardList({ topics, apiOptions, onTopicClick }: ProjectBoardListProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {topics.map((topic) => (
        <ProjectBoardCard
          key={topic.id}
          topic={topic}
          apiOptions={apiOptions}
          onClick={() => onTopicClick?.(topic)}
        />
      ))}
    </div>
  );
}
