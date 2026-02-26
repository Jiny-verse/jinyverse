'use client';

import { z } from 'zod';
import { AutoDialog } from 'common/components';
import type { AutoDialogField } from 'common/components';
import type { CodeCategory } from 'common/services';
import { useLanguage } from 'common/utils';

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

export function UpdateCategoryDialog({ open, target, onClose, onSubmit }: UpdateCategoryDialogProps) {
  const { t } = useLanguage();

  const fields: AutoDialogField[] = [
    { key: 'name', label: t('form.label.categoryName'), type: 'text' },
    { key: 'isSealed', label: t('form.label.isSealed'), type: 'toggle', optional: true },
    { key: 'description', label: t('form.label.description'), type: 'textarea', optional: true },
    { key: 'note', label: t('form.label.note'), type: 'textarea', optional: true },
  ];

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
      title={t('admin.category.edit')}
      schema={schema}
      fields={fields}
      mode="edit"
      initialValues={initialValues}
      onSubmit={onSubmit}
    />
  );
}
