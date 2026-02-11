INSERT INTO "code_category" ("code", "is_sealed", "name", "description", "note")
VALUES
  ('tag_usage', false, '태그 용도', '태그를 어디에 쓰는지 분류 (게시글/게시판 등)', NULL)
ON CONFLICT ("code") DO NOTHING;

-- code (tag_usage)
INSERT INTO "code" ("category_code", "code", "name", "value", "description", "note", "order")
VALUES
  ('tag_usage', 'topic', '게시글', NULL, '게시글에 붙이는 태그', NULL, 0),
  ('tag_usage', 'board', '게시판', NULL, '게시판에 붙이는 태그', NULL, 1)
ON CONFLICT ("category_code", "code") DO NOTHING;

ALTER TABLE "tag"
  ADD COLUMN IF NOT EXISTS "usage_category_code" VARCHAR(40) NOT NULL DEFAULT 'tag_usage',
  ADD COLUMN IF NOT EXISTS "usage" VARCHAR(40) NOT NULL DEFAULT 'topic';

COMMENT ON COLUMN "tag"."usage_category_code" IS '태그 용도 분류 코드 (code_category.code, 기본: tag_usage)';
COMMENT ON COLUMN "tag"."usage" IS '태그 용도 코드 (code.code, 예: topic, board)';

ALTER TABLE "tag" ADD CONSTRAINT "tag_usage_category_code_fk"
  FOREIGN KEY ("usage_category_code") REFERENCES "code_category" ("code");
ALTER TABLE "tag" ADD CONSTRAINT "tag_usage_fk"
  FOREIGN KEY ("usage_category_code", "usage") REFERENCES "code" ("category_code", "code");

-- 관리단에서 설정하는 키-값 저장소 (파일 저장 경로 등)
CREATE TABLE IF NOT EXISTS "system_setting" (
  "key"   VARCHAR(120) PRIMARY KEY NOT NULL,
  "value" TEXT,
  "updated_at" TIMESTAMP NOT NULL DEFAULT (NOW())
);

COMMENT ON TABLE "system_setting" IS '시스템 설정 (관리자 설정용 키-값)';
COMMENT ON COLUMN "system_setting"."key" IS '설정 키 (예: file.storage.basePath)';
COMMENT ON COLUMN "system_setting"."value" IS '설정 값';
COMMENT ON COLUMN "system_setting"."updated_at" IS '마지막 수정일시';

CREATE TABLE IF NOT EXISTS "upload_session" (
  "id"         UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
  "session_id" VARCHAR(64) NOT NULL UNIQUE,
  "user_id"    UUID NOT NULL,
  "expires_at" TIMESTAMP NOT NULL,
  "created_at" TIMESTAMP NOT NULL DEFAULT (NOW())
);

COMMENT ON TABLE "upload_session" IS '파일 업로드용 임시 세션 (서버 발급, TTL 후 만료)';
COMMENT ON COLUMN "upload_session"."session_id" IS 'common_file.session_id에 넣는 값';
COMMENT ON COLUMN "upload_session"."user_id" IS '발급 대상 사용자';
COMMENT ON COLUMN "upload_session"."expires_at" IS '만료 시각';

ALTER TABLE "upload_session"
  ADD CONSTRAINT "upload_session_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "user" ("id");

CREATE INDEX IF NOT EXISTS "upload_session_session_id_idx" ON "upload_session" ("session_id");
CREATE INDEX IF NOT EXISTS "upload_session_expires_at_idx" ON "upload_session" ("expires_at");
