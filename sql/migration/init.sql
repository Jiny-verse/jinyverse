CREATE TABLE "code_category" (
  "code" VARCHAR(40) PRIMARY KEY NOT NULL,
  "is_sealed" BOOLEAN NOT NULL DEFAULT false,
  "name" VARCHAR(50) NOT NULL,
  "description" text,
  "note" text,
  "created_at" TIMESTAMP NOT NULL DEFAULT (NOW()),
  "updated_at" TIMESTAMP NOT NULL DEFAULT (NOW()),
  "deleted_at" timestamp
);

CREATE TABLE "code" (
  "category_code" VARCHAR(40) NOT NULL,
  "code" VARCHAR(40) NOT NULL,
  "name" VARCHAR(50) NOT NULL,
  "value" text,
  "description" text,
  "note" text,
  "order" INT NOT NULL DEFAULT 0,
  "upper_category_code" VARCHAR(40),
  "upper_code" VARCHAR(40),
  "created_at" TIMESTAMP NOT NULL DEFAULT (NOW()),
  "updated_at" TIMESTAMP NOT NULL DEFAULT (NOW()),
  "deleted_at" timestamp,
  PRIMARY KEY ("category_code", "code")
);

CREATE TABLE "board" (
  "id" UUID PRIMARY KEY NOT NULL,
  "menu_code" VARCHAR(40),
  "type_category_code" VARCHAR(40) NOT NULL DEFAULT 'board_type',
  "type" VARCHAR(40) NOT NULL DEFAULT 'project',
  "name" VARCHAR(50) NOT NULL,
  "description" text,
  "note" text,
  "is_public" BOOLEAN NOT NULL DEFAULT true,
  "order" INT NOT NULL DEFAULT 0,
  "created_at" TIMESTAMP NOT NULL DEFAULT (NOW()),
  "updated_at" TIMESTAMP NOT NULL DEFAULT (NOW()),
  "deleted_at" timestamp
);

CREATE TABLE "topic" (
  "id" UUID PRIMARY KEY NOT NULL,
  "author_user_id" UUID NOT NULL,
  "menu_code" VARCHAR(40),
  "status_category_code" VARCHAR(40) NOT NULL DEFAULT 'topic_status',
  "status" VARCHAR(40) NOT NULL DEFAULT 'created',
  "board_id" UUID NOT NULL,
  "title" VARCHAR(200) NOT NULL,
  "content" TEXT NOT NULL,
  "is_notice" BOOLEAN NOT NULL DEFAULT false,
  "is_pinned" BOOLEAN NOT NULL DEFAULT false,
  "is_public" BOOLEAN NOT NULL DEFAULT true,
  "view_count" INT NOT NULL DEFAULT 0,
  "published_at" timestamp,
  "created_at" TIMESTAMP NOT NULL DEFAULT (NOW()),
  "updated_at" TIMESTAMP NOT NULL DEFAULT (NOW()),
  "deleted_at" timestamp
);

CREATE TABLE "common_file" (
  "id" UUID PRIMARY KEY NOT NULL,
  "session_id" VARCHAR(64),
  "original_name" VARCHAR(255) NOT NULL,
  "stored_name" VARCHAR(255) NOT NULL,
  "file_path" TEXT NOT NULL,
  "file_size" BIGINT NOT NULL,
  "mime_type" VARCHAR(100) NOT NULL,
  "file_ext" VARCHAR(20),
  "created_at" TIMESTAMP NOT NULL DEFAULT (NOW())
);

CREATE TABLE "rel__topic_file" (
  "id" UUID PRIMARY KEY NOT NULL,
  "topic_id" UUID NOT NULL,
  "file_id" UUID NOT NULL,
  "order" INT NOT NULL DEFAULT 0,
  "is_main" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMP NOT NULL DEFAULT (NOW())
);

CREATE TABLE "rel__user_file" (
  "id" UUID PRIMARY KEY NOT NULL,
  "user_id" UUID NOT NULL,
  "file_id" UUID NOT NULL,
  "usage" VARCHAR(40),
  "is_main" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP NOT NULL DEFAULT (NOW())
);

