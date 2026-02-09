ALTER TABLE "menu" DROP COLUMN IF EXISTS "channel";

ALTER TABLE "menu"
  ADD COLUMN IF NOT EXISTS "channel_category_code" VARCHAR(40) NOT NULL DEFAULT 'menu_channel';

ALTER TABLE "menu"
  ADD COLUMN IF NOT EXISTS "channel" VARCHAR(40) NOT NULL DEFAULT 'INTERNAL';

COMMENT ON COLUMN "menu"."channel_category_code" IS '메뉴 표시 채널 분류 코드 (menu_channel)';
COMMENT ON COLUMN "menu"."channel" IS '메뉴 표시 채널 코드: INTERNAL, EXTERNAL, PUBLIC';

INSERT INTO "code_category" ("code", "is_sealed", "name", "description", "note")
VALUES ('menu_channel', false, '메뉴 채널', '메뉴 표시 채널 (내부/외부/공개)', NULL)
ON CONFLICT ("code") DO NOTHING;

INSERT INTO "code" ("category_code", "code", "name", "value", "description", "note", "order")
VALUES
  ('menu_channel', 'INTERNAL', '내부', NULL, '관리자(Internal) 채널 전용', NULL, 0),
  ('menu_channel', 'EXTERNAL', '외부', NULL, '외부(External) 채널 전용', NULL, 1),
  ('menu_channel', 'PUBLIC', '공개', NULL, '내부·외부 모두 표시', NULL, 2)
ON CONFLICT ("category_code", "code") DO NOTHING;

ALTER TABLE "menu"
  ADD CONSTRAINT "fk_menu_channel_code"
  FOREIGN KEY ("channel_category_code", "channel") REFERENCES "code" ("category_code", "code");

ALTER TABLE "menu"
  ADD COLUMN IF NOT EXISTS "path" VARCHAR(500);

COMMENT ON COLUMN "menu"."path" IS '메뉴 기본 링크(경로/URL). 게시판·게시글 연동 없을 때 사용';


ALTER TABLE "topic"
  ADD COLUMN IF NOT EXISTS "source_topic_id" UUID NULL;

ALTER TABLE "topic"
  ADD COLUMN IF NOT EXISTS "hidden" BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN "topic"."source_topic_id" IS '원본 게시글 id. 있으면 이 행은 해당 원본의 임시저장(초안). null이면 일반/원본 게시글.';
COMMENT ON COLUMN "topic"."hidden" IS 'true면 목록에서 제외. 원본이 초안이 있을 때 true.';

ALTER TABLE "topic"
  ADD CONSTRAINT "fk_topic_source_topic"
  FOREIGN KEY ("source_topic_id") REFERENCES "topic" ("id");

CREATE INDEX IF NOT EXISTS "ix_topic_source_topic_id" ON "topic" ("source_topic_id");
CREATE INDEX IF NOT EXISTS "ix_topic_hidden" ON "topic" ("hidden");

