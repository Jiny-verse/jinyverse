'use client';

import { AutoDialog } from 'common/components';
import type { AutoDialogField } from 'common/components';
import { topicCreateSchema } from 'common/schemas';
import type { TopicCreateInput } from 'common/types';
import { useAuth } from 'common';

export type CreateDialogProps = {
  open: boolean;
  boardId: string;
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
  menuOptions,
  tagOptions,
  onClose,
  onSubmit,
}: CreateDialogProps) {
  const { user } = useAuth();
  const fields: AutoDialogField[] = [
    { key: 'authorUserId', label: '작성자', type: 'uuid', hidden: true },
    { key: 'status', label: '상태', type: 'text', hidden: true, defaultValue: 'created' },
    { key: 'boardId', label: '게시판 ID', type: 'uuid', hidden: true },
    { key: 'title', label: '제목', type: 'text' },
    { key: 'content', label: '내용', type: 'textarea' },
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
  ];

  const initialValues: Partial<TopicCreateInput> = {
    boardId,
    status: 'created',
    authorUserId: user?.userId ?? '',
  };

  const handleSubmit = (values: TopicCreateInput, intent?: string) => {
    const normalized = { ...values };
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
    />
  );
}