CREATE TABLE "menu" (
  "code" VARCHAR(40) PRIMARY KEY NOT NULL,
  "name" VARCHAR(50) NOT NULL,
  "description" text,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "is_admin" BOOLEAN NOT NULL DEFAULT false,
  "order" INT NOT NULL DEFAULT 0,
  "upper_code" VARCHAR(40),
  "created_at" TIMESTAMP NOT NULL DEFAULT (NOW()),
  "updated_at" TIMESTAMP NOT NULL DEFAULT (NOW()),
  "deleted_at" timestamp
);

CREATE TABLE "user" (
  "id" UUID PRIMARY KEY NOT NULL,
  "role_category_code" VARCHAR(40) NOT NULL DEFAULT 'role',
  "role" VARCHAR(40) NOT NULL DEFAULT 'user',
  "username" VARCHAR(50) NOT NULL,
  "password" VARCHAR(256) NOT NULL,
  "salt" VARCHAR(16) NOT NULL,
  "email" VARCHAR(256) UNIQUE NOT NULL,
  "name" VARCHAR(20) NOT NULL,
  "nickname" VARCHAR(20) NOT NULL,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "is_locked" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMP NOT NULL DEFAULT (NOW()),
  "updated_at" TIMESTAMP NOT NULL DEFAULT (NOW()),
  "deleted_at" timestamp
);

CREATE TABLE "user_auth_count" (
  "id" UUID PRIMARY KEY NOT NULL,
  "user_id" UUID,
  "email" VARCHAR(256) NOT NULL,
  "type_category_code" VARCHAR(40) NOT NULL DEFAULT 'user_auth_count_type',
  "type" VARCHAR(40) NOT NULL,
  "count" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMP NOT NULL DEFAULT (NOW()),
  "updated_at" TIMESTAMP NOT NULL DEFAULT (NOW()),
  "deleted_at" timestamp,
  "expired_at" timestamp
);

CREATE TABLE "verification" (
  "id" UUID PRIMARY KEY NOT NULL,
  "user_id" UUID,
  "session_id" UUID,
  "type_category_code" VARCHAR(40) NOT NULL DEFAULT 'verification_type',
  "type" VARCHAR(40) NOT NULL,
  "email" VARCHAR(256) NOT NULL,
  "code" VARCHAR(50) NOT NULL,
  "is_verified" BOOLEAN NOT NULL DEFAULT false,
  "is_sent" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMP NOT NULL DEFAULT (NOW()),
  "updated_at" TIMESTAMP NOT NULL DEFAULT (NOW()),
  "deleted_at" timestamp,
  "expired_at" timestamp
);

CREATE TABLE "user_session" (
  "id" UUID PRIMARY KEY NOT NULL,
  "user_id" UUID NOT NULL,
  "refresh_token" VARCHAR(512) NOT NULL,
  "user_agent" VARCHAR(255),
  "ip_address" VARCHAR(45),
  "is_revoked" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMP NOT NULL DEFAULT (NOW()),
  "updated_at" TIMESTAMP NOT NULL DEFAULT (NOW()),
  "deleted_at" timestamp,
  "expired_at" TIMESTAMP NOT NULL
);

CREATE TABLE "audit_log" (
  "id" UUID PRIMARY KEY NOT NULL,
  "target_type" VARCHAR(40) NOT NULL,
  "target_id" UUID,
  "action" VARCHAR(40) NOT NULL,
  "before_data" JSONB,
  "after_data" JSONB,
  "actor_user_id" UUID,
  "ip_address" VARCHAR(45),
  "created_at" TIMESTAMP NOT NULL DEFAULT (NOW()),
  "updated_at" TIMESTAMP NOT NULL DEFAULT (NOW()),
  "deleted_at" timestamp
);

CREATE TABLE "notification" (
  "id" UUID PRIMARY KEY NOT NULL,
  "user_id" UUID NOT NULL,
  "type_category_code" VARCHAR(40) NOT NULL DEFAULT 'notification_type',
  "type" VARCHAR(40) NOT NULL,
  "message" TEXT NOT NULL,
  "link" text,
  "is_read" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMP NOT NULL DEFAULT (NOW()),
  "updated_at" TIMESTAMP NOT NULL DEFAULT (NOW()),
  "deleted_at" timestamp,
  "read_at" timestamp
);

