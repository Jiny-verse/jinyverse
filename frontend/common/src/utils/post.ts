import type { Topic } from '../schemas/topic';

/** topic.files 에서 isMain=true 인 파일의 fileId 반환 */
export function getMainFileId(topic: Topic): string | null {
  const file = topic.files?.find((f) => f.isMain);
  return file?.fileId ?? null;
}

/** HTML 태그 제거 후 앞 n자 추출 */
export function getExcerpt(content: string, maxLength = 150): string {
  const text = content
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(?:p|div|li|h[1-6]|blockquote|tr)>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/[^\S\n]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '…';
}
