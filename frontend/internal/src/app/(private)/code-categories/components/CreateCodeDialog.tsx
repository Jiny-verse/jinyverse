'use client';

import { z } from 'zod';
import { AutoDialog } from 'common/components';
import type { AutoDialogField } from 'common/components';

const schema = z.object({
  code: z.string().min(1).max(40),
  name: z.string().min(1).max(50),
  value: z.string().optional(),
  description: z.string().optional(),
  note: z.string().optional(),
  order: z.number().int().optional(),
});

type FormValues = z.infer<typeof schema>;

interface CreateCodeDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: FormValues) => Promise<void>;
}

const fields: AutoDialogField[] = [
  { key: 'code', label: '코드', type: 'text', placeholder: 'e.g. active' },
  { key: 'name', label: '이름', type: 'text' },
  { key: 'value', label: '값', type: 'text', optional: true },
  { key: 'order', label: '정렬 순서', type: 'number', optional: true },
  { key: 'description', label: '설명', type: 'textarea', optional: true },
  { key: 'note', label: '비고', type: 'textarea', optional: true },
];

export function CreateCodeDialog({ open, onClose, onSubmit }: CreateCodeDialogProps) {
  return (
    <AutoDialog
      open={open}
      onClose={onClose}
      title="코드 추가"
      schema={schema}
      fields={fields}
      mode="create"
      onSubmit={onSubmit}
    />
  );
}
