'use client';

import { AutoDialog } from 'common/components';
import type { AutoDialogField } from 'common/components';
import { boardCreateSchema } from 'common/schemas';
import { useLanguage } from 'common/utils';
import { useBoardContext } from '../_hooks/useBoardContext';

export interface CreateDialogProps {
  typeOptions: { value: string; label: string }[];
  menuOptions: { value: string; label: string }[];
}

export function CreateDialog({ typeOptions, menuOptions }: CreateDialogProps) {
  const { t } = useLanguage();
  const domain = useBoardContext();
  const { open, onClose, onSubmit } = domain.dialogs.create;
  const fields: AutoDialogField[] = [
    {
      key: 'type',
      label: t('form.label.type'),
      type: 'select',
      options: typeOptions,
      defaultValue: 'project',
    },
    { key: 'name', label: t('form.label.name'), type: 'text' },
    {
      key: 'menuCode',
      label: t('form.label.menuCode'),
      type: 'select',
      options: menuOptions,
      optional: true,
    },
    { key: 'description', label: t('form.label.description'), type: 'textarea', optional: true },
    { key: 'note', label: t('form.label.note'), type: 'textarea', optional: true },
    { key: 'isPublic', label: t('form.label.isPublic'), type: 'toggle', optional: true },
    { key: 'order', label: t('form.label.order'), type: 'number', optional: true },
  ];

  return (
    <AutoDialog
      open={open}
      onClose={onClose}
      title={t('admin.board.create')}
      schema={boardCreateSchema}
      fields={fields}
      mode="create"
      onSubmit={onSubmit}
    />
  );
}
