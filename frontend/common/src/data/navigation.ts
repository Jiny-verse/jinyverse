import type { NavigationItem } from '../types/navigation';
import type { Menu } from '../schemas/menu';
import { buildMenuTree } from './menuTree';
import type { MenuTreeNode } from './menuTree';

export function menusToNavigationItems(
  menus: Menu[],
  _channel: 'external' | 'internal'
): NavigationItem[] {
  const sorted = [...menus].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  return sorted.map((m) => ({
    id: m.code,
    label: m.name ?? m.code,
    href: `/m/${encodeURIComponent(m.code)}`,
  }));
}

function menuTreeToNavItems(nodes: MenuTreeNode[]): NavigationItem[] {
  return nodes.map((node) => ({
    id: node.code,
    label: node.name ?? node.code,
    href: `/m/${encodeURIComponent(node.code)}`,
    children: node.children.length > 0 ? menuTreeToNavItems(node.children) : undefined,
  }));
}

/**
 * API 메뉴 목록을 계층 구조 네비게이션 아이템으로 변환.
 * - children으로 하위 메뉴 포함.
 */
export function menusToNavigationItemsTree(
  menus: Menu[],
  _channel: 'external' | 'internal'
): NavigationItem[] {
  const tree = buildMenuTree(menus);
  return menuTreeToNavItems(tree);
}
