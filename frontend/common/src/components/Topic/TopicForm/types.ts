import type { FileAttachmentItem } from '../../../schemas/file';

export interface TopicFormState {
  title: string;
  content: string;
  isPublic: boolean;
  isNotice: boolean;
  isPinned: boolean;
  tags: string[];
  thumbnailFile: FileAttachmentItem[];
  additionalFiles: FileAttachmentItem[];
  publishedAt: string;
  errors: Record<string, string>;
  isSaving: boolean;
  isDraftSaving: boolean;
}

export interface TopicFormHandlers {
  setTitle: (v: string) => void;
  setContent: (v: string) => void;
  setIsPublic: (v: boolean) => void;
  setIsNotice: (v: boolean) => void;
  setIsPinned: (v: boolean) => void;
  setTags: (v: string[]) => void;
  setThumbnailFile: (v: FileAttachmentItem[]) => void;
  setAdditionalFiles: (v: FileAttachmentItem[]) => void;
  setPublishedAt: (v: string) => void;
}
