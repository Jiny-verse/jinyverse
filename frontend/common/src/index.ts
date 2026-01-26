export const commonValue = "This is from common";

// Navigation components
export { HorizontalNavigation, SideNavigation } from './components/navigation';

// Navigation types
export type {
  NavigationItem,
  NavigationChannel,
  NavigationData,
  Channel,
} from './types/navigation';

// Navigation data
export {
  mockNavigationItems,
  mockChannelConfig,
  mockNavigationData,
  getNavigationItemsByChannel,
} from './data/navigation';

// UI components
export * from './ui';

// i18n
export { t, i18n, useLanguage, I18nProvider } from './utils/i18n';
export type { Locale } from './utils/i18n';

// Schemas (Zod)
export * from './schemas';
