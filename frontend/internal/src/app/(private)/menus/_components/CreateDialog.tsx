'use client';

import { AutoDialog } from 'common/components';
import type { AutoDialogField } from 'common/components';
import { menuCreateSchema } from 'common/schemas';
import { useMenuContext } from '../_hooks/useMenuContext';

export interface CreateDialogProps {
  channelOptions: { value: string; label: string }[];
  upperMenuOptions: { value: string; label: string }[];
}

export function CreateDialog({ channelOptions, upperMenuOptions }: CreateDialogProps) {
  const domain = useMenuContext();
  const { open, onClose, onSubmit } = domain.dialogs.create;
  const fields: AutoDialogField[] = [
    { key: 'code', label: '코드', type: 'text' },
    { key: 'name', label: '이름', type: 'text' },
    { key: 'description', label: '설명', type: 'textarea', optional: true },
    { key: 'isActive', label: '활성', type: 'toggle', optional: true, defaultValue: true },
    { key: 'isAdmin', label: '관리자 전용', type: 'toggle', optional: true, defaultValue: false },
    { key: 'order', label: '정렬 순서', type: 'number', optional: true },
    {
      key: 'upperId',
      label: '상위 메뉴',
      type: 'select',
      options: upperMenuOptions,
      optional: true,
    },
    {
      key: 'channel',
      label: '채널',
      type: 'select',
      options: channelOptions,
      defaultValue: 'INTERNAL',
    },
    {
      key: 'path',
      label: '링크(경로)',
      type: 'text',
      optional: true,
      placeholder: '예: /about (내부 경로) 또는 https://example.com (외부 URL)',
    },
  ];

  return (
    <AutoDialog
      open={open}
      onClose={onClose}
      title="메뉴 추가"
      schema={menuCreateSchema}
      fields={fields}
      mode="create"
      onSubmit={onSubmit}
    />
  );
}
