'use client';

import { AutoDialog } from 'common/components';
import type { AutoDialogField } from 'common/components';
import { tagCreateSchema } from 'common/schemas';
import { useTagContext } from '../_hooks/useTagContext';

export interface CreateDialogProps {
  usageOptions: { value: string; label: string }[];
}

export function CreateDialog({ usageOptions }: CreateDialogProps) {
  const domain = useTagContext();
  const { open, onClose, onSubmit } = domain.dialogs.create;
  const fields: AutoDialogField[] = [
    { key: 'name', label: '태그명', type: 'text' },
    { key: 'description', label: '설명', type: 'textarea', optional: true },
    {
      key: 'usage',
      label: '용도',
      type: 'select',
      options: usageOptions,
      defaultValue: 'topic',
    },
  ];

  return (
    <AutoDialog
      open={open}
      onClose={onClose}
      title="태그 추가"
      schema={tagCreateSchema}
      fields={fields}
      mode="create"
      onSubmit={onSubmit}
    />
  );
}
