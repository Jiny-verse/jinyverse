'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { AutoDialog, FileAttachmentField } from 'common/components';
import type { AutoDialogField } from 'common/components';
import { topicCreateSchema } from 'common/schemas';
import type { TopicCreateInput, ApiOptions } from 'common/types';
import type { FileAttachmentItem } from 'common/schemas';
import { createUploadSession, uploadFile, getDownloadUrl } from 'common/services';
import { useAuth } from 'common';

export type CreateDialogProps = {
  open: boolean;
  boardId: string;
  apiOptions: ApiOptions;
  menuOptions: { value: string; label: string }[];
  tagOptions: { value: string; label: string }[];
  onClose: () => void;
  onSubmit: (values: TopicCreateInput, intent?: string) => void | Promise<void>;
};

const TOPIC_SUBMIT_BUTTONS = [
  { label: '임시저장', intent: 'temporary' },
  { label: '확인', intent: 'created' },
] as const;

export function CreateDialog({
  open,
  boardId,
  apiOptions,
  menuOptions,
  tagOptions,
  onClose,
  onSubmit,
}: CreateDialogProps) {
  const { user } = useAuth();
  const [files, setFiles] = useState<FileAttachmentItem[]>([]);
  const [uploadSessionId, setUploadSessionId] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setFiles([]);
      createUploadSession(apiOptions)
        .then((s) => setUploadSessionId(s.sessionId))
        .catch(() => setUploadSessionId(null));
    } else {
      setUploadSessionId(null);
    }
  }, [open, apiOptions.baseUrl, apiOptions.channel]);

  const handleUploadImage = useCallback(
    async (file: File): Promise<string> => {
      const result = await uploadFile(apiOptions, file, uploadSessionId ?? undefined);
      return getDownloadUrl(apiOptions, result.id);
    },
    [apiOptions, uploadSessionId],
  );

  const fields = useMemo<AutoDialogField[]>(
    () => [
      { key: 'authorUserId', label: '작성자', type: 'uuid', hidden: true },
      { key: 'status', label: '상태', type: 'text', hidden: true, defaultValue: 'created' },
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

  const initialValues = useMemo<Partial<TopicCreateInput>>(
    () => ({
      boardId,
      status: 'created',
      authorUserId: user?.userId ?? '',
    }),
    [boardId, user?.userId]
  );

  const handleSubmit = (values: TopicCreateInput, intent?: string) => {
    const normalized = { ...values, files: files.length ? files : undefined };
    if (normalized.isNotice) normalized.isPinned = true;
    return onSubmit(normalized, intent);
  };

  return (
    <AutoDialog
      open={open}
      onClose={onClose}
      title="게시글 추가"
      schema={topicCreateSchema}
      fields={fields}
      mode="create"
      initialValues={initialValues}
      onSubmit={handleSubmit}
      submitButtons={[...TOPIC_SUBMIT_BUTTONS]}
    >
      <div className="mt-2">
        <label className="mb-1 block text-sm font-medium text-gray-700">첨부 파일</label>
        <FileAttachmentField
          apiOptions={apiOptions}
          value={files}
          onChange={setFiles}
          sessionId={uploadSessionId ?? undefined}
        />
      </div>
    </AutoDialog>
  );
}
