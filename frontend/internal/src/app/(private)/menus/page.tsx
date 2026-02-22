'use client';

import { useEffect, useState, useCallback } from 'react';
import { getMenusForManagement } from 'common/services';
import { buildMenuTree, menuTreeToSelectOptions } from 'common';
import { useApiOptions } from '@/app/providers/ApiProvider';
import type { Menu } from 'common/types';
import { CreateDialog, UpdateDialog, TreeList, DetailPanel } from './_components';
import { MenuProvider, useMenuContext } from './_hooks/useMenuContext';
import type { MenuTreeNode } from 'common';
import { useLanguage } from 'common/utils';

function MenusContent() {
  const options = useApiOptions();
  const domain = useMenuContext();
  const { t } = useLanguage();

  const noneOption = { value: '', label: t('admin.none') };
  const [upperMenuOptions, setUpperMenuOptions] = useState<{ value: string; label: string }[]>([
    noneOption,
  ]);
  const [menuTree, setMenuTree] = useState<MenuTreeNode[]>([]);
  const [previewChannel, setPreviewChannel] = useState<string>('');
  const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null);

  const CHANNEL_OPTIONS = [
    { value: 'INTERNAL', label: t('admin.menu.internal') },
    { value: 'EXTERNAL', label: t('admin.menu.external') },
    { value: 'PUBLIC', label: t('admin.menu.public') },
  ];

  const PREVIEW_CHANNELS = [
    { value: '', label: t('common.all') },
    { value: 'INTERNAL', label: t('admin.menu.internal') },
    { value: 'EXTERNAL', label: t('admin.menu.external') },
  ] as const;

  const loadMenus = useCallback(
    (channel: string) => {
      getMenusForManagement(options, {
        size: 100,
        channel: channel === '' ? undefined : (channel as 'INTERNAL' | 'EXTERNAL' | 'PUBLIC'),
      })
        .then((res) => {
          const tree = buildMenuTree(res.content);
          const optionsList = menuTreeToSelectOptions(tree);
          setMenuTree(tree);
          setUpperMenuOptions([noneOption, ...optionsList]);
        })
        .catch(() => {
          setMenuTree([]);
          setUpperMenuOptions([noneOption]);
        });
    },
    [options.baseUrl, options.channel]
  );

  useEffect(() => {
    loadMenus(previewChannel);
  }, [previewChannel, loadMenus, domain.reloadTrigger]);

  const handleSelectMenu = useCallback((menu: Menu) => {
    setSelectedMenu(menu);
  }, []);

  const handleOpenEdit = useCallback(
    (menu: Menu) => {
      domain.dialogs.update.onOpen(menu);
    },
    [domain.dialogs.update]
  );

  const handleDelete = useCallback(
    async (code: string) => {
      if (!confirm(t('admin.menu.deleteConfirm'))) return;
      await domain.crud.delete(code);
      if (selectedMenu?.code === code) setSelectedMenu(null);
    },
    [domain.crud, selectedMenu?.code]
  );

  return (
    <div className="">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('admin.menu.title')}</h1>
        <button
          type="button"
          className="rounded border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          onClick={() => domain.dialogs.create.onOpen()}
        >
          {t('admin.menu.add')}
        </button>
      </div>

      <div
        className="grid gap-6 transition-[grid-template-columns] duration-300 ease-out"
        style={{ gridTemplateColumns: selectedMenu ? '1fr 1fr' : '1fr 0fr' }}
      >
        <div className="min-h-[360px] min-w-0 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-800">{t('admin.menu.hierarchy')}</h2>
            <select
              value={previewChannel}
              onChange={(e) => setPreviewChannel(e.target.value)}
              className="rounded border border-gray-300 px-2 py-1 text-xs text-gray-700"
            >
              {PREVIEW_CHANNELS.map((c) => (
                <option key={c.value || 'all'} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <div className="min-h-[280px] max-h-[400px] overflow-y-auto">
            <TreeList
              tree={menuTree}
              selectedId={selectedMenu?.id ?? null}
              onSelectMenu={handleSelectMenu}
            />
          </div>
        </div>
        <div className="min-h-[360px] min-w-0 overflow-hidden">
          {selectedMenu ? (
            <DetailPanel
              menu={selectedMenu}
              apiOptions={options}
              onEdit={handleOpenEdit}
              onDelete={handleDelete}
            />
          ) : null}
        </div>
      </div>

      <CreateDialog channelOptions={CHANNEL_OPTIONS} upperMenuOptions={upperMenuOptions} />
      <UpdateDialog channelOptions={CHANNEL_OPTIONS} upperMenuOptions={upperMenuOptions} />
    </div>
  );
}

export default function MenusPage() {
  const options = useApiOptions();
  return (
    <MenuProvider apiOptions={options}>
      <MenusContent />
    </MenuProvider>
  );
}
