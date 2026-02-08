import { redirect } from 'next/navigation';

/**
 * External에서는 전체 보드 목록을 보여주지 않음.
 * 필요한 보드만 링크로 진입하므로 /boards 접근 시 랜딩으로 이동.
 */
export default function BoardsPage() {
  redirect('/landing');
}
