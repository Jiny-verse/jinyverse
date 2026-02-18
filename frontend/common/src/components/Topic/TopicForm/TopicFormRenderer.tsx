'use client';

import type { ApiOptions } from '../../../types/api';
import type { Board } from '../../../schemas/board';
import type { TopicFormState, TopicFormHandlers } from './types';
import { BaseTopicFormFields } from './BaseTopicFormFields';
import { BlogTopicFormFields } from './BlogTopicFormFields';
import { ProjectTopicFormFields } from './ProjectTopicFormFields';
import { GalleryTopicFormFields } from './GalleryTopicFormFields';
import type { BoardType } from '../../../constants/boardType';

interface TopicFormRendererProps {
  board: Board;
  state: TopicFormState;
  handlers: TopicFormHandlers;
  apiOptions: ApiOptions;
}

export function TopicFormRenderer({ board, state, handlers, apiOptions }: TopicFormRendererProps) {
  const boardType = (board.type ?? 'normal') as BoardType;

  return (
    <>
      <BaseTopicFormFields boardType={boardType} state={state} handlers={handlers} />

      {boardType === 'blog' && (
        <BlogTopicFormFields
          apiOptions={apiOptions}
          thumbnailFile={state.thumbnailFile}
          onThumbnailChange={handlers.setThumbnailFile}
        />
      )}

      {boardType === 'project' && (
        <ProjectTopicFormFields
          apiOptions={apiOptions}
          thumbnailFile={state.thumbnailFile}
          onThumbnailChange={handlers.setThumbnailFile}
        />
      )}

      {boardType === 'gallery' && (
        <GalleryTopicFormFields
          apiOptions={apiOptions}
          thumbnailFile={state.thumbnailFile}
          additionalFiles={state.additionalFiles}
          onThumbnailChange={handlers.setThumbnailFile}
          onAdditionalFilesChange={handlers.setAdditionalFiles}
          thumbnailError={state.errors.thumbnailFile}
        />
      )}
    </>
  );
}
