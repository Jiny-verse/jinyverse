'use client';

import { AutoDialog } from 'common/components';
import type { AutoDialogField } from 'common/components';
import { landingCtaUpdateSchema } from 'common/schemas';
import { useLanguage } from 'common/utils';
import { useLandingContext } from '../_hooks/useLandingContext';

const CTA_TYPES = [
  { value: 'button', label: 'Button' },
  { value: 'text', label: 'Text' },
  { value: 'image', label: 'Image' },
];

export function UpdateCtaDialog() {
  const { t } = useLanguage();
  const domain = useLandingContext();
  const { open, board: cta, onClose, onSubmit } = domain.ctaDomain.dialogs.update;

  const fields: AutoDialogField[] = [
    {
      key: 'type',
      label: t('admin.landing.cta.type'),
      type: 'select',
      options: CTA_TYPES,
    },
    { key: 'label', label: t('admin.landing.cta.label'), type: 'text', optional: true },
    { key: 'href', label: t('admin.landing.cta.href'), type: 'text', optional: true },
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

  const initialValues = cta
    ? {
        type: cta.type as 'text' | 'button' | 'image',
        label: cta.label ?? undefined,
        href: cta.href,
        className: cta.className ?? undefined,
        positionTop: cta.positionTop ?? undefined,
        positionLeft: cta.positionLeft ?? undefined,
        positionBottom: cta.positionBottom ?? undefined,
        positionRight: cta.positionRight ?? undefined,
        positionTransform: cta.positionTransform ?? undefined,
        order: cta.order,
        isActive: cta.isActive,
      }
    : undefined;

  return (
    <AutoDialog
      open={open}
      onClose={onClose}
      title={t('admin.landing.cta.edit')}
      schema={landingCtaUpdateSchema}
      fields={fields}
      mode="edit"
      initialValues={initialValues}
      onSubmit={onSubmit}
    />
  );
}
