/**
 * 일정 기간 이내: 상대 시간 (30초 전, 1분 전, 3일 전)
 * 그 이후: 절대 시간 (YYYY년 M월 D일 H시 m분 s초)
 */
const RELATIVE_THRESHOLD_MS = 7 * 24 * 60 * 60 * 1000; // 7일

export function formatRelativeOrAbsolute(
  isoDateString: string,
  t?: (key: string, options?: any) => string,
  now: Date = new Date()
): string {
  const date = new Date(isoDateString);
  if (Number.isNaN(date.getTime())) return isoDateString;

  const diffMs = now.getTime() - date.getTime();
  if (diffMs < 0) return formatAbsolute(date); // 미래면 절대 시간

  if (diffMs >= RELATIVE_THRESHOLD_MS) {
    return formatAbsolute(date);
  }

  const sec = Math.floor(diffMs / 1000);
  const min = Math.floor(diffMs / (60 * 1000));
  const hour = Math.floor(diffMs / (60 * 60 * 1000));
  const day = Math.floor(diffMs / (24 * 60 * 60 * 1000));

  if (!t) {
    if (sec < 60) return `${sec}초 전`;
    if (min < 60) return `${min}분 전`;
    if (hour < 24) return `${hour}시간 전`;
    return `${day}일 전`;
  }

  if (sec < 60) return sec < 10 ? t('datetime.now', { defaultValue: '방금 전' }) : t('datetime.secondsAgo', { count: sec, defaultValue: `${sec}초 전` });
  if (min < 60) return t('datetime.minutesAgo', { count: min, defaultValue: `${min}분 전` });
  if (hour < 24) return t('datetime.hoursAgo', { count: hour, defaultValue: `${hour}시간 전` });
  return t('datetime.daysAgo', { count: day, defaultValue: `${day}일 전` });
}

function formatAbsolute(date: Date): string {
  const y = date.getFullYear();
  const M = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const H = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  const s = String(date.getSeconds()).padStart(2, '0');
  return `${y}-${M}-${d} ${H}:${m}:${s}`;
}
