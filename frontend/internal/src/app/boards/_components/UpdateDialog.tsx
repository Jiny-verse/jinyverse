'use client';

import { AutoDialog } from 'common/components';
import type { AutoDialogField } from 'common/components';
import { boardUpdateSchema } from 'common/schemas';
import { useBoardContext } from '../_hooks/useBoardContext';

export interface UpdateDialogProps {
  typeOptions: { value: string; label: string }[];
}

export function UpdateDialog({ typeOptions }: UpdateDialogProps) {
  const domain = useBoardContext();
  const { open, board, onClose, onSubmit } = domain.dialogs.update;
  const fields: AutoDialogField[] = [
    {
      key: 'typeCategoryCode',
      label: '타입 분류 코드',
      type: 'text',
      hidden: true,
      defaultValue: 'BOARD_TYPE',
    },
    { key: 'type', label: '타입', type: 'select', options: typeOptions },
    { key: 'name', label: '이름', type: 'text' },
    { key: 'description', label: '설명', type: 'textarea', optional: true },
    { key: 'note', label: '비고', type: 'textarea', optional: true },
    { key: 'isPublic', label: '공개 여부', type: 'toggle', optional: true },
    { key: 'order', label: '정렬 순서', type: 'number', optional: true },
  ];

  const initialValues = board
    ? {
        typeCategoryCode: board.typeCategoryCode,
        type: board.type,
        name: board.name,
        description: board.description ?? undefined,
        note: board.note ?? undefined,
        isPublic: board.isPublic ?? undefined,
        order: board.order ?? undefined,
      }
    : undefined;

  return (
    <AutoDialog
      open={open}
      onClose={onClose}
      title="게시판 수정"
      schema={boardUpdateSchema}
      fields={fields}
      mode="edit"
      initialValues={initialValues}
      onSubmit={onSubmit}
    />
  );
}
