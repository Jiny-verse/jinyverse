'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { AutoDialog, FileAttachmentField } from 'common/components';
import type { AutoDialogField } from 'common/components';
import { topicUpdateSchema } from 'common/schemas';
import type { Topic, TopicUpdateInput, ApiOptions } from 'common/types';
import type { FileAttachmentItem } from 'common/schemas';
import { uploadFile, getDownloadUrl } from 'common/services';

const TOPIC_SUBMIT_BUTTONS = [
  { label: '임시저장', intent: 'temporary' },
  { label: '확인', intent: 'created' },
] as const;

export type UpdateDialogProps = {
  open: boolean;
  topic: Topic | null;
  apiOptions: ApiOptions;
  menuOptions: { value: string; label: string }[];
  tagOptions: { value: string; label: string }[];
  onClose: () => void;
  onSubmit: (values: TopicUpdateInput, intent?: string) => void | Promise<void>;
};

export function UpdateDialog({
  open,
  topic,
  apiOptions,
  menuOptions,
  tagOptions,
  onClose,
  onSubmit,
}: UpdateDialogProps) {
  const [files, setFiles] = useState<FileAttachmentItem[]>([]);

  const handleUploadImage = useCallback(
    async (file: File): Promise<string> => {
      const result = await uploadFile(apiOptions, file);
      return getDownloadUrl(apiOptions, result.id);
    },
    [apiOptions],
  );

  useEffect(() => {
    if (topic?.files?.length) {
      setFiles(
        topic.files.map((f) => ({
          fileId: f.fileId,
          order: f.order,
          isMain: f.isMain,
        }))
      );
    } else {
      setFiles([]);
    }
  }, [open, topic?.id, topic?.files]);

  const fields = useMemo<AutoDialogField[]>(
    () => [
      { key: 'status', label: '상태', type: 'text', hidden: true },
      { key: 'boardId', label: '게시판 ID', type: 'uuid', hidden: true },
      { key: 'title', label: '제목', type: 'text' },
      { key: 'content', label: '내용', type: 'editor', onUploadImage: handleUploadImage },
      {
        key: 'menuCode',
        label: '연동 메뉴',
        type: 'select',
        options: menuOptions,
        optional: true,
      },
      { key: 'tagIds', label: '태그', type: 'chipSelect', options: tagOptions, optional: true },
      { key: 'isNotice', label: '공지', type: 'toggle', optional: true },
      { key: 'isPinned', label: '고정', type: 'toggle', optional: true },
      { key: 'isPublic', label: '공개', type: 'toggle', optional: true },
    ],
    [menuOptions, tagOptions, handleUploadImage]
  );

  const initialValues = useMemo(
    () =>
      topic
        ? {
            status: topic.status,
            boardId: topic.boardId,
            title: topic.title,
            content: topic.content,
            menuCode: topic.menuCode ?? '',
            tagIds: (topic.tags ?? []).map((t) => t.id),
            isNotice: topic.isNotice ?? undefined,
            isPinned: topic.isPinned ?? undefined,
            isPublic: topic.isPublic ?? undefined,
          }
        : undefined,
    [topic]
  );

  const handleSubmit = (values: TopicUpdateInput, intent?: string) => {
    const normalized = { ...values, files };
    if (normalized.isNotice) normalized.isPinned = true;
    return onSubmit(normalized, intent);
  };

  return (
    <AutoDialog
      open={open}
      onClose={onClose}
      title="게시글 수정"
      schema={topicUpdateSchema}
      fields={fields}
      mode="edit"
      initialValues={initialValues}
      onSubmit={handleSubmit}
      submitButtons={[...TOPIC_SUBMIT_BUTTONS]}
    >
      <div className="mt-2">
        <label className="mb-1 block text-sm font-medium text-gray-700">첨부 파일</label>
        <FileAttachmentField apiOptions={apiOptions} value={files} onChange={setFiles} />
      </div>
    </AutoDialog>
  );
}
