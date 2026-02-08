'use client';

import { AutoDialog } from 'common/components';
import type { AutoDialogField } from 'common/components';
import { topicUpdateSchema } from 'common/schemas';
import type { Topic, TopicUpdateInput } from 'common/types';

export type UpdateDialogProps = {
  open: boolean;
  topic: Topic | null;
  statusOptions: { value: string; label: string }[];
  onClose: () => void;
  onSubmit: (values: TopicUpdateInput) => void | Promise<void>;
};

export function UpdateDialog({ open, topic, statusOptions, onClose, onSubmit }: UpdateDialogProps) {
  const fields: AutoDialogField[] = [
    { key: 'authorUserId', label: '작성자 ID', type: 'uuid' },
    { key: 'status', label: '상태', type: 'select', options: statusOptions },
    { key: 'boardId', label: '게시판 ID', type: 'uuid', hidden: true },
    { key: 'title', label: '제목', type: 'text' },
    { key: 'content', label: '내용', type: 'textarea' },
    { key: 'isNotice', label: '공지', type: 'toggle', optional: true },
    { key: 'isPinned', label: '고정', type: 'toggle', optional: true },
    { key: 'isPublic', label: '공개', type: 'toggle', optional: true },
  ];

  const initialValues = topic
    ? {
        authorUserId: topic.authorUserId,
        status: topic.status,
        boardId: topic.boardId,
        title: topic.title,
        content: topic.content,
        isNotice: topic.isNotice ?? undefined,
        isPinned: topic.isPinned ?? undefined,
        isPublic: topic.isPublic ?? undefined,
      }
    : undefined;

  return (
    <AutoDialog
      open={open}
      onClose={onClose}
      title="게시글 수정"
      schema={topicUpdateSchema}
      fields={fields}
      mode="edit"
      initialValues={initialValues}
      onSubmit={onSubmit}
    />
  );
}
