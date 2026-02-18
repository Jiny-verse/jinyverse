'use client';

import type { Topic } from '../../../schemas/topic';
import { NormalTopicRow } from '../TopicCard/NormalTopicRow';

interface NormalTopicListProps {
  topics: Topic[];
  onTopicClick?: (topic: Topic) => void;
}

export function NormalTopicList({ topics, onTopicClick }: NormalTopicListProps) {
  return (
    <table className="w-full text-left border-collapse">
      <thead>
        <tr className="border-b border-gray-300 bg-gray-50">
          <th className="px-4 py-2 text-sm font-medium text-gray-700">제목</th>
          <th className="px-4 py-2 text-sm font-medium text-gray-700 whitespace-nowrap">작성자</th>
          <th className="px-4 py-2 text-sm font-medium text-gray-700 whitespace-nowrap">날짜</th>
          <th className="px-4 py-2 text-sm font-medium text-gray-700 whitespace-nowrap">조회</th>
        </tr>
      </thead>
      <tbody>
        {topics.map((topic) => (
          <NormalTopicRow key={topic.id} topic={topic} onClick={() => onTopicClick?.(topic)} />
        ))}
      </tbody>
    </table>
  );
}
