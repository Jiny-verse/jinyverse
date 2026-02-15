'use client';

import { useApiOptions } from '@/app/providers/ApiProvider';
import { Table } from './_components/Table';

export default function AuditLogsPage() {
  const options = useApiOptions();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">감사 로그</h1>
      <Table apiOptions={options} />
    </div>
  );
}
