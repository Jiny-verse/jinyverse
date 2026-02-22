'use client';

import { AutoDialog } from 'common/components';
import type { AutoDialogField } from 'common/components';
import { boardUpdateSchema } from 'common/schemas';
import { useLanguage } from 'common/utils';
import { useBoardContext } from '../_hooks/useBoardContext';

export interface UpdateDialogProps {
  typeOptions: { value: string; label: string }[];
  menuOptions: { value: string; label: string }[];
}

export function UpdateDialog({ typeOptions, menuOptions }: UpdateDialogProps) {
  const { t } = useLanguage();
  const domain = useBoardContext();
  const { open, board, onClose, onSubmit } = domain.dialogs.update;
  const fields: AutoDialogField[] = [
    { key: 'type', label: t('form.label.type'), type: 'select', options: typeOptions },
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

  const initialValues = board
    ? {
        type: board.type,
        name: board.name,
        menuCode: board.menuCode ?? '',
        description: board.description ?? undefined,
        note: board.note ?? undefined,
        isPublic: board.isPublic ?? undefined,
        order: board.order ?? undefined,
      }
    : undefined;

  return (
    <AutoDialog
      open={open}
      onClose={onClose}
      title={t('admin.board.edit')}
      schema={boardUpdateSchema}
      fields={fields}
      mode="edit"
      initialValues={initialValues}
      onSubmit={onSubmit}
    />
  );
}
