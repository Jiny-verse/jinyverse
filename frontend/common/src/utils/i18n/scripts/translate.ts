/**
 * 번역 스크립트
 * 한국어 JSON 파일(ko.json)을 읽어서 영어 JSON 파일(en.json)을 자동으로 생성합니다.
 *
 * 사용법:
 *   pnpm translate
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 깊은 객체를 평탄화하는 함수
function flattenObject(obj: any, prefix = ''): Record<string, string> {
  const result: Record<string, string> = {};

  for (const key in obj) {
    const value = obj[key];
    const newKey = prefix ? `${prefix}.${key}` : key;

    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      Object.assign(result, flattenObject(value, newKey));
    } else {
      result[newKey] = String(value);
    }
  }

  return result;
}

// 평탄화된 객체를 다시 중첩 객체로 변환
function unflattenObject(flat: Record<string, string>): any {
  const result: any = {};

  for (const key in flat) {
    const keys = key.split('.');
    let current = result;

    for (let i = 0; i < keys.length - 1; i++) {
      const k = keys[i];
      if (!(k in current)) {
        current[k] = {};
      }
      current = current[k];
    }

    current[keys[keys.length - 1]] = flat[key];
  }

  return result;
}

// 간단한 번역 함수 (실제로는 번역 API를 사용해야 함)
async function translateToEnglish(text: string): Promise<string> {
  // TODO: 실제 번역 API 연동 (Google Translate, DeepL 등)
  // 현재는 기본 번역 맵을 사용

  const translationMap: Record<string, string> = {
    승인: 'Accept',
    취소: 'Cancel',
    확인: 'Confirm',
    삭제: 'Delete',
    저장: 'Save',
    수정: 'Edit',
    닫기: 'Close',
    입력하세요: 'Please enter',
    검색: 'Search',
    '다음과 같은 것에 주의하세요': 'Please note the following',
    '오류가 발생했습니다': 'An error has occurred',
    '성공적으로 완료되었습니다': 'Completed successfully',
    '정말로 진행하시겠습니까?': 'Are you sure you want to proceed?',
  };

  // 번역 맵에 있으면 사용, 없으면 원문 반환
  return translationMap[text] || text;
}

async function generateEnglishTranslation() {
  console.log('번역 파일 생성 중...');

  // 한국어 JSON 파일 읽기 (scripts 폴더에서 상위로 올라가서 locales 접근)
  const koFilePath = path.join(__dirname, '..', 'locales', 'ko.json');
  const koContent = fs.readFileSync(koFilePath, 'utf-8');
  const ko = JSON.parse(koContent);

  // 한국어 객체를 평탄화
  const flatKo = flattenObject(ko);

  // 각 값에 대해 번역
  const flatEn: Record<string, string> = {};
  for (const key in flatKo) {
    const koreanText = flatKo[key];
    flatEn[key] = await translateToEnglish(koreanText);
  }

  // 다시 중첩 객체로 변환
  const en = unflattenObject(flatEn);

  // JSON 파일 생성
  const fileContent = JSON.stringify(en, null, 2);

  // 파일 경로
  const filePath = path.join(__dirname, '..', 'locales', 'en.json');

  // 파일 쓰기
  fs.writeFileSync(filePath, fileContent, 'utf-8');

  console.log('영어 번역 파일이 생성되었습니다:', filePath);
}

// 스크립트 실행
generateEnglishTranslation().catch(console.error);

export { generateEnglishTranslation };
