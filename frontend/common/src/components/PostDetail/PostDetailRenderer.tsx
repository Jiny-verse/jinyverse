'use client';

import type { ApiOptions } from '../../types/api';
import type { Board } from '../../schemas/board';
import type { Topic } from '../../schemas/topic';
import type { BoardType } from '../../constants/boardType';
import { NormalPostDetail } from './NormalPostDetail';
import { BlogPostDetail } from './BlogPostDetail';
import { ProjectPostDetail } from './ProjectPostDetail';
import { GalleryPostDetail } from './GalleryPostDetail';

interface PostDetailRendererProps {
  board: Board;
  topic: Topic;
  apiOptions: ApiOptions;
}

export function PostDetailRenderer({ board, topic, apiOptions }: PostDetailRendererProps) {
  const boardType = (board.type ?? 'normal') as BoardType;

  if (boardType === 'gallery') {
    return <GalleryPostDetail topic={topic} apiOptions={apiOptions} />;
  }
  if (boardType === 'blog') {
    return <BlogPostDetail topic={topic} apiOptions={apiOptions} />;
  }
  if (boardType === 'project') {
    return <ProjectPostDetail topic={topic} apiOptions={apiOptions} />;
  }
  return <NormalPostDetail topic={topic} apiOptions={apiOptions} />;
}
