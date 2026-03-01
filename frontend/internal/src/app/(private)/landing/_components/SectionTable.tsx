'use client';

import { useState, useEffect, useCallback } from 'react';
import { DataTable, createActionColumn } from 'common/components';
import type { ColumnDef } from 'common/components';
import { ConfirmDialog } from 'common/ui';
import { getAdminLandingSections } from 'common/services';
import type { LandingSection } from 'common/schemas';
import type { ApiOptions } from 'common/types';
import { useLanguage } from 'common/utils';
import { useLandingContext } from '../_hooks/useLandingContext';

type SectionRow = LandingSection & Record<string, unknown>;

interface SectionTableProps {
  apiOptions: ApiOptions;
}

export function SectionTable({ apiOptions }: SectionTableProps) {
  const { t } = useLanguage();
  const domain = useLandingContext();
  const [sections, setSections] = useState<SectionRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const load = useCallback(() => {
    setIsLoading(true);
    getAdminLandingSections(apiOptions)
      .then((data) => setSections(data as SectionRow[]))
      .catch(() => setSections([]))
      .finally(() => setIsLoading(false));
  }, [apiOptions.baseUrl, apiOptions.channel]);

  useEffect(() => {
    load();
  }, [load, domain.reloadTrigger]);

  const handleDeleteConfirm = async () => {
    if (!pendingDeleteId) return;
    await domain.crud.delete(pendingDeleteId);
    setPendingDeleteId(null);
  };

  const columns: ColumnDef<SectionRow>[] = [
    { key: 'order', header: t('admin.landing.section.order'), width: '60px' },
    { key: 'type', header: t('admin.landing.section.type'), width: '120px' },
    { key: 'title', header: t('form.label.name') },
    {
      key: 'isActive',
      header: t('admin.landing.section.active'),
      width: '80px',
      render: (row) => (
        <span
          className={`px-2 py-0.5 rounded text-xs font-medium ${
            row.isActive
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-100 text-gray-500'
          }`}
        >
          {row.isActive ? 'ON' : 'OFF'}
        </span>
      ),
    },
    createActionColumn<SectionRow>({
      onEdit: (row) => domain.dialogs.update.onOpen(row as unknown as LandingSection),
      onDelete: (id) => setPendingDeleteId(id),
    }),
  ];

  return (
    <>
      <ConfirmDialog
        isOpen={pendingDeleteId !== null}
        message={t('message.confirmDelete')}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setPendingDeleteId(null)}
      />
      <DataTable<SectionRow>
        data={sections}
        columns={columns}
        isLoading={isLoading}
        onAdd={domain.dialogs.create.onOpen}
        addButtonLabel={t('admin.landing.section.create')}
        onRowClick={(row) => domain.setSelectedSection(row as unknown as LandingSection)}
        selectedRowId={domain.selectedSection?.id ?? null}
        getRowId={(row) => row.id as string}
        getRowClassName={(row) =>
          (row.id as string) === domain.selectedSection?.id ? 'bg-primary/5' : ''
        }
      />
    </>
  );
}
