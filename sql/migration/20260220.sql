-- 멱등성 레코드 테이블
CREATE TABLE "idempotency_record" (
  "idempotency_key" VARCHAR(36)  PRIMARY KEY,
  "request_path"    VARCHAR(255) NOT NULL,
  "request_method"  VARCHAR(10)  NOT NULL,
  "request_hash"    VARCHAR(64)  NOT NULL,
  "status"          VARCHAR(20)  NOT NULL DEFAULT 'PROCESSING',
  "response_status" INTEGER,
  "response_body"   TEXT,
  "created_at"      TIMESTAMP    NOT NULL DEFAULT now(),
  "completed_at"    TIMESTAMP
);

CREATE INDEX "idx_idempotency_record_created_at" ON "idempotency_record" ("created_at");
