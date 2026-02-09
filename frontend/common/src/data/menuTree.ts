import type { Menu } from '../schemas/menu';

/** 메뉴 + 자식 배열 (계층 노드) */
export type MenuTreeNode = Menu & { children: MenuTreeNode[] };

/**
 * 평면 메뉴 목록을 upperId 기준 트리로 변환. order로 정렬.
 */
export function buildMenuTree(menus: Menu[]): MenuTreeNode[] {
  const list = [...menus].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const byId = new Map<string, MenuTreeNode>();
  list.forEach((m) => byId.set(m.id, { ...m, children: [] }));

  const roots: MenuTreeNode[] = [];
  list.forEach((m) => {
    const node = byId.get(m.id)!;
    const upperId = m.upperId && m.upperId.trim() ? m.upperId.trim() : null;
    if (!upperId || !byId.has(upperId)) {
      roots.push(node);
    } else {
      byId.get(upperId)!.children.push(node);
    }
  });
  return roots;
}

/**
 * 트리 노드를 select 옵션으로 변환 (들여쓰기 라벨). value = node.id (메뉴 수정 시 상위 메뉴 등).
 */
export function menuTreeToSelectOptions(
  nodes: MenuTreeNode[],
  prefix = ''
): { value: string; label: string }[] {
  const result: { value: string; label: string }[] = [];
  const indent = prefix ? `${prefix}— ` : '';
  nodes.forEach((node) => {
    result.push({ value: node.id, label: `${indent}${node.name ?? node.code}` });
    if (node.children.length > 0) {
      result.push(...menuTreeToSelectOptions(node.children, indent));
    }
  });
  return result;
}

/**
 * 트리 노드를 select 옵션으로 변환. value = node.code (게시판/게시글 menu_code 연동용).
 */
export function menuTreeToSelectOptionsByCode(
  nodes: MenuTreeNode[],
  prefix = ''
): { value: string; label: string }[] {
  const result: { value: string; label: string }[] = [];
  const indent = prefix ? `${prefix}— ` : '';
  nodes.forEach((node) => {
    result.push({ value: node.code, label: `${indent}${node.name ?? node.code}` });
    if (node.children.length > 0) {
      result.push(...menuTreeToSelectOptionsByCode(node.children, indent));
    }
  });
  return result;
}

/** TreeView 등에서 쓰는 범용 트리 노드 (id, label, children) */
export type TreeNode = {
  id: string;
  label: string;
  children?: TreeNode[];
  isExpanded?: boolean;
  [key: string]: unknown;
};

/**
 * MenuTreeNode → TreeNode (TreeView 컴포넌트용).
 */
export function menuTreeToTreeNode(nodes: MenuTreeNode[]): TreeNode[] {
  return nodes.map((node) => ({
    ...node,
    id: node.id,
    label: node.name ?? node.code,
    children: node.children.length > 0 ? menuTreeToTreeNode(node.children) : undefined,
    isExpanded: true,
  }));
}
