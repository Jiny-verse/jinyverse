'use client';

import { AutoDialog } from 'common/components';
import type { AutoDialogField } from 'common/components';
import { landingCtaCreateSchema } from 'common/schemas';
import { useLanguage } from 'common/utils';
import { useLandingContext } from '../_hooks/useLandingContext';

const CTA_TYPES = [
  { value: 'button', label: 'Button' },
  { value: 'text', label: 'Text' },
  { value: 'image', label: 'Image' },
];

export function CreateCtaDialog() {
  const { t } = useLanguage();
  const domain = useLandingContext();
  const { open, onClose, onSubmit } = domain.ctaDomain.dialogs.create;

  const fields: AutoDialogField[] = [
    {
      key: 'type',
      label: t('admin.landing.cta.type'),
      type: 'select',
      options: CTA_TYPES,
      defaultValue: 'button',
    },
    { key: 'label', label: t('admin.landing.cta.label'), type: 'text', optional: true },
    { key: 'href', label: t('admin.landing.cta.href'), type: 'text' },
    { key: 'className', label: t('admin.landing.cta.className'), type: 'text', optional: true },
    {
      key: 'positionTop',
      label: t('admin.landing.cta.positionTop'),
      type: 'number',
      optional: true,
    },
    {
      key: 'positionLeft',
      label: t('admin.landing.cta.positionLeft'),
      type: 'number',
      optional: true,
    },
    {
      key: 'positionBottom',
      label: t('admin.landing.cta.positionBottom'),
      type: 'number',
      optional: true,
    },
    {
      key: 'positionRight',
      label: t('admin.landing.cta.positionRight'),
      type: 'number',
      optional: true,
    },
    {
      key: 'positionTransform',
      label: t('admin.landing.cta.positionTransform'),
      type: 'text',
      optional: true,
    },
    { key: 'order', label: t('admin.landing.section.order'), type: 'number', optional: true },
    { key: 'isActive', label: t('admin.landing.section.active'), type: 'toggle', optional: true },
  ];

  return (
    <AutoDialog
      open={open}
      onClose={onClose}
      title={t('admin.landing.cta.create')}
      schema={landingCtaCreateSchema}
      fields={fields}
      mode="create"
      onSubmit={onSubmit}
    />
  );
}
