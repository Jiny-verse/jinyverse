import type { FileAttachmentItem } from '../../schemas/file';

export interface PostFormState {
  title: string;
  content: string;
  isPublic: boolean;
  isNotice: boolean;
  isPinned: boolean;
  tags: string[];
  thumbnailFile: FileAttachmentItem | null;
  additionalFiles: FileAttachmentItem[];
  mainFileId: string | null;
  publishedAt: string;
  errors: Record<string, string>;
  isSaving: boolean;
  isDraftSaving: boolean;
}

export interface PostFormHandlers {
  setTitle: (v: string) => void;
  setContent: (v: string) => void;
  setIsPublic: (v: boolean) => void;
  setIsNotice: (v: boolean) => void;
  setIsPinned: (v: boolean) => void;
  setTags: (v: string[]) => void;
  setThumbnailFile: (v: FileAttachmentItem | null) => void;
  setAdditionalFiles: (v: FileAttachmentItem[]) => void;
  setMainFileId: (id: string | null) => void;
  setPublishedAt: (v: string) => void;
}

// Backward compat aliases
export type TopicFormState = PostFormState;
export type TopicFormHandlers = PostFormHandlers;
