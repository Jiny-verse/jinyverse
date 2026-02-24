-- menu code 유니크 제약을 소프트 삭제 대응 부분 인덱스로 교체
ALTER TABLE "menu" DROP CONSTRAINT IF EXISTS "menu_code_key";
CREATE UNIQUE INDEX "menu_code_key" ON "menu" ("code") WHERE "deleted_at" IS NULL;
