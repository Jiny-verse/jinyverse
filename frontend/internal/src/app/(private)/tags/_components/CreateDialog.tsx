'use client';

import { AutoDialog } from 'common/components';
import type { AutoDialogField } from 'common/components';
import { tagCreateSchema } from 'common/schemas';
import { useLanguage } from 'common/utils';
import { useTagContext } from '../_hooks/useTagContext';

export interface CreateDialogProps {
  usageOptions: { value: string; label: string }[];
}

export function CreateDialog({ usageOptions }: CreateDialogProps) {
  const { t } = useLanguage();
  const domain = useTagContext();
  const { open, onClose, onSubmit } = domain.dialogs.create;
  const fields: AutoDialogField[] = [
    { key: 'name', label: t('form.label.tagName'), type: 'text' },
    { key: 'description', label: t('form.label.description'), type: 'textarea', optional: true },
    {
      key: 'usage',
      label: t('form.label.usage'),
      type: 'select',
      options: usageOptions,
      defaultValue: 'topic',
    },
  ];

  return (
    <AutoDialog
      open={open}
      onClose={onClose}
      title={t('admin.tag.create')}
      schema={tagCreateSchema}
      fields={fields}
      mode="create"
      onSubmit={onSubmit}
    />
  );
}