CREATE TABLE "comment" (
  "id" UUID PRIMARY KEY NOT NULL,
  "topic_id" UUID NOT NULL,
  "user_id" UUID NOT NULL,
  "upper_comment_id" UUID,
  "content" TEXT NOT NULL,
  "is_deleted" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMP NOT NULL DEFAULT (NOW()),
  "updated_at" TIMESTAMP NOT NULL DEFAULT (NOW()),
  "deleted_at" timestamp
);

CREATE TABLE "tag" (
  "id" UUID PRIMARY KEY NOT NULL,
  "name" VARCHAR(50) UNIQUE NOT NULL,
  "description" text,
  "created_at" TIMESTAMP NOT NULL DEFAULT (NOW()),
  "updated_at" TIMESTAMP NOT NULL DEFAULT (NOW()),
  "deleted_at" timestamp
);

CREATE TABLE "rel__topic_tag" (
  "id" UUID PRIMARY KEY NOT NULL,
  "topic_id" UUID NOT NULL,
  "tag_id" UUID NOT NULL,
  "created_at" TIMESTAMP NOT NULL DEFAULT (NOW()),
  "updated_at" TIMESTAMP NOT NULL DEFAULT (NOW()),
  "deleted_at" timestamp
);

CREATE UNIQUE INDEX ON "rel__topic_tag" ("topic_id", "tag_id");

COMMENT ON COLUMN "code_category"."code" IS '공통코드 분류 식별자';

COMMENT ON COLUMN "code_category"."is_sealed" IS '해당 분류 내 코드 수정/추가 가능 여부';

COMMENT ON COLUMN "code_category"."name" IS '공통코드 분류 명';

COMMENT ON COLUMN "code_category"."description" IS '분류 설명';

COMMENT ON COLUMN "code_category"."note" IS '비고';

COMMENT ON COLUMN "code_category"."created_at" IS '생성일시';

COMMENT ON COLUMN "code_category"."updated_at" IS '수정일시';

COMMENT ON COLUMN "code_category"."deleted_at" IS '삭제일시 (소프트 삭제)';

COMMENT ON COLUMN "code"."category_code" IS '공통코드 분류 코드';

COMMENT ON COLUMN "code"."code" IS '공통코드 값';

COMMENT ON COLUMN "code"."name" IS '공통코드 명';

COMMENT ON COLUMN "code"."value" IS '코드에 매핑되는 값';

COMMENT ON COLUMN "code"."description" IS '코드 설명';

COMMENT ON COLUMN "code"."note" IS '비고';

COMMENT ON COLUMN "code"."order" IS '정렬 순서';

COMMENT ON COLUMN "code"."upper_category_code" IS '상위 코드 분류 (upper_code와 함께 null이거나 함께 사용)';

COMMENT ON COLUMN "code"."upper_code" IS '상위 코드 값 (upper_category_code와 함께 null이거나 함께 사용)';

COMMENT ON COLUMN "code"."created_at" IS '생성일시';

COMMENT ON COLUMN "code"."updated_at" IS '수정일시';

COMMENT ON COLUMN "code"."deleted_at" IS '삭제일시';

COMMENT ON COLUMN "board"."id" IS '게시판 고유 ID';

COMMENT ON COLUMN "board"."menu_code" IS '연결된 메뉴 코드';

COMMENT ON COLUMN "board"."type_category_code" IS '게시판 타입 분류 코드 (board_type)';

COMMENT ON COLUMN "board"."type" IS '게시판 타입 코드 값';

COMMENT ON COLUMN "board"."name" IS '게시판 명';

COMMENT ON COLUMN "board"."description" IS '게시판 설명';

COMMENT ON COLUMN "board"."note" IS '비고';

COMMENT ON COLUMN "board"."is_public" IS '게시판 공개 여부';

COMMENT ON COLUMN "board"."order" IS '게시판 정렬 순서';

COMMENT ON COLUMN "board"."created_at" IS '생성일시';

COMMENT ON COLUMN "board"."updated_at" IS '수정일시';

COMMENT ON COLUMN "board"."deleted_at" IS '삭제일시';

COMMENT ON COLUMN "topic"."id" IS '게시글 고유 ID';

