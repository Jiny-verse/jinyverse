'use client';

import { z } from 'zod';
import { AutoDialog } from 'common/components';
import type { AutoDialogField } from 'common/components';
import { useLanguage } from 'common/utils';

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

export function CreateCategoryDialog({ open, onClose, onSubmit }: CreateCategoryDialogProps) {
  const { t } = useLanguage();

  const fields: AutoDialogField[] = [
    { key: 'code', label: t('form.label.categoryCode'), type: 'text', placeholder: 'e.g. board_type' },
    { key: 'name', label: t('form.label.categoryName'), type: 'text' },
    { key: 'isSealed', label: t('form.label.isSealed'), type: 'toggle', optional: true, defaultValue: false },
    { key: 'description', label: t('form.label.description'), type: 'textarea', optional: true },
    { key: 'note', label: t('form.label.note'), type: 'textarea', optional: true },
  ];

  return (
    <AutoDialog
      open={open}
      onClose={onClose}
      title={t('admin.category.add')}
      schema={schema}
      fields={fields}
      mode="create"
      onSubmit={onSubmit}
    />
  );
}
