-- Fix: 태그 삭제 시 rel__topic_tag 연결 행 자동 삭제
ALTER TABLE "rel__topic_tag"
  DROP CONSTRAINT IF EXISTS "rel__topic_tag_tag_id_fkey";

ALTER TABLE "rel__topic_tag"
  ADD CONSTRAINT "rel__topic_tag_tag_id_fkey"
  FOREIGN KEY ("tag_id") REFERENCES "tag" ("id") ON DELETE CASCADE;
