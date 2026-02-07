'use client';

import { AutoDialog } from 'common/components';
import type { AutoDialogField } from 'common/components';
import { topicCreateSchema } from 'common/schemas';
import type { TopicCreateInput } from 'common/types';

export type CreateDialogProps = {
  open: boolean;
  boardId: string;
  statusOptions: { value: string; label: string }[];
  onClose: () => void;
  onSubmit: (values: TopicCreateInput) => void | Promise<void>;
};

export function CreateDialog({ open, boardId, statusOptions, onClose, onSubmit }: CreateDialogProps) {
  const fields: AutoDialogField[] = [
    { key: 'authorUserId', label: '작성자 ID', type: 'uuid' },
    {
      key: 'status',
      label: '상태',
      type: 'select',
      options: statusOptions,
      defaultValue: 'created',
    },
    { key: 'boardId', label: '게시판 ID', type: 'uuid', hidden: true },
    { key: 'title', label: '제목', type: 'text' },
    { key: 'content', label: '내용', type: 'textarea' },
    { key: 'isNotice', label: '공지', type: 'toggle', optional: true },
    { key: 'isPinned', label: '고정', type: 'toggle', optional: true },
    { key: 'isPublic', label: '공개', type: 'toggle', optional: true },
  ];

  return (
    <AutoDialog
      open={open}
      onClose={onClose}
      title="게시글 추가"
      schema={topicCreateSchema}
      fields={fields}
      mode="create"
      initialValues={{ boardId, status: 'created' } as Partial<TopicCreateInput>}
      onSubmit={onSubmit}
    />
  );
}
