'use client';

import type { Topic } from '../../schemas/topic';
import { NormalBoardRow } from '../BoardCard/NormalBoardRow';

interface NormalBoardListProps {
  topics: Topic[];
  onTopicClick?: (topic: Topic) => void;
}

export function NormalBoardList({ topics, onTopicClick }: NormalBoardListProps) {
  return (
    <div className="w-full">
      {topics.map((topic) => (
        <NormalBoardRow key={topic.id} topic={topic} onClick={() => onTopicClick?.(topic)} />
      ))}
    </div>
  );
}
