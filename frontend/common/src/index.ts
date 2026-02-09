export const commonValue = 'This is from common';

export { HorizontalNavigation, SideNavigation } from './components/navigation';
export type {
  NavigationItem,
  NavigationChannel,
  NavigationData,
  Channel,
} from './types/navigation';
export { menusToNavigationItems, menusToNavigationItemsTree } from './data/navigation';
export {
  buildMenuTree,
  menuTreeToSelectOptions,
  menuTreeToSelectOptionsByCode,
  menuTreeToTreeNode,
} from './data/menuTree';
export type { MenuTreeNode, TreeNode } from './data/menuTree';
export * from './ui';
export * from './hooks';
export { t, i18n, useLanguage, I18nProvider } from './utils/i18n';
export type { Locale } from './utils/i18n';
export * from './schemas';
export type { ApiOptions, PageResponse } from './types/api';
export * from './services';
export * from './providers';
