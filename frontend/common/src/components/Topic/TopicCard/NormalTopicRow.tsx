'use client';

import type { Topic } from '../../../schemas/topic';
import { Badge } from '../../../ui/Badge';
import { formatRelativeOrAbsolute } from '../../../utils/formatDateTime';

interface NormalTopicRowProps {
  topic: Topic;
  onClick?: () => void;
}

export function NormalTopicRow({ topic, onClick }: NormalTopicRowProps) {
  return (
    <tr
      className="border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
      onClick={onClick}
    >
      <td className="px-4 py-3 text-sm">
        <div className="flex items-center gap-2">
          {topic.isNotice && (
            <Badge variant="default" className="text-xs shrink-0">
              공지
            </Badge>
          )}
          {topic.isPinned && (
            <Badge variant="info" className="text-xs shrink-0">
              고정
            </Badge>
          )}
          <span className="text-gray-900 truncate">{topic.title}</span>
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
        {topic.author?.nickname ?? '-'}
      </td>
      <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
        {formatRelativeOrAbsolute(topic.createdAt)}
      </td>
      <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
        {topic.viewCount ?? 0}
      </td>
    </tr>
  );
}
