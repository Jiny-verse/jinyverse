export const BOARD_TYPES = ['normal', 'blog', 'project', 'gallery'] as const;

export type BoardType = (typeof BOARD_TYPES)[number];

export const BOARD_TYPE_LABELS: Record<BoardType, string> = {
  normal: '일반',
  blog: '블로그',
  project: '프로젝트',
  gallery: '갤러리',
};

/** 썸네일/커버 이미지가 필요한 타입 */
export const BOARD_TYPE_REQUIRES_THUMBNAIL: Record<BoardType, boolean> = {
  normal: false,
  blog: true,
  project: true,
  gallery: true,
};

/** 본문이 필수인 타입 */
export const BOARD_TYPE_CONTENT_REQUIRED: Record<BoardType, boolean> = {
  normal: true,
  blog: true,
  project: true,
  gallery: false,
};
