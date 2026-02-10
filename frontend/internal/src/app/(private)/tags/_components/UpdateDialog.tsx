'use client';

import { AutoDialog } from 'common/components';
import type { AutoDialogField } from 'common/components';
import { tagUpdateSchema } from 'common/schemas';
import { useTagContext } from '../_hooks/useTagContext';

export interface UpdateDialogProps {
  usageOptions: { value: string; label: string }[];
}

export function UpdateDialog({ usageOptions }: UpdateDialogProps) {
  const domain = useTagContext();
  const { open, board: tag, onClose, onSubmit } = domain.dialogs.update;
  const optionsWithCurrent =
    tag?.usage && !usageOptions.some((o) => o.value === tag.usage)
      ? [{ value: tag.usage, label: tag.usage }, ...usageOptions]
      : usageOptions;
  const fields: AutoDialogField[] = [
    { key: 'name', label: '태그명', type: 'text' },
    { key: 'description', label: '설명', type: 'textarea', optional: true },
    { key: 'usage', label: '용도', type: 'select', options: optionsWithCurrent },
  ];

  const initialValues = tag
    ? {
        name: tag.name,
        description: tag.description ?? undefined,
        usage: tag.usage,
      }
    : undefined;

  return (
    <AutoDialog
      open={open}
      onClose={onClose}
      title="태그 수정"
      schema={tagUpdateSchema}
      fields={fields}
      mode="edit"
      initialValues={initialValues}
      onSubmit={onSubmit}
    />
  );
}
