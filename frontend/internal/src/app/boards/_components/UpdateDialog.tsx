'use client';

import { AutoDialog } from 'common/components';
import type { AutoDialogField } from 'common/components';
import { boardUpdateSchema } from 'common/schemas';
import type { Board, BoardUpdateInput } from 'common/types';

export type BoardUpdateDialogProps = {
  open: boolean;
  board: Board | null;
  onClose: () => void;
  onSubmit: (values: BoardUpdateInput) => void | Promise<void>;
  typeOptions: { value: string; label: string }[];
};

export function BoardUpdateDialog({ open, board, onClose, onSubmit, typeOptions }: BoardUpdateDialogProps) {
  const fields: AutoDialogField[] = [
    { key: 'typeCategoryCode', label: '타입 분류 코드', type: 'text', hidden: true, defaultValue: 'BOARD_TYPE' },
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
