'use client';

import { useEffect, useState } from 'react';
import { getCodes, getMenusForManagement } from 'common/services';
import { buildMenuTree, menuTreeToSelectOptionsByCode } from 'common';
import { useApiOptions } from '@/app/providers/ApiProvider';
import { Table, CreateDialog, UpdateDialog } from './_components';
import { BoardProvider } from './_hooks/useBoardContext';
import { useLanguage, parseApiError } from 'common/utils';
import { Alert } from 'common/ui';

const BOARD_TYPE_CATEGORY = 'board_type';

function BoardsContent() {
  const [typeOptions, setTypeOptions] = useState<{ value: string; label: string }[]>([]);
  const [menuOptions, setMenuOptions] = useState<{ value: string; label: string }[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const options = useApiOptions();
  const { t } = useLanguage();

  useEffect(() => {
    getCodes(options, { categoryCode: BOARD_TYPE_CATEGORY })
      .then((codes) => setTypeOptions(codes.map((c) => ({ value: c.code, label: c.name }))))
      .catch((err) => {
        const { messageKey, fallback } = parseApiError(err);
        setLoadError(t(messageKey) || fallback);
        setTypeOptions([]);
      });
  }, [options.baseUrl, options.channel]);

  useEffect(() => {
    const menuNone = { value: '', label: t('admin.none') };
    getMenusForManagement(options, { size: 100 })
      .then((res) => {
        const tree = buildMenuTree(res.content);
        setMenuOptions([menuNone, ...menuTreeToSelectOptionsByCode(tree)]);
      })
      .catch((err) => {
        const { messageKey, fallback } = parseApiError(err);
        setLoadError(t(messageKey) || fallback);
        setMenuOptions([menuNone]);
      });
  }, [options.baseUrl, options.channel]);

  return (
    <div className="">
      <h1 className="text-2xl font-bold mb-6">{t('admin.board.title')}</h1>
      {loadError && <Alert variant="error">{loadError}</Alert>}
      <Table apiOptions={options} />
      <CreateDialog typeOptions={typeOptions} menuOptions={menuOptions} />
      <UpdateDialog typeOptions={typeOptions} menuOptions={menuOptions} />
    </div>
  );
}

export default function BoardsPage() {
  const options = useApiOptions();
  return (
    <BoardProvider apiOptions={options}>
      <BoardsContent />
    </BoardProvider>
  );
}
