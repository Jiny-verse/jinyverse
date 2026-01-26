// i18next 기반 다국어 시스템
export { default as i18n } from './i18n';
export { default as useLanguage } from './hooks/useLanguage';
export { I18nProvider } from './providers/I18nProvider';
export type { Locale } from './types';

// 간단한 t 함수 (i18next 사용)
import i18nInstance from './i18n';

export function t(key: string, options?: any): string {
  return i18nInstance.t(key, options) as string;
}
