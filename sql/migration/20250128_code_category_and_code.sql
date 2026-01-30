-- 코드 카테고리 및 공통코드 시드 (2025-01-28)
-- board.type_category_code, topic.status_category_code, user.role 등 FK 참조용

-- code_category
INSERT INTO "code_category" ("code", "is_sealed", "name", "description", "note")
VALUES
  ('BOARD_TYPE', false, '게시판 타입', '게시판 종류 분류', NULL),
  ('TOPIC_STATUS', false, '게시글 상태', '게시글 상태 분류', NULL),
  ('ROLE', false, '권한', '사용자 권한 분류', NULL),
  ('USER_AUTH_COUNT_TYPE', false, '인증 시도 유형', '인증 시도 카운트 유형', NULL),
  ('VERIFICATION_TYPE', false, '인증 유형', '이메일/비밀번호 등 인증 유형', NULL),
  ('NOTIFICATION_TYPE', false, '알림 유형', '알림 타입 분류', NULL)
ON CONFLICT ("code") DO NOTHING;

-- code (BOARD_TYPE)
INSERT INTO "code" ("category_code", "code", "name", "value", "description", "note", "order")
VALUES
  ('BOARD_TYPE', 'project', '프로젝트', NULL, '프로젝트 게시판', NULL, 0),
  ('BOARD_TYPE', 'notice', '공지', NULL, '공지 게시판', NULL, 1),
  ('BOARD_TYPE', 'qna', 'Q&A', NULL, '질의응답 게시판', NULL, 2),
  ('BOARD_TYPE', 'free', '자유', NULL, '자유 게시판', NULL, 3)
ON CONFLICT ("category_code", "code") DO NOTHING;

-- code (TOPIC_STATUS)
INSERT INTO "code" ("category_code", "code", "name", "value", "description", "note", "order")
VALUES
  ('TOPIC_STATUS', 'created', '작성됨', NULL, '작성/수정 중', NULL, 0),
  ('TOPIC_STATUS', 'published', '공개', NULL, '공개됨', NULL, 1),
  ('TOPIC_STATUS', 'hidden', '비공개', NULL, '비공개', NULL, 2),
  ('TOPIC_STATUS', 'deleted', '삭제됨', NULL, '삭제 처리', NULL, 3)
ON CONFLICT ("category_code", "code") DO NOTHING;

-- code (ROLE)
INSERT INTO "code" ("category_code", "code", "name", "value", "description", "note", "order")
VALUES
  ('ROLE', 'USER', '일반 사용자', NULL, '일반 회원', NULL, 0),
  ('ROLE', 'ADMIN', '관리자', NULL, '관리자', NULL, 1)
ON CONFLICT ("category_code", "code") DO NOTHING;

-- code (USER_AUTH_COUNT_TYPE)
INSERT INTO "code" ("category_code", "code", "name", "value", "description", "note", "order")
VALUES
  ('USER_AUTH_COUNT_TYPE', 'LOGIN_ATTEMPT', '로그인 시도', NULL, '로그인 실패 카운트', NULL, 0)
ON CONFLICT ("category_code", "code") DO NOTHING;

-- code (VERIFICATION_TYPE)
INSERT INTO "code" ("category_code", "code", "name", "value", "description", "note", "order")
VALUES
  ('VERIFICATION_TYPE', 'EMAIL_VERIFY', '이메일 인증', NULL, '이메일 인증 코드', NULL, 0),
  ('VERIFICATION_TYPE', 'PASSWORD_RESET', '비밀번호 재설정', NULL, '비밀번호 재설정 인증', NULL, 1)
ON CONFLICT ("category_code", "code") DO NOTHING;

-- code (NOTIFICATION_TYPE)
INSERT INTO "code" ("category_code", "code", "name", "value", "description", "note", "order")
VALUES
  ('NOTIFICATION_TYPE', 'COMMENT', '댓글', NULL, '댓글 알림', NULL, 0),
  ('NOTIFICATION_TYPE', 'REPLY', '답글', NULL, '답글 알림', NULL, 1),
  ('NOTIFICATION_TYPE', 'SYSTEM', '시스템', NULL, '시스템 공지', NULL, 2)
ON CONFLICT ("category_code", "code") DO NOTHING;
