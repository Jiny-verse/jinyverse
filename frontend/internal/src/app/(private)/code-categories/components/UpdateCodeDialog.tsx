'use client';

import { z } from 'zod';
import { AutoDialog } from 'common/components';
import type { AutoDialogField } from 'common/components';
import type { Code } from 'common/services';

const schema = z.object({
  name: z.string().min(1).max(50),
  value: z.string().optional(),
  description: z.string().optional(),
  note: z.string().optional(),
  order: z.number().int().optional(),
});

type FormValues = z.infer<typeof schema>;

interface UpdateCodeDialogProps {
  open: boolean;
  target: Code | null;
  onClose: () => void;
  onSubmit: (data: FormValues) => Promise<void>;
}

const fields: AutoDialogField[] = [
  { key: 'name', label: '이름', type: 'text' },
  { key: 'value', label: '값', type: 'text', optional: true },
  { key: 'order', label: '정렬 순서', type: 'number', optional: true },
  { key: 'description', label: '설명', type: 'textarea', optional: true },
  { key: 'note', label: '비고', type: 'textarea', optional: true },
];

export function UpdateCodeDialog({ open, target, onClose, onSubmit }: UpdateCodeDialogProps) {
  const initialValues = target
    ? {
        name: target.name,
        value: target.value ?? undefined,
        order: target.order ?? undefined,
        description: target.description ?? undefined,
        note: target.note ?? undefined,
      }
    : undefined;

  return (
    <AutoDialog
      open={open}
      onClose={onClose}
      title="코드 수정"
      schema={schema}
      fields={fields}
      mode="edit"
      initialValues={initialValues}
      onSubmit={onSubmit}
    />
  );
}
