'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  FormContainer,
  FormSection,
  FormField,
  FormActions,
  FileAttachmentField,
  PostFormRenderer,
} from 'common/components';
import { createTopic, updateTopic, getTags, createTag } from 'common/services';
import { useApiOptions } from '@/app/providers/ApiProvider';
import { useAuth } from 'common';
import type { Topic, TopicCreateInput, FileAttachmentItem, Board } from 'common/schemas';
import type { PostFormState, PostFormHandlers } from 'common/components';
import type { BoardType } from 'common/constants';

interface TopicFormProps {
  mode: 'create' | 'edit';
  board: Board;
  topicId?: string;
  initialData?: Partial<Topic>;
  onSuccess?: (topicId: string) => void;
  onCancel?: () => void;
}

export function TopicForm({
  mode,
  board,
  topicId,
  initialData,
  onSuccess,
  onCancel,
}: TopicFormProps) {
  const router = useRouter();
  const apiOptions = useApiOptions();
  const { user } = useAuth();
  const boardType = (board.type ?? 'normal') as BoardType;

  // Form state
  const [title, setTitle] = useState(initialData?.title || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [isPublic, setIsPublic] = useState(initialData?.isPublic ?? true);
  const [isNotice, setIsNotice] = useState(initialData?.isNotice ?? false);
  const [isPinned, setIsPinned] = useState(initialData?.isPinned ?? false);
  const [tags, setTags] = useState<string[]>(initialData?.tags?.map((t) => t.name) || []);
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
      newErrors.title = '제목을 입력하세요';
    } else if (title.length > 200) {
      newErrors.title = '제목은 최대 200자까지 입력 가능합니다';
    }

    if (boardType !== 'gallery' && !content.trim()) {
      newErrors.content = '내용을 입력하세요';
    }

    if ((boardType === 'project' || boardType === 'gallery') && additionalFiles.length === 0) {
      newErrors.images = '이미지를 최소 1장 등록하세요';
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
        (t) => t.name.toLowerCase() === name.toLowerCase()
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
        if (mode === 'create') {
          router.push(`/boards/${board.id}/topics/${resultId}/edit`);
        }
      }
    } catch (error: any) {
      console.error('Failed to save topic:', error);
      setErrors({ submit: error.message || '저장에 실패했습니다. 다시 시도해주세요.' });
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
          <FormSection title="파일 첨부" description="파일을 첨부하세요">
            <FormField label="파일" name="files" description="드래그 앤 드롭 지원">
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
          submitLabel={mode === 'create' ? '게시' : '수정 완료'}
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
                {isDraftSaving ? '저장 중...' : '임시저장'}
              </button>
            ) : undefined
          }
        />
      </FormContainer>
    </div>
  );
}
