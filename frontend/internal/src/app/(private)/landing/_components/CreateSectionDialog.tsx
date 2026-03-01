'use client';

import { AutoDialog } from 'common/components';
import type { AutoDialogField } from 'common/components';
import { landingSectionCreateSchema } from 'common/schemas';
import { useLanguage } from 'common/utils';
import { useLandingContext } from '../_hooks/useLandingContext';

const SECTION_TYPES = [
  { value: 'hero', label: 'Hero Slider' },
  { value: 'image', label: 'Description Image' },
  { value: 'board_top', label: 'Board Top' },
  { value: 'image_link', label: 'Image Link' },
];

export function CreateSectionDialog() {
  const { t } = useLanguage();
  const domain = useLandingContext();
  const { open, onClose, onSubmit } = domain.dialogs.create;

  const fields: AutoDialogField[] = [
    {
      key: 'type',
      label: t('admin.landing.section.type'),
      type: 'select',
      options: SECTION_TYPES,
      defaultValue: 'hero',
    },
    { key: 'title', label: t('form.label.name'), type: 'text', optional: true },
    { key: 'description', label: t('form.label.description'), type: 'textarea', optional: true },
    { key: 'isActive', label: t('admin.landing.section.active'), type: 'toggle', optional: true },
    { key: 'order', label: t('admin.landing.section.order'), type: 'number', optional: true },
  ];

  return (
    <AutoDialog
      open={open}
      onClose={onClose}
      title={t('admin.landing.section.create')}
      schema={landingSectionCreateSchema}
      fields={fields}
      mode="create"
      onSubmit={onSubmit}
    />
  );
}
