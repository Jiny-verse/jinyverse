'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FormContainer } from '../Form/FormContainer';
import { FormSection } from '../Form/FormSection';
import { FormField } from '../Form/FormField';
import { FormActions } from '../Form/FormActions';
import { FileAttachmentField } from '../File/FileAttachmentField';
import { PostFormRenderer } from '../PostForm/PostFormRenderer';
import { createTopic, updateTopic, getTags, createTag } from '../../services';
import { useAuth } from '../../providers/AuthProvider';
import type { Topic, TopicCreateInput } from '../../schemas/topic';
import type { FileAttachmentItem } from '../../schemas/file';
import type { Board } from '../../schemas/board';
import type { PostFormState, PostFormHandlers } from '../PostForm/types';
import type { BoardType } from '../../constants/boardType';
import type { ApiOptions } from '../../types/api';
import useLanguage from '../../utils/i18n/hooks/useLanguage';

export interface TopicFormProps {
  mode: 'create' | 'edit';
  board: Board;
  apiOptions: ApiOptions;
  topicId?: string;
  initialData?: Partial<Topic>;
  onSuccess?: (topicId: string) => void;
  onCancel?: () => void;
  onDraftSaved?: (topicId: string) => void;
}

export function TopicForm({
  mode,
  board,
  apiOptions,
  topicId,
  initialData,
  onSuccess,
  onCancel,
  onDraftSaved,
}: TopicFormProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useLanguage();
  const boardType = (board.type ?? 'normal') as BoardType;

  // Form state
  const [title, setTitle] = useState(initialData?.title || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [isPublic, setIsPublic] = useState(initialData?.isPublic ?? true);
  const [isNotice, setIsNotice] = useState(initialData?.isNotice ?? false);
  const [isPinned, setIsPinned] = useState(initialData?.isPinned ?? false);
  const [tags, setTags] = useState<string[]>(initialData?.tags?.map((tag) => tag.name) || []);
  const [publishedAt, setPublishedAt] = useState(initialData?.publishedAt || '');

  // 기본 파일 첨부 (normal 타입)
  const [files, setFiles] = useState<FileAttachmentItem[]>(
    boardType === 'normal'
      ? initialData?.files?.map((f) => ({ fileId: f.fileId, order: f.order, isMain: f.isMain })) || []
      : []
  );

  // 썸네일/커버 파일 (blog/project 대표이미지) — 단일값
  const [thumbnailFile, setThumbnailFile] = useState<FileAttachmentItem | null>(() => {
    const main = initialData?.files?.find((f) => f.isMain);
    if (!main || boardType === 'gallery' || boardType === 'project') return null;
    return { fileId: main.fileId, order: main.order, isMain: true };
  });

  // 갤러리/프로젝트 추가 이미지
  const [additionalFiles, setAdditionalFiles] = useState<FileAttachmentItem[]>(() => {
    if (boardType === 'gallery' || boardType === 'project') {
      return initialData?.files?.map((f) => ({ fileId: f.fileId, order: f.order, isMain: f.isMain })) || [];
    }
    return [];
  });

  // 갤러리/프로젝트 대표 이미지 fileId
  const [mainFileId, setMainFileId] = useState<string | null>(() => {
    if (boardType === 'gallery' || boardType === 'project') {
      return initialData?.files?.find((f) => f.isMain)?.fileId ?? null;
    }
    return null;
  });

  // UI state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isDraftSaving, setIsDraftSaving] = useState(false);

  const state: PostFormState = {
    title,
    content,
    isPublic,
    isNotice,
    isPinned,
    tags,
    thumbnailFile,
    additionalFiles,
    mainFileId,
    publishedAt,
    errors,
    isSaving,
    isDraftSaving,
  };

  const handlers: PostFormHandlers = {
    setTitle,
    setContent,
    setIsPublic,
    setIsNotice,
    setIsPinned,
    setTags,
    setThumbnailFile,
    setAdditionalFiles,
    setMainFileId,
    setPublishedAt,
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = t('validation.required');
    } else if (title.length > 200) {
      newErrors.title = t('validation.maxLength', { max: 200 });
    }

    if (boardType !== 'gallery' && !content.trim()) {
      newErrors.content = t('validation.required');
    }

    if ((boardType === 'project' || boardType === 'gallery') && additionalFiles.length === 0) {
      newErrors.images = t('validation.minLength', { min: 1 });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const buildFiles = (): FileAttachmentItem[] => {
    if (boardType === 'normal') {
      return files;
    }
    if (boardType === 'gallery' || boardType === 'project') {
      return additionalFiles.map((f, i) => ({
        fileId: f.fileId,
        order: i,
        isMain: f.fileId === mainFileId,
      }));
    }
    // blog: thumbnailFile(isMain=true)
    const result: FileAttachmentItem[] = [];
    if (thumbnailFile) {
      result.push({ fileId: thumbnailFile.fileId, order: 0, isMain: true });
    }
    return result;
  };

  const resolveTagIds = async (tagNames: string[]): Promise<string[]> => {
    if (!tagNames.length) return [];
    const ids: string[] = [];
    for (const name of tagNames) {
      const result = await getTags(apiOptions, { q: name, size: 20 });
      const existing = result.content.find(
        (tag) => tag.name.toLowerCase() === name.toLowerCase()
      );
      if (existing) {
        ids.push(existing.id);
      } else {
        const created = await createTag(apiOptions, { name });
        ids.push(created.id);
      }
    }
    return ids;
  };

  const saveTopic = async (status: string) => {
    if (!validateForm()) return;

    if (status === 'created') setIsSaving(true);
    else setIsDraftSaving(true);

    try {
      const tagIds = await resolveTagIds(tags);

      const payload: TopicCreateInput = {
        authorUserId: user?.userId || '',
        boardId: board.id,
        title: title.trim(),
        content: boardType === 'gallery' && !content.trim() ? '' : content.trim(),
        isNotice,
        isPinned,
        isPublic,
        status,
        publishedAt: publishedAt || undefined,
        tagIds: tagIds.length ? tagIds : undefined,
        files: buildFiles(),
      };

      let resultId: string;

      if (mode === 'create') {
        const result = await createTopic(apiOptions, payload);
        resultId = result.id;
      } else {
        const result = await updateTopic(apiOptions, topicId!, payload);
        resultId = result.id;
      }

      if (status === 'created') {
        onSuccess?.(resultId);
      } else {
        if (onDraftSaved) {
          onDraftSaved(resultId);
        } else if (mode === 'create') {
          router.push(`/boards/${board.id}/topics/${resultId}/edit`);
        }
      }
    } catch (error: any) {
      console.error('Failed to save topic:', error);
      setErrors({ submit: error.message || t('message.error') });
    } finally {
      setIsSaving(false);
      setIsDraftSaving(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      router.back();
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <FormContainer
        onSubmit={(e) => {
          e.preventDefault();
          saveTopic('created');
        }}
        disabled={isSaving || isDraftSaving}
      >
        <PostFormRenderer board={board} state={state} handlers={handlers} apiOptions={apiOptions} />

        {boardType === 'normal' && (
          <FormSection title={t('file.attachFile')} description="파일을 첨부하세요">
            <FormField label={t('form.label.file')} name="files" description="드래그 앤 드롭 지원">
              <FileAttachmentField
                apiOptions={apiOptions}
                value={files}
                onChange={setFiles}
                multiple={true}
              />
            </FormField>
          </FormSection>
        )}

        {errors.submit && (
          <div className="p-3 bg-red-100 border border-red-200 text-red-700 rounded text-sm mb-4">
            {errors.submit}
          </div>
        )}

        <FormActions
          submitLabel={mode === 'create' ? t('post.create') : t('post.edit')}
          onCancel={handleCancel}
          isSubmitting={isSaving}
          extraActions={
            boardType !== 'gallery' ? (
              <button
                type="button"
                onClick={() => saveTopic('temporary')}
                disabled={isSaving || isDraftSaving}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
              >
                {isDraftSaving ? t('common.saving') : t('post.saveDraft')}
              </button>
            ) : undefined
          }
        />
      </FormContainer>
    </div>
  );
}