COMMENT ON COLUMN "topic"."author_user_id" IS '게시글 작성자 ID';

COMMENT ON COLUMN "topic"."menu_code" IS '연결된 메뉴 코드';

COMMENT ON COLUMN "topic"."status_category_code" IS '게시글 상태 분류 코드';

COMMENT ON COLUMN "topic"."status" IS '게시글 상태 코드 값';

COMMENT ON COLUMN "topic"."board_id" IS '소속 게시판 ID';

COMMENT ON COLUMN "topic"."title" IS '게시글 제목';

COMMENT ON COLUMN "topic"."content" IS '게시글 본문';

COMMENT ON COLUMN "topic"."is_notice" IS '공지글 여부';

COMMENT ON COLUMN "topic"."is_pinned" IS '상단 고정 여부';

COMMENT ON COLUMN "topic"."is_public" IS '공개 여부';

COMMENT ON COLUMN "topic"."view_count" IS '조회수';

COMMENT ON COLUMN "topic"."published_at" IS '게시글 공개 예정 시각';

COMMENT ON COLUMN "topic"."created_at" IS '작성일시';

COMMENT ON COLUMN "topic"."updated_at" IS '수정일시';

COMMENT ON COLUMN "topic"."deleted_at" IS '삭제일시';

COMMENT ON COLUMN "common_file"."id" IS '파일 고유 ID';

COMMENT ON COLUMN "common_file"."session_id" IS '임시 업로드 세션 ID';

COMMENT ON COLUMN "common_file"."original_name" IS '원본 파일명';

COMMENT ON COLUMN "common_file"."stored_name" IS '서버 저장 파일명';

COMMENT ON COLUMN "common_file"."file_path" IS '파일 저장 경로';

COMMENT ON COLUMN "common_file"."file_size" IS '파일 크기 (byte)';

COMMENT ON COLUMN "common_file"."mime_type" IS '파일 MIME 타입';

COMMENT ON COLUMN "common_file"."file_ext" IS '파일 확장자';

COMMENT ON COLUMN "common_file"."created_at" IS '업로드 일시';

COMMENT ON COLUMN "rel__topic_file"."id" IS '게시글-파일 연결 ID';

COMMENT ON COLUMN "rel__topic_file"."topic_id" IS '게시글 ID';

COMMENT ON COLUMN "rel__topic_file"."file_id" IS '파일 ID';

COMMENT ON COLUMN "rel__topic_file"."order" IS '게시글 내 파일 정렬 순서';

COMMENT ON COLUMN "rel__topic_file"."is_main" IS '대표 파일 여부';

COMMENT ON COLUMN "rel__topic_file"."created_at" IS '연결 생성일시';

COMMENT ON COLUMN "rel__user_file"."id" IS '사용자-파일 연결 ID';

COMMENT ON COLUMN "rel__user_file"."user_id" IS '사용자 ID';

COMMENT ON COLUMN "rel__user_file"."file_id" IS '파일 ID';

COMMENT ON COLUMN "rel__user_file"."usage" IS '파일 사용 목적 (PROFILE, COVER 등)';

COMMENT ON COLUMN "rel__user_file"."is_main" IS '대표 이미지 여부';

COMMENT ON COLUMN "rel__user_file"."created_at" IS '연결 생성일시';

COMMENT ON COLUMN "menu"."code" IS '메뉴 코드';

COMMENT ON COLUMN "menu"."name" IS '메뉴 명';

COMMENT ON COLUMN "menu"."description" IS '메뉴 설명';

COMMENT ON COLUMN "menu"."is_active" IS '메뉴 활성 여부';

COMMENT ON COLUMN "menu"."is_admin" IS '관리자 전용 메뉴 여부';

COMMENT ON COLUMN "menu"."order" IS '메뉴 정렬 순서';

COMMENT ON COLUMN "menu"."upper_code" IS '상위 메뉴 코드';

COMMENT ON COLUMN "menu"."created_at" IS '생성일시';

COMMENT ON COLUMN "menu"."updated_at" IS '수정일시';

COMMENT ON COLUMN "menu"."deleted_at" IS '삭제일시';

COMMENT ON COLUMN "user"."id" IS '사용자 고유 ID';

