'use client';

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import ko from './locales/ko.json';
import en from './locales/en.json';

// i18n 초기화
i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ko: { translation: ko },
    },
    lng: 'ko', // 초기 언어
    fallbackLng: 'en', // 대체 언어
    interpolation: { escapeValue: false },
    returnObjects: true, // 객체 형태로도 반환 허용
    defaultNS: 'translation', // 기본 네임스페이스
  });

export default i18n;
