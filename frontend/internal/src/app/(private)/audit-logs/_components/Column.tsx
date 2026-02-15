'use client';

import type { ColumnDef } from 'common/components';
import type { AuditLog } from 'common/schemas';

export function getColumns(): ColumnDef<AuditLog>[] {
  return [
    { key: 'targetType', header: '대상 유형' },
    { key: 'action', header: '액션' },
    {
      key: 'actorUserId',
      header: '행위자 ID',
      render: (row) =>
        row.actorUserId ? String(row.actorUserId).slice(0, 8) + '…' : '-',
    },
    {
      key: 'ipAddress',
      header: 'IP 주소',
      render: (row) => (row.ipAddress ? String(row.ipAddress) : '-'),
    },
    { key: 'createdAt', header: '생성일시' },
  ];
}
