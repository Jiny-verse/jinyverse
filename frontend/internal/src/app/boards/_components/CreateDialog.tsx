'use client';

import { AutoDialog } from 'common/components';
import type { AutoDialogField } from 'common/components';
import { boardCreateSchema } from 'common/schemas';
import { useBoardContext } from '../_hooks/useBoardContext';

const BOARD_TYPE_CATEGORY = 'BOARD_TYPE';

export interface CreateDialogProps {
  typeOptions: { value: string; label: string }[];
}

export function CreateDialog({ typeOptions }: CreateDialogProps) {
  const domain = useBoardContext();
  const { open, onClose, onSubmit } = domain.dialogs.create;
  const fields: AutoDialogField[] = [
    {
      key: 'typeCategoryCode',
      label: '타입 분류 코드',
      type: 'text',
      hidden: true,
      defaultValue: BOARD_TYPE_CATEGORY,
    },
    {
      key: 'type',
      label: '타입',
      type: 'select',
      options: [{ value: '', label: '선택하세요' }, ...typeOptions],
    },
    { key: 'name', label: '이름', type: 'text' },
    { key: 'description', label: '설명', type: 'textarea', optional: true },
    { key: 'note', label: '비고', type: 'textarea', optional: true },
    { key: 'isPublic', label: '공개 여부', type: 'toggle', optional: true },
    { key: 'order', label: '정렬 순서', type: 'number', optional: true },
  ];

  return (
    <AutoDialog
      open={open}
      onClose={onClose}
      title="게시판 추가"
      schema={boardCreateSchema}
      fields={fields}
      mode="create"
      onSubmit={onSubmit}
    />
  );
}
