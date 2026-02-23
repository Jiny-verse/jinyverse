'use client';

import type { ColumnDef } from 'common/components';
import type { AuditLog } from 'common/schemas';

export function getColumns(t?: (key: string) => string): ColumnDef<AuditLog>[] {
  const tr = t ?? ((k: string) => k);
  return [
    { key: 'targetType', header: tr('form.label.targetType') },
    { key: 'action', header: tr('form.label.action') },
    {
      key: 'actorUserId',
      header: tr('admin.audit.actorId'),
      render: (row) =>
        row.actorUserId ? String(row.actorUserId).slice(0, 8) + '…' : '-',
    },
    {
      key: 'ipAddress',
      header: tr('admin.audit.ipAddress'),
      render: (row) => (row.ipAddress ? String(row.ipAddress) : '-'),
    },
    {
      key: 'createdAt',
      header: tr('form.label.createdAt'),
      render: (row) =>
        row.createdAt
          ? new Date(row.createdAt as string | number).toLocaleString(
              tr('ko') === 'ko' ? 'ko-KR' : 'en-US',
              { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }
            )
          : '-',
    },
  ];
}
