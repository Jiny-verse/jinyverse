'use client';

import { z } from 'zod';
import { AutoDialog } from 'common/components';
import type { AutoDialogField } from 'common/components';

const schema = z.object({
  code: z.string().min(1).max(40),
  name: z.string().min(1).max(50),
  isSealed: z.boolean().optional().default(false),
  description: z.string().optional(),
  note: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface CreateCategoryDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: FormValues) => Promise<void>;
}

const fields: AutoDialogField[] = [
  { key: 'code', label: '분류 코드', type: 'text', placeholder: 'e.g. board_type' },
  { key: 'name', label: '분류명', type: 'text' },
  { key: 'isSealed', label: '잠금 (수정/추가 불가)', type: 'toggle', optional: true, defaultValue: false },
  { key: 'description', label: '설명', type: 'textarea', optional: true },
  { key: 'note', label: '비고', type: 'textarea', optional: true },
];

export function CreateCategoryDialog({ open, onClose, onSubmit }: CreateCategoryDialogProps) {
  return (
    <AutoDialog
      open={open}
      onClose={onClose}
      title="분류 추가"
      schema={schema}
      fields={fields}
      mode="create"
      onSubmit={onSubmit}
    />
  );
}
