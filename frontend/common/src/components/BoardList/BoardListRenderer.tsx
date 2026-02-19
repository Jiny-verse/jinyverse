'use client';

import type { ApiOptions } from '../../types/api';
import type { Board } from '../../schemas/board';
import type { Topic } from '../../schemas/topic';
import type { BoardType } from '../../constants/boardType';
import { NormalBoardList } from './NormalBoardList';
import { BlogBoardList } from './BlogBoardList';
import { ProjectBoardList } from './ProjectBoardList';
import { GalleryBoardList } from './GalleryBoardList';

interface BoardListRendererProps {
  board: Board;
  topics: Topic[];
  apiOptions: ApiOptions;
  onTopicClick?: (topic: Topic) => void;
}

export function BoardListRenderer({ board, topics, apiOptions, onTopicClick }: BoardListRendererProps) {
  const boardType = (board.type ?? 'normal') as BoardType;

  if (boardType === 'blog') {
    return <BlogBoardList topics={topics} apiOptions={apiOptions} onTopicClick={onTopicClick} />;
  }
  if (boardType === 'project') {
    return <ProjectBoardList topics={topics} apiOptions={apiOptions} onTopicClick={onTopicClick} />;
  }
  if (boardType === 'gallery') {
    return <GalleryBoardList topics={topics} apiOptions={apiOptions} onTopicClick={onTopicClick} />;
  }
  return <NormalBoardList topics={topics} onTopicClick={onTopicClick} />;
}
