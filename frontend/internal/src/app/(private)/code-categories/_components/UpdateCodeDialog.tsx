'use client';

import { z } from 'zod';
import { AutoDialog } from 'common/components';
import type { AutoDialogField } from 'common/components';
import type { Code } from 'common/services';
import { useLanguage } from 'common/utils';

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

export function UpdateCodeDialog({ open, target, onClose, onSubmit }: UpdateCodeDialogProps) {
  const { t } = useLanguage();

  const fields: AutoDialogField[] = [
    { key: 'name', label: t('form.label.name'), type: 'text' },
    { key: 'value', label: t('form.label.value'), type: 'text', optional: true },
    { key: 'order', label: t('form.label.sortOrder'), type: 'number', optional: true },
    { key: 'description', label: t('form.label.description'), type: 'textarea', optional: true },
    { key: 'note', label: t('form.label.note'), type: 'textarea', optional: true },
  ];

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
      title={t('admin.code.edit')}
      schema={schema}
      fields={fields}
      mode="edit"
      initialValues={initialValues}
      onSubmit={onSubmit}
    />
  );
}
