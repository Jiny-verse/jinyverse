'use client';

import { useEffect, useState } from 'react';
import { getCodes, getMenus } from 'common/services';
import { buildMenuTree, menuTreeToSelectOptionsByCode } from 'common';
import { useApiOptions } from '@/app/providers/ApiProvider';
import { Table, CreateDialog, UpdateDialog } from './_components';
import { BoardProvider } from './_hooks/useBoardContext';
import { useLanguage } from 'common/utils';

const BOARD_TYPE_CATEGORY = 'board_type';

function BoardsContent() {
  const [typeOptions, setTypeOptions] = useState<{ value: string; label: string }[]>([]);
  const [menuOptions, setMenuOptions] = useState<{ value: string; label: string }[]>([]);
  const options = useApiOptions();
  const { t } = useLanguage();

  useEffect(() => {
    getCodes(options, { categoryCode: BOARD_TYPE_CATEGORY })
      .then((codes) => setTypeOptions(codes.map((c) => ({ value: c.code, label: c.name }))))
      .catch(() => setTypeOptions([]));
  }, [options.baseUrl, options.channel]);

  useEffect(() => {
    const menuNone = { value: '', label: t('admin.none') };
    getMenus(options, { size: 100 })
      .then((res) => {
        const tree = buildMenuTree(res.content);
        setMenuOptions([menuNone, ...menuTreeToSelectOptionsByCode(tree)]);
      })
      .catch(() => setMenuOptions([menuNone]));
  }, [options.baseUrl, options.channel]);

  return (
    <div className="">
      <h1 className="text-2xl font-bold mb-6">{t('admin.board.title')}</h1>
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
