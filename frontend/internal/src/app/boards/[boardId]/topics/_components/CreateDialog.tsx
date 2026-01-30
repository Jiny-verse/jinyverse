'use client';

import { AutoDialog } from 'common/components';
import type { AutoDialogField } from 'common/components';
import { topicCreateSchema } from 'common/schemas';
import type { TopicCreateInput } from 'common/types';

export type TopicCreateDialogProps = {
  open: boolean;
  boardId: string;
  onClose: () => void;
  onSubmit: (values: TopicCreateInput) => void | Promise<void>;
};

const topicCreateFields: AutoDialogField[] = [
  { key: 'authorUserId', label: '작성자 ID', type: 'uuid' },
  { key: 'statusCategoryCode', label: '상태 분류 코드', type: 'text' },
  { key: 'status', label: '상태', type: 'text' },
  { key: 'boardId', label: '게시판 ID', type: 'uuid', hidden: true },
  { key: 'title', label: '제목', type: 'text' },
  { key: 'content', label: '내용', type: 'textarea' },
  { key: 'isNotice', label: '공지', type: 'checkbox', optional: true },
  { key: 'isPinned', label: '고정', type: 'checkbox', optional: true },
  { key: 'isPublic', label: '공개', type: 'checkbox', optional: true },
];

export function TopicCreateDialog({ open, boardId, onClose, onSubmit }: TopicCreateDialogProps) {
  return (
    <AutoDialog
      open={open}
      onClose={onClose}
      title="게시글 추가"
      schema={topicCreateSchema}
      fields={topicCreateFields}
      mode="create"
      initialValues={{ boardId } as Partial<TopicCreateInput>}
      onSubmit={onSubmit}
    />
  );
}
