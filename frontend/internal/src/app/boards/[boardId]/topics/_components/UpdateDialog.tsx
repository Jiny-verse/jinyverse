'use client';

import { AutoDialog } from 'common/components';
import type { AutoDialogField } from 'common/components';
import { topicUpdateSchema } from 'common/schemas';
import type { Topic, TopicUpdateInput } from 'common/types';

const topicUpdateFields: AutoDialogField[] = [
  { key: 'authorUserId', label: '작성자 ID', type: 'uuid' },
  { key: 'statusCategoryCode', label: '상태 분류 코드', type: 'text' },
  { key: 'status', label: '상태', type: 'text' },
  { key: 'boardId', label: '게시판 ID', type: 'uuid' },
  { key: 'title', label: '제목', type: 'text' },
  { key: 'content', label: '내용', type: 'textarea' },
  { key: 'isNotice', label: '공지', type: 'checkbox', optional: true },
  { key: 'isPinned', label: '고정', type: 'checkbox', optional: true },
  { key: 'isPublic', label: '공개', type: 'checkbox', optional: true },
];

export type UpdateDialogProps = {
  open: boolean;
  topic: Topic | null;
  onClose: () => void;
  onSubmit: (values: TopicUpdateInput) => void | Promise<void>;
};

export function UpdateDialog({ open, topic, onClose, onSubmit }: UpdateDialogProps) {
  const initialValues = topic
    ? {
        authorUserId: topic.authorUserId,
        statusCategoryCode: topic.statusCategoryCode,
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
      fields={topicUpdateFields}
      mode="edit"
      initialValues={initialValues}
      onSubmit={onSubmit}
    />
  );
}
