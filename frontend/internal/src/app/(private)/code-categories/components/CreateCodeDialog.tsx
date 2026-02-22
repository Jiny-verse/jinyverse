'use client';

import { z } from 'zod';
import { AutoDialog } from 'common/components';
import type { AutoDialogField } from 'common/components';
import { useLanguage } from 'common/utils';

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

export function CreateCodeDialog({ open, onClose, onSubmit }: CreateCodeDialogProps) {
  const { t } = useLanguage();

  const fields: AutoDialogField[] = [
    { key: 'code', label: t('form.label.code'), type: 'text', placeholder: 'e.g. active' },
    { key: 'name', label: t('form.label.name'), type: 'text' },
    { key: 'value', label: t('form.label.value'), type: 'text', optional: true },
    { key: 'order', label: t('form.label.sortOrder'), type: 'number', optional: true },
    { key: 'description', label: t('form.label.description'), type: 'textarea', optional: true },
    { key: 'note', label: t('form.label.note'), type: 'textarea', optional: true },
  ];

  return (
    <AutoDialog
      open={open}
      onClose={onClose}
      title={t('admin.code.add')}
      schema={schema}
      fields={fields}
      mode="create"
      onSubmit={onSubmit}
    />
  );
}
