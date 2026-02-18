'use client';

import type { ApiOptions } from '../../../types/api';
import type { Board } from '../../../schemas/board';
import type { Topic } from '../../../schemas/topic';
import type { BoardType } from '../../../constants/boardType';
import { NormalTopicList } from './NormalTopicList';
import { BlogTopicList } from './BlogTopicList';
import { ProjectTopicList } from './ProjectTopicList';
import { GalleryTopicList } from './GalleryTopicList';

interface TopicListRendererProps {
  board: Board;
  topics: Topic[];
  apiOptions: ApiOptions;
  onTopicClick?: (topic: Topic) => void;
}

export function TopicListRenderer({ board, topics, apiOptions, onTopicClick }: TopicListRendererProps) {
  const boardType = (board.type ?? 'normal') as BoardType;

  if (boardType === 'blog') {
    return <BlogTopicList topics={topics} apiOptions={apiOptions} onTopicClick={onTopicClick} />;
  }
  if (boardType === 'project') {
    return <ProjectTopicList topics={topics} apiOptions={apiOptions} onTopicClick={onTopicClick} />;
  }
  if (boardType === 'gallery') {
    return <GalleryTopicList topics={topics} apiOptions={apiOptions} onTopicClick={onTopicClick} />;
  }
  return <NormalTopicList topics={topics} onTopicClick={onTopicClick} />;
}