COMMENT ON COLUMN "user"."role_category_code" IS '권한 분류 코드';

COMMENT ON COLUMN "user"."role" IS '권한 코드 값';

COMMENT ON COLUMN "user"."username" IS '로그인 아이디';

COMMENT ON COLUMN "user"."password" IS '비밀번호 해시';

COMMENT ON COLUMN "user"."salt" IS '비밀번호 해시 솔트';

COMMENT ON COLUMN "user"."email" IS '이메일';

COMMENT ON COLUMN "user"."name" IS '사용자 실명';

COMMENT ON COLUMN "user"."nickname" IS '닉네임';

COMMENT ON COLUMN "user"."is_active" IS '계정 활성 여부';

COMMENT ON COLUMN "user"."is_locked" IS '계정 잠금 여부';

COMMENT ON COLUMN "user"."created_at" IS '생성일시';

COMMENT ON COLUMN "user"."updated_at" IS '수정일시';

COMMENT ON COLUMN "user"."deleted_at" IS '삭제일시';

COMMENT ON COLUMN "user_auth_count"."id" IS '인증 시도 카운트 ID';

COMMENT ON COLUMN "user_auth_count"."user_id" IS '사용자 ID';

COMMENT ON COLUMN "user_auth_count"."email" IS '이메일 (비정규화)';

COMMENT ON COLUMN "user_auth_count"."type_category_code" IS '인증 시도 유형 분류 코드';

COMMENT ON COLUMN "user_auth_count"."type" IS '인증 시도 유형 코드';

COMMENT ON COLUMN "user_auth_count"."count" IS '시도 횟수';

COMMENT ON COLUMN "user_auth_count"."created_at" IS '생성일시';

COMMENT ON COLUMN "user_auth_count"."updated_at" IS '수정일시';

COMMENT ON COLUMN "user_auth_count"."deleted_at" IS '삭제일시';

COMMENT ON COLUMN "user_auth_count"."expired_at" IS '만료 일시';

COMMENT ON COLUMN "verification"."id" IS '인증 정보 ID';

COMMENT ON COLUMN "verification"."user_id" IS '사용자 ID';

COMMENT ON COLUMN "verification"."session_id" IS '세션 ID';

COMMENT ON COLUMN "verification"."type_category_code" IS '인증 유형 분류 코드';

COMMENT ON COLUMN "verification"."type" IS '인증 유형 코드';

COMMENT ON COLUMN "verification"."email" IS '인증 대상 이메일';

COMMENT ON COLUMN "verification"."code" IS '인증 코드';

COMMENT ON COLUMN "verification"."is_verified" IS '인증 완료 여부';

COMMENT ON COLUMN "verification"."is_sent" IS '인증 메일 발송 여부';

COMMENT ON COLUMN "verification"."created_at" IS '생성일시';

COMMENT ON COLUMN "verification"."updated_at" IS '수정일시';

COMMENT ON COLUMN "verification"."deleted_at" IS '삭제일시';

COMMENT ON COLUMN "verification"."expired_at" IS '만료 일시';

COMMENT ON COLUMN "user_session"."id" IS '세션 ID';

COMMENT ON COLUMN "user_session"."user_id" IS '사용자 ID';

COMMENT ON COLUMN "user_session"."refresh_token" IS '리프레시 토큰';

COMMENT ON COLUMN "user_session"."user_agent" IS '브라우저/디바이스 정보';

COMMENT ON COLUMN "user_session"."ip_address" IS '접속 IP (IPv4/IPv6)';

COMMENT ON COLUMN "user_session"."is_revoked" IS '강제 만료 여부';

COMMENT ON COLUMN "user_session"."created_at" IS '생성일';

COMMENT ON COLUMN "user_session"."updated_at" IS '수정일시';

COMMENT ON COLUMN "user_session"."deleted_at" IS '삭제일시';

COMMENT ON COLUMN "user_session"."expired_at" IS '만료일';

COMMENT ON COLUMN "audit_log"."id" IS '감사 로그 ID';

COMMENT ON COLUMN "audit_log"."target_type" IS '대상 타입 (USER, TOPIC, CODE 등)';

COMMENT ON COLUMN "audit_log"."target_id" IS '대상 ID (nullable 허용)';

