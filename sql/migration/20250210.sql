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
