-- 기존 코드 소프트 삭제
UPDATE "code" SET "deleted_at" = now()
WHERE "category_code" = 'board_type'
  AND "code" IN ('project', 'notice', 'qna', 'free')
  AND "deleted_at" IS NULL;

-- 신규 코드 등록
INSERT INTO "code" ("category_code", "code", "name", "value", "description", "note", "order")
VALUES
  ('board_type', 'normal',  '일반',    NULL, '테이블형 목록 게시판',             NULL, 0),
  ('board_type', 'blog',    '블로그',  NULL, '좌측 썸네일 + 우측 텍스트 카드형', NULL, 1),
  ('board_type', 'project', '프로젝트',NULL, '상단 이미지 + 태그 + 메타 카드형', NULL, 2),
  ('board_type', 'gallery', '갤러리',  NULL, '인스타그램형 정사각형 그리드',     NULL, 3)
ON CONFLICT ("category_code", "code") DO NOTHING;
