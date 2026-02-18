'use client';

import { z } from 'zod';
import { AutoDialog } from 'common/components';
import type { AutoDialogField } from 'common/components';
import type { CodeCategory } from 'common/services';

const schema = z.object({
  name: z.string().min(1).max(50),
  isSealed: z.boolean().optional(),
  description: z.string().optional(),
  note: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface UpdateCategoryDialogProps {
  open: boolean;
  target: CodeCategory | null;
  onClose: () => void;
  onSubmit: (data: FormValues) => Promise<void>;
}

const fields: AutoDialogField[] = [
  { key: 'name', label: '분류명', type: 'text' },
  { key: 'isSealed', label: '잠금 (수정/추가 불가)', type: 'toggle', optional: true },
  { key: 'description', label: '설명', type: 'textarea', optional: true },
  { key: 'note', label: '비고', type: 'textarea', optional: true },
];

export function UpdateCategoryDialog({ open, target, onClose, onSubmit }: UpdateCategoryDialogProps) {
  const initialValues = target
    ? {
        name: target.name,
        isSealed: target.isSealed,
        description: target.description ?? undefined,
        note: target.note ?? undefined,
      }
    : undefined;

  return (
    <AutoDialog
      open={open}
      onClose={onClose}
      title="분류 수정"
      schema={schema}
      fields={fields}
      mode="edit"
      initialValues={initialValues}
      onSubmit={onSubmit}
    />
  );
}
