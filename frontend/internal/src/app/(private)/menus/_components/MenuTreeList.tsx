'use client';

import type { Menu } from 'common/types';
import type { MenuTreeNode } from 'common';
import { FolderTree } from 'lucide-react';

export interface MenuTreeListProps {
  tree: MenuTreeNode[];
  selectedId?: string | null;
  onSelectMenu: (menu: Menu) => void;
}

function TreeLevel({
  nodes,
  level,
  selectedId,
  onSelectMenu,
}: {
  nodes: MenuTreeNode[];
  level: number;
  selectedId?: string | null;
  onSelectMenu: (menu: Menu) => void;
}) {
  return (
    <ul className={level > 0 ? 'ml-4 border-l border-gray-200 pl-1' : ''}>
      {nodes.map((node) => {
        const isSelected = selectedId === node.id;
        return (
          <li key={node.id} className="py-0.5">
            <button
              type="button"
              className={`flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm transition-colors ${
                isSelected ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-100'
              }`}
              style={{ paddingLeft: level > 0 ? 12 + level * 16 : 10 }}
              onClick={() => onSelectMenu(node)}
            >
              <span className="min-w-0 flex-1 truncate font-medium">
                {node.name ?? node.code}
              </span>
              <span className={`shrink-0 text-xs ${isSelected ? 'text-gray-400' : 'text-gray-400'}`}>
                {node.code}
              </span>
            </button>
            {node.children.length > 0 && (
              <TreeLevel
                nodes={node.children}
                level={level + 1}
                selectedId={selectedId}
                onSelectMenu={onSelectMenu}
              />
            )}
          </li>
        );
      })}
    </ul>
  );
}

export function MenuTreeList({ tree, selectedId, onSelectMenu }: MenuTreeListProps) {
  if (tree.length === 0) {
    return (
      <div className="flex min-h-[280px] flex-col items-center justify-center py-14 text-center">
        <FolderTree className="mb-3 h-9 w-9 text-gray-300" />
        <p className="text-sm font-medium text-gray-500">메뉴가 없습니다</p>
        <p className="mt-1 text-xs text-gray-400">메뉴 추가로 등록하세요.</p>
      </div>
    );
  }
  return (
    <div className="p-1">
      <TreeLevel nodes={tree} level={0} selectedId={selectedId} onSelectMenu={onSelectMenu} />
    </div>
  );
}
