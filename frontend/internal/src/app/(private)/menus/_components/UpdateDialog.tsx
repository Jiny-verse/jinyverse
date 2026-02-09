'use client';

import { AutoDialog } from 'common/components';
import type { AutoDialogField } from 'common/components';
import { menuUpdateSchema } from 'common/schemas';
import { useMenuContext } from '../_hooks/useMenuContext';

export interface UpdateDialogProps {
  channelOptions: { value: string; label: string }[];
  upperMenuOptions: { value: string; label: string }[];
}

export function UpdateDialog({ channelOptions, upperMenuOptions }: UpdateDialogProps) {
  const domain = useMenuContext();
  const { open, board, onClose, onSubmit } = domain.dialogs.update;
  const menu = board;
  const upperOptions = menu
    ? upperMenuOptions.filter((opt) => opt.value === '' || opt.value !== menu.id)
    : upperMenuOptions;
  if (open && menu) {
    console.log('[MenuDebug] UpdateDialog 열림', {
      menuId: menu.id,
      menuCode: menu.code,
      menuName: menu.name,
      upperMenuOptionsCount: upperMenuOptions.length,
      upperOptionsCount: upperOptions.length,
      upperOptionLabels: upperOptions.map((o) => o.label),
    });
  }
  const fields: AutoDialogField[] = [
    { key: 'code', label: '코드', type: 'text' },
    { key: 'name', label: '이름', type: 'text' },
    { key: 'description', label: '설명', type: 'textarea', optional: true },
    { key: 'isActive', label: '활성', type: 'toggle', optional: true },
    { key: 'isAdmin', label: '관리자 전용', type: 'toggle', optional: true },
    { key: 'order', label: '정렬 순서', type: 'number', optional: true },
    {
      key: 'upperId',
      label: '상위 메뉴',
      type: 'select',
      options: upperOptions,
      optional: true,
    },
    {
      key: 'channel',
      label: '채널',
      type: 'select',
      options: channelOptions,
    },
    {
      key: 'path',
      label: '링크(경로)',
      type: 'text',
      optional: true,
      placeholder: '예: /about (내부 경로) 또는 https://example.com (외부 URL)',
    },
  ];

  const initialValues = menu
    ? {
        code: menu.code,
        name: menu.name,
        description: menu.description ?? undefined,
        isActive: menu.isActive ?? undefined,
        isAdmin: menu.isAdmin ?? undefined,
        order: menu.order ?? undefined,
        upperId: menu.upperId ?? '',
        channel: menu.channel ?? 'INTERNAL',
        path: menu.path ?? undefined,
      }
    : undefined;

  return (
    <AutoDialog
      open={open}
      onClose={onClose}
      title="메뉴 수정"
      schema={menuUpdateSchema}
      fields={fields}
      mode="edit"
      initialValues={initialValues}
      onSubmit={onSubmit}
    />
  );
}
