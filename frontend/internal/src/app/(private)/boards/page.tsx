'use client';

import { useEffect, useState } from 'react';
import { getCodes, getMenus } from 'common/services';
import { buildMenuTree, menuTreeToSelectOptionsByCode } from 'common';
import { useApiOptions } from '@/app/providers/ApiProvider';
import { Table, CreateDialog, UpdateDialog } from './_components';
import { BoardProvider, useBoardContext } from './_hooks/useBoardContext';

const BOARD_TYPE_CATEGORY = 'board_type';
const MENU_NONE = { value: '', label: '(없음)' };

function BoardsContent() {
  const [typeOptions, setTypeOptions] = useState<{ value: string; label: string }[]>([]);
  const [menuOptions, setMenuOptions] = useState<{ value: string; label: string }[]>([MENU_NONE]);
  const options = useApiOptions();

  useEffect(() => {
    getCodes(options, { categoryCode: BOARD_TYPE_CATEGORY })
      .then((codes) => setTypeOptions(codes.map((c) => ({ value: c.code, label: c.name }))))
      .catch(() => setTypeOptions([]));
  }, [options.baseUrl, options.channel]);

  useEffect(() => {
    getMenus(options, { size: 100 })
      .then((res) => {
        const tree = buildMenuTree(res.content);
        setMenuOptions([MENU_NONE, ...menuTreeToSelectOptionsByCode(tree)]);
      })
      .catch(() => setMenuOptions([MENU_NONE]));
  }, [options.baseUrl, options.channel]);

  return (
    <div className="">
      <h1 className="text-2xl font-bold mb-6">게시판 관리</h1>
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
