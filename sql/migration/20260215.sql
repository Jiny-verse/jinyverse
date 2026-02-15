-- audit_log 테이블에 metadata 컬럼 추가
ALTER TABLE "audit_log" ADD COLUMN IF NOT EXISTS "metadata" JSONB;
COMMENT ON COLUMN "audit_log"."metadata" IS '추가 식별 메타데이터 (예: {"codeKey":"..."}, {"key":"..."})';
 