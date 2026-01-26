'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';
import React from 'react';

// 다국어 전환을 지원하는 커스텀 훅
const useLanguage = () => {
  const { t: rawT } = useTranslation();

  // 브라우저 또는 localStorage로부터 초기 언어 설정 가져오기
  const getInitialLanguage = (): string => {
    if (typeof window === 'undefined') return 'ko'; // SSR 환경에서는 'ko' 기본
    const stored = localStorage.getItem('language');
    return stored ?? 'ko';
  };

  // 현재 언어 및 반대 언어 상태
  const [language, setLanguage] = useState<string>('ko');
  const [reverse, setReverse] = useState<string>('en');

  // 첫 렌더링 시 초기 언어 설정 적용
  useEffect(() => {
    const initialLang = getInitialLanguage();
    i18n.changeLanguage(initialLang); // i18n 설정 변경
    setLanguage(initialLang); // 현재 언어 저장
    setReverse(initialLang === 'ko' ? 'en' : 'ko'); // 반대 언어 설정
  }, []);

  // 언어 전환 함수
  const switchLanguage = (lng: string) => {
    i18n.changeLanguage(lng); // i18n 언어 변경
    setLanguage(lng); // 현재 언어 상태 업데이트
    setReverse(lng === 'ko' ? 'en' : 'ko'); // 반대 언어 상태 업데이트
    localStorage.setItem('language', lng); // localStorage에 저장
  };

  // 언어 토글 함수 (ko <-> en)
  const toggleLanguage = () => {
    const newLang = language === 'ko' ? 'en' : 'ko';
    switchLanguage(newLang);
  };

  // 현재 언어 및 반대 언어 라벨 (UI 표시용)
  const languageLabel = language === 'ko' ? 'Korean' : 'English';
  const reverseLabel = reverse === 'ko' ? 'Korean' : 'English';

  // 단순 번역 함수
  const t = (key: string, options: any = {}): any => rawT(key, options);

  // 객체 또는 줄바꿈 포함 문자열 번역 렌더링 함수
  const o = (key: string, options: any = {}): any => {
    const rawValue = rawT(key, { ...options, returnObjects: true });

    // 타입 유틸
    const isString = (value: unknown): value is string => typeof value === 'string';
    const isArray = (value: unknown): value is any[] => Array.isArray(value);
    const isObject = (value: unknown): value is Record<string, unknown> =>
      typeof value === 'object' && value !== null && !Array.isArray(value);

    // 줄바꿈 포함 텍스트 처리
    const render = (text: string, i: number = 0) => {
      if (!text.includes('\n')) return text;
      const fragmentMapper = (line: string, j: number) => (
        <React.Fragment key={`mapper-${j}`}>
          {line}
          <br />
        </React.Fragment>
      );
      const child = text.split('\n').map(fragmentMapper);
      return <React.Fragment key={`render-${i}`}>{child}</React.Fragment>;
    };

    // 값 형태에 따라 재귀적으로 변환
    const transform = (value: unknown): any => {
      if (isString(value)) return render(value);
      if (isArray(value)) return value.map(render);
      if (isObject(value)) {
        const result: Record<string, unknown> = {};
        for (const [k, v] of Object.entries(value)) result[k] = transform(v);
        return result;
      }
      return value;
    };

    return transform(rawValue);
  };

  // 외부로 상태 및 함수 반환
  return {
    language, // 현재 언어 (ko/en)
    languageLabel, // 현재 언어 라벨
    reverse, // 반대 언어 (en/ko)
    reverseLabel, // 반대 언어 라벨
    t, // 번역 함수 (단순)
    o, // 번역 함수 (개행 처리)
    switchLanguage, // 언어 설정
    toggleLanguage, // 언어 토글
  };
};

export default useLanguage;