COMMENT ON COLUMN "audit_log"."action" IS '행위 유형 (CREATE, UPDATE, DELETE)';

COMMENT ON COLUMN "audit_log"."before_data" IS '변경 전 데이터';

COMMENT ON COLUMN "audit_log"."after_data" IS '변경 후 데이터';

COMMENT ON COLUMN "audit_log"."actor_user_id" IS '행위자 사용자 ID';

COMMENT ON COLUMN "audit_log"."ip_address" IS '요청 IP';

COMMENT ON COLUMN "audit_log"."created_at" IS '행위 시점';

COMMENT ON COLUMN "audit_log"."updated_at" IS '수정일시';

COMMENT ON COLUMN "audit_log"."deleted_at" IS '삭제일시';

COMMENT ON COLUMN "notification"."id" IS '알림 ID';

COMMENT ON COLUMN "notification"."user_id" IS '수신 사용자 ID';

COMMENT ON COLUMN "notification"."type_category_code" IS '알림 타입 분류';

COMMENT ON COLUMN "notification"."type" IS '알림 타입 코드 (COMMENT, REPLY, SYSTEM 등)';

COMMENT ON COLUMN "notification"."message" IS '알림 메시지';

COMMENT ON COLUMN "notification"."link" IS '이동 링크';

COMMENT ON COLUMN "notification"."is_read" IS '읽음 여부';

COMMENT ON COLUMN "notification"."created_at" IS '생성일';

COMMENT ON COLUMN "notification"."updated_at" IS '수정일시';

COMMENT ON COLUMN "notification"."deleted_at" IS '삭제일시';

COMMENT ON COLUMN "notification"."read_at" IS '읽은 시점';

COMMENT ON COLUMN "comment"."id" IS '댓글 ID';

COMMENT ON COLUMN "comment"."topic_id" IS '게시글 ID';

COMMENT ON COLUMN "comment"."user_id" IS '작성자 사용자 ID';

COMMENT ON COLUMN "comment"."upper_comment_id" IS '상위 댓글 ID';

COMMENT ON COLUMN "comment"."content" IS '댓글 내용';

COMMENT ON COLUMN "comment"."is_deleted" IS '삭제 여부';

COMMENT ON COLUMN "comment"."created_at" IS '작성일시';

COMMENT ON COLUMN "comment"."updated_at" IS '수정일시';

COMMENT ON COLUMN "comment"."deleted_at" IS '삭제일시';

COMMENT ON COLUMN "tag"."id" IS '태그 ID';

COMMENT ON COLUMN "tag"."name" IS '태그 명';

COMMENT ON COLUMN "tag"."description" IS '태그 설명';

COMMENT ON COLUMN "tag"."created_at" IS '생성일시';

COMMENT ON COLUMN "tag"."updated_at" IS '수정일시';

COMMENT ON COLUMN "tag"."deleted_at" IS '삭제일시';

COMMENT ON COLUMN "rel__topic_tag"."id" IS '게시글-태그 연결 ID';

COMMENT ON COLUMN "rel__topic_tag"."topic_id" IS '게시글 ID';

COMMENT ON COLUMN "rel__topic_tag"."tag_id" IS '태그 ID';

COMMENT ON COLUMN "rel__topic_tag"."created_at" IS '연결 생성일시';

COMMENT ON COLUMN "rel__topic_tag"."updated_at" IS '수정일시';

COMMENT ON COLUMN "rel__topic_tag"."deleted_at" IS '삭제일시';

ALTER TABLE "code" ADD FOREIGN KEY ("category_code") REFERENCES "code_category" ("code");

ALTER TABLE "code" ADD FOREIGN KEY ("upper_category_code") REFERENCES "code_category" ("code");

ALTER TABLE "code" ADD FOREIGN KEY ("upper_category_code", "upper_code") REFERENCES "code" ("category_code", "code");

ALTER TABLE "board" ADD FOREIGN KEY ("menu_code") REFERENCES "menu" ("code");

ALTER TABLE "board" ADD FOREIGN KEY ("type_category_code") REFERENCES "code_category" ("code");

ALTER TABLE "board" ADD FOREIGN KEY ("type_category_code", "type") REFERENCES "code" ("category_code", "code");

