'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, ChevronRight } from 'lucide-react';
import type { NavigationItem } from '../../types/navigation';

function collectIdsWithChildren(list: NavigationItem[]): Set<string> {
  const set = new Set<string>();
  const walk = (items: NavigationItem[]) => {
    items.forEach((item) => {
      if (item.children?.length) {
        set.add(item.id);
        walk(item.children);
      }
    });
  };
  walk(list);
  return set;
}

interface Props {
  items: NavigationItem[];
  isLoading?: boolean;
}

function NavItem({
  item,
  level,
  pathname,
  expandedIds,
  onToggle,
}: {
  item: NavigationItem;
  level: number;
  pathname: string;
  expandedIds: Set<string>;
  onToggle: (id: string) => void;
}) {
  const hasChildren = item.children && item.children.length > 0;
  const isExpanded = hasChildren && expandedIds.has(item.id);
  const isActive = pathname === item.href;

  return (
    <li className="list-none">
      <div className="flex items-center gap-0.5 rounded">
        {hasChildren ? (
          <button
            type="button"
            aria-expanded={isExpanded}
            className="shrink-0 p-1 text-gray-500 hover:text-white"
            onClick={() => onToggle(item.id)}
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
        ) : (
          <span className="w-6 shrink-0" aria-hidden />
        )}
        {hasChildren ? (
          <button
            type="button"
            className={`min-w-0 flex-1 rounded px-3 py-2.5 text-left text-sm transition-all duration-150 ${
              isActive
                ? 'font-medium text-white bg-[#333]'
                : 'font-normal text-[#b3b3b3] hover:bg-[#2a2a2a] hover:text-white'
            }`}
            style={{ paddingLeft: level > 0 ? 8 + level * 12 : undefined }}
            onClick={() => onToggle(item.id)}
          >
            {item.label}
          </button>
        ) : (
          <Link
            href={item.href}
            className={`min-w-0 flex-1 rounded px-3 py-2.5 text-sm no-underline transition-all duration-150 ${
              isActive
                ? 'font-medium text-white bg-[#333]'
                : 'font-normal text-[#b3b3b3] hover:bg-[#2a2a2a] hover:text-white'
            }`}
            style={{ paddingLeft: level > 0 ? 8 + level * 12 : undefined }}
          >
            {item.label}
          </Link>
        )}
      </div>
      {hasChildren && isExpanded && (
        <ul className="m-0 mt-0.5 flex list-none flex-col gap-0.5 border-l border-[#333] pl-2">
          {item.children!.map((child) => (
            <NavItem
              key={child.id}
              item={child}
              level={level + 1}
              pathname={pathname}
              expandedIds={expandedIds}
              onToggle={onToggle}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

export function Navigation({ items, isLoading = false }: Props) {
  const pathname = usePathname();
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (items.length) setExpandedIds(collectIdsWithChildren(items));
  }, [items]);

  const onToggle = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  return (
    <aside className="fixed left-0 top-0 z-10 h-screen w-64 shrink-0 overflow-y-auto border-r border-[#333] bg-[#181818]">
      <div className="h-screen overflow-y-auto">
        <div className="border-b border-[#333] p-6">
          <h2 className="m-0 text-xl font-bold text-white">Jinyverse</h2>
          <p className="m-0 mt-1 text-sm text-gray-500">Admin Panel</p>
        </div>

        <nav className="p-4">
          {isLoading ? (
            <p className="text-sm text-gray-500">로딩 중...</p>
          ) : (
            <ul className="m-0 flex list-none flex-col gap-0.5 p-0">
              {items.map((item) => (
                <NavItem
                  key={item.id}
                  item={item}
                  level={0}
                  pathname={pathname}
                  expandedIds={expandedIds}
                  onToggle={onToggle}
                />
              ))}
            </ul>
          )}
        </nav>
      </div>
    </aside>
  );
}
