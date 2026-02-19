'use client';

import type { ApiOptions } from '../../types/api';
import type { Board } from '../../schemas/board';
import type { PostFormState, PostFormHandlers } from './types';
import { BasePostFormFields } from './BasePostFormFields';
import { BlogPostFormFields } from './BlogPostFormFields';
import { ProjectPostFormFields } from './ProjectPostFormFields';
import { GalleryPostFormFields } from './GalleryPostFormFields';
import type { BoardType } from '../../constants/boardType';

interface PostFormRendererProps {
  board: Board;
  state: PostFormState;
  handlers: PostFormHandlers;
  apiOptions: ApiOptions;
}

export function PostFormRenderer({ board, state, handlers, apiOptions }: PostFormRendererProps) {
  const boardType = (board.type ?? 'normal') as BoardType;

  if (boardType === 'blog') {
    return (
      <>
        <BlogPostFormFields
          apiOptions={apiOptions}
          thumbnailFile={state.thumbnailFile}
          onThumbnailChange={handlers.setThumbnailFile}
          error={state.errors.thumbnailFile}
        />
        <BasePostFormFields boardType={boardType} state={state} handlers={handlers} apiOptions={apiOptions} />
      </>
    );
  }

  if (boardType === 'project') {
    return (
      <>
        <ProjectPostFormFields
          apiOptions={apiOptions}
          images={state.additionalFiles}
          onImagesChange={handlers.setAdditionalFiles}
          mainFileId={state.mainFileId}
          onMainChange={handlers.setMainFileId}
          imagesError={state.errors.images}
        />
        <BasePostFormFields boardType={boardType} state={state} handlers={handlers} apiOptions={apiOptions} />
      </>
    );
  }

  if (boardType === 'gallery') {
    return (
      <>
        <GalleryPostFormFields
          apiOptions={apiOptions}
          images={state.additionalFiles}
          onImagesChange={handlers.setAdditionalFiles}
          mainFileId={state.mainFileId}
          onMainFileIdChange={handlers.setMainFileId}
          content={state.content}
          onContentChange={handlers.setContent}
          imagesError={state.errors.images}
        />
        <BasePostFormFields boardType={boardType} state={state} handlers={handlers} apiOptions={apiOptions} />
      </>
    );
  }

  // normal
  return <BasePostFormFields boardType={boardType} state={state} handlers={handlers} apiOptions={apiOptions} />;
}

// Backward compat alias
export const TopicFormRenderer = PostFormRenderer;