ALTER TABLE "topic" ADD FOREIGN KEY ("author_user_id") REFERENCES "user" ("id");

ALTER TABLE "topic" ADD FOREIGN KEY ("board_id") REFERENCES "board" ("id");

ALTER TABLE "topic" ADD FOREIGN KEY ("menu_code") REFERENCES "menu" ("code");

ALTER TABLE "topic" ADD FOREIGN KEY ("status_category_code") REFERENCES "code_category" ("code");

ALTER TABLE "topic" ADD FOREIGN KEY ("status_category_code", "status") REFERENCES "code" ("category_code", "code");

ALTER TABLE "comment" ADD FOREIGN KEY ("topic_id") REFERENCES "topic" ("id");

ALTER TABLE "comment" ADD FOREIGN KEY ("user_id") REFERENCES "user" ("id");

ALTER TABLE "comment" ADD FOREIGN KEY ("upper_comment_id") REFERENCES "comment" ("id");

ALTER TABLE "rel__topic_file" ADD FOREIGN KEY ("topic_id") REFERENCES "topic" ("id");

ALTER TABLE "rel__topic_file" ADD FOREIGN KEY ("file_id") REFERENCES "common_file" ("id");

ALTER TABLE "rel__user_file" ADD FOREIGN KEY ("user_id") REFERENCES "user" ("id");

ALTER TABLE "rel__user_file" ADD FOREIGN KEY ("file_id") REFERENCES "common_file" ("id");

ALTER TABLE "rel__topic_tag" ADD FOREIGN KEY ("topic_id") REFERENCES "topic" ("id");

ALTER TABLE "rel__topic_tag" ADD FOREIGN KEY ("tag_id") REFERENCES "tag" ("id");

ALTER TABLE "menu" ADD FOREIGN KEY ("upper_code") REFERENCES "menu" ("code");

ALTER TABLE "user" ADD FOREIGN KEY ("role_category_code") REFERENCES "code_category" ("code");

ALTER TABLE "user" ADD FOREIGN KEY ("role_category_code", "role") REFERENCES "code" ("category_code", "code");

ALTER TABLE "user_auth_count" ADD FOREIGN KEY ("user_id") REFERENCES "user" ("id");

ALTER TABLE "user_auth_count" ADD FOREIGN KEY ("type_category_code") REFERENCES "code_category" ("code");

ALTER TABLE "user_auth_count" ADD FOREIGN KEY ("type_category_code", "type") REFERENCES "code" ("category_code", "code");

ALTER TABLE "verification" ADD FOREIGN KEY ("user_id") REFERENCES "user" ("id");

ALTER TABLE "verification" ADD FOREIGN KEY ("type_category_code") REFERENCES "code_category" ("code");

ALTER TABLE "verification" ADD FOREIGN KEY ("type_category_code", "type") REFERENCES "code" ("category_code", "code");

ALTER TABLE "user_session" ADD FOREIGN KEY ("user_id") REFERENCES "user" ("id");

ALTER TABLE "audit_log" ADD FOREIGN KEY ("actor_user_id") REFERENCES "user" ("id");

ALTER TABLE "notification" ADD FOREIGN KEY ("user_id") REFERENCES "user" ("id");

ALTER TABLE "notification" ADD FOREIGN KEY ("type_category_code") REFERENCES "code_category" ("code");

ALTER TABLE "notification" ADD FOREIGN KEY ("type_category_code", "type") REFERENCES "code" ("category_code", "code");

-- order(순서) 중복 방지: 스코프별 unique 제약
CREATE UNIQUE INDEX code_category_order_unique ON "code" (category_code, "order")
  WHERE deleted_at IS NULL;

CREATE UNIQUE INDEX board_order_unique ON "board" ("order")
  WHERE deleted_at IS NULL;

CREATE UNIQUE INDEX menu_order_root_unique ON "menu" ("order")
  WHERE upper_code IS NULL AND deleted_at IS NULL;

CREATE UNIQUE INDEX menu_order_child_unique ON "menu" (upper_code, "order")
  WHERE upper_code IS NOT NULL AND deleted_at IS NULL;

CREATE UNIQUE INDEX rel_topic_file_topic_order_unique ON "rel__topic_file" (topic_id, "order");
