-- 코드 카테고리 및 공통코드 시드 (2025-01-28)
-- board.type_category_code, topic.status_category_code, user.role 등 FK 참조용

-- code_category
INSERT INTO "code_category" ("code", "is_sealed", "name", "description", "note")
VALUES
  ('board_type', false, '게시판 타입', '게시판 종류 분류', NULL),
  ('topic_status', false, '게시글 상태', '게시글 상태 분류', NULL),
  ('role', false, '권한', '사용자 권한 분류', NULL),
  ('user_auth_count_type', false, '인증 시도 유형', '인증 시도 카운트 유형', NULL),
  ('verification_type', false, '인증 유형', '이메일/비밀번호 등 인증 유형', NULL),
  ('notification_type', false, '알림 유형', '알림 타입 분류', NULL)
ON CONFLICT ("code") DO NOTHING;

-- code (board_type)
INSERT INTO "code" ("category_code", "code", "name", "value", "description", "note", "order")
VALUES
  ('board_type', 'project', '프로젝트', NULL, '프로젝트 게시판', NULL, 0),
  ('board_type', 'notice', '공지', NULL, '공지 게시판', NULL, 1),
  ('board_type', 'qna', 'Q&A', NULL, '질의응답 게시판', NULL, 2),
  ('board_type', 'free', '자유', NULL, '자유 게시판', NULL, 3)
ON CONFLICT ("category_code", "code") DO NOTHING;

-- code (topic_status) - 공개/비공개는 topic.is_public으로 처리
INSERT INTO "code" ("category_code", "code", "name", "value", "description", "note", "order")
VALUES
  ('topic_status', 'created', '작성됨', NULL, '작성됨', NULL, 0),
  ('topic_status', 'temporary', '임시저장', NULL, '임시 저장', NULL, 1)
ON CONFLICT ("category_code", "code") DO NOTHING;

-- code (role)
INSERT INTO "code" ("category_code", "code", "name", "value", "description", "note", "order")
VALUES
  ('role', 'user', '일반 사용자', NULL, '일반 회원', NULL, 0),
  ('role', 'admin', '관리자', NULL, '관리자', NULL, 1)
ON CONFLICT ("category_code", "code") DO NOTHING;

-- code (user_auth_count_type)
INSERT INTO "code" ("category_code", "code", "name", "value", "description", "note", "order")
VALUES
  ('user_auth_count_type', 'login_attempt', '로그인 시도', NULL, '로그인 실패 카운트', NULL, 0)
ON CONFLICT ("category_code", "code") DO NOTHING;

-- code (verification_type)
INSERT INTO "code" ("category_code", "code", "name", "value", "description", "note", "order")
VALUES
  ('verification_type', 'email_verify', '이메일 인증', NULL, '이메일 인증 코드', NULL, 0),
  ('verification_type', 'password_reset', '비밀번호 재설정', NULL, '비밀번호 재설정 인증', NULL, 1)
ON CONFLICT ("category_code", "code") DO NOTHING;

-- code (notification_type)
INSERT INTO "code" ("category_code", "code", "name", "value", "description", "note", "order")
VALUES
  ('notification_type', 'comment', '댓글', NULL, '댓글 알림', NULL, 0),
  ('notification_type', 'reply', '답글', NULL, '답글 알림', NULL, 1),
  ('notification_type', 'system', '시스템', NULL, '시스템 공지', NULL, 2)
ON CONFLICT ("category_code", "code") DO NOTHING;
