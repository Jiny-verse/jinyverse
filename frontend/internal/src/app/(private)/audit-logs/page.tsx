'use client';

import { useApiOptions } from '@/app/providers/ApiProvider';
import { Table } from './_components/Table';
import { useLanguage } from 'common/utils';

export default function AuditLogsPage() {
  const options = useApiOptions();
  const { t } = useLanguage();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">{t('admin.audit.title')}</h1>
      <Table apiOptions={options} />
    </div>
  );
}
