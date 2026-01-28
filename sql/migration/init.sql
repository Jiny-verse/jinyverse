CREATE TABLE "CODE_CATEGORY" (
  "code" varchar(40) PRIMARY KEY NOT NULL,
  "is_sealed" boolean DEFAULT false,
  "name" varchar(50) NOT NULL,
  "description" text,
  "note" text,
  "created_at" timestamp NOT NULL DEFAULT (now()),
  "updated_at" timestamp NOT NULL DEFAULT (now()),
  "deleted_at" timestamp
);

CREATE TABLE "CODE" (
  "category_code" varchar(40) NOT NULL,
  "code" varchar(40) NOT NULL,
  "name" varchar(50) NOT NULL,
  "value" text,
  "description" text,
  "note" text,
  "order" int NOT NULL DEFAULT 0,
  "upper_category_code" varchar(40),
  "upper_code" varchar(40),
  "created_at" timestamp NOT NULL DEFAULT (now()),
  "updated_at" timestamp NOT NULL DEFAULT (now()),
  "deleted_at" timestamp,
  PRIMARY KEY ("category_code", "code")
);

CREATE TABLE "BOARD" (
  "id" uuid PRIMARY KEY NOT NULL,
  "menu_code" varchar(40),
  "type_category_code" varchar(40) NOT NULL DEFAULT 'BOARD_TYPE',
  "type" varchar(40) NOT NULL DEFAULT 'project',
  "name" varchar(50) NOT NULL,
  "description" text,
  "note" text,
  "is_public" boolean NOT NULL DEFAULT true,
  "order" int NOT NULL DEFAULT 0,
  "created_at" timestamp NOT NULL DEFAULT (now()),
  "updated_at" timestamp NOT NULL DEFAULT (now()),
  "deleted_at" timestamp
);

CREATE TABLE "TOPIC" (
  "id" uuid PRIMARY KEY NOT NULL,
  "author_user_id" uuid NOT NULL,
  "menu_code" varchar(40),
  "status_category_code" varchar(40) NOT NULL DEFAULT 'TOPIC_STATUS',
  "status" varchar(40) NOT NULL DEFAULT 'created',
  "board_id" uuid NOT NULL,
  "title" varchar(200) NOT NULL,
  "content" text NOT NULL,
  "is_notice" boolean NOT NULL DEFAULT false,
  "is_pinned" boolean NOT NULL DEFAULT false,
  "is_public" boolean NOT NULL DEFAULT true,
  "view_count" int NOT NULL DEFAULT 0,
  "published_at" timestamp,
  "created_at" timestamp NOT NULL DEFAULT (now()),
  "updated_at" timestamp NOT NULL DEFAULT (now()),
  "deleted_at" timestamp
);

CREATE TABLE "COMMON_FILE" (
  "id" uuid PRIMARY KEY NOT NULL,
  "session_id" varchar(64),
  "original_name" varchar(255) NOT NULL,
  "stored_name" varchar(255) NOT NULL,
  "file_path" text NOT NULL,
  "file_size" bigint NOT NULL,
  "mime_type" varchar(100) NOT NULL,
  "file_ext" varchar(20),
  "created_at" timestamp NOT NULL DEFAULT (now())
);

CREATE TABLE "REL__TOPIC_FILE" (
  "id" uuid PRIMARY KEY NOT NULL,
  "topic_id" uuid NOT NULL,
  "file_id" uuid NOT NULL,
  "order" int NOT NULL DEFAULT 0,
  "is_main" boolean NOT NULL DEFAULT false,
  "created_at" timestamp NOT NULL DEFAULT (now())
);

CREATE TABLE "REL__USER_FILE" (
  "id" uuid PRIMARY KEY NOT NULL,
  "user_id" uuid NOT NULL,
  "file_id" uuid NOT NULL,
  "usage" varchar(40),
  "is_main" boolean NOT NULL DEFAULT true,
  "created_at" timestamp NOT NULL DEFAULT (now())
);

CREATE TABLE "MENU" (
  "code" varchar(40) PRIMARY KEY NOT NULL,
  "name" varchar(50) NOT NULL,
  "description" text,
  "is_active" boolean NOT NULL DEFAULT true,
  "is_admin" boolean NOT NULL DEFAULT false,
  "order" int NOT NULL DEFAULT 0,
  "upper_code" varchar(40),
  "created_at" timestamp NOT NULL DEFAULT (now()),
  "updated_at" timestamp NOT NULL DEFAULT (now()),
  "deleted_at" timestamp
);

CREATE TABLE "USER" (
  "id" uuid PRIMARY KEY NOT NULL,
  "role_category_code" varchar(40) NOT NULL DEFAULT 'ROLE',
  "role" varchar(40) NOT NULL DEFAULT 'USER',
  "username" varchar(50) NOT NULL,
  "password" varchar(256) NOT NULL,
  "salt" varchar(16) NOT NULL,
  "email" varchar(256) UNIQUE NOT NULL,
  "name" varchar(20) NOT NULL,
  "nickname" varchar(20) NOT NULL,
  "is_active" boolean NOT NULL DEFAULT true,
  "is_locked" boolean NOT NULL DEFAULT false,
  "created_at" timestamp NOT NULL DEFAULT (now()),
  "updated_at" timestamp NOT NULL DEFAULT (now()),
  "deleted_at" timestamp
);

CREATE TABLE "USER_AUTH_COUNT" (
  "id" uuid PRIMARY KEY NOT NULL,
  "user_id" uuid,
  "email" varchar(256) NOT NULL,
  "type_category_code" varchar(40) NOT NULL DEFAULT 'USER_AUTH_COUNT_TYPE',
  "type" varchar(40) NOT NULL,
  "count" integer NOT NULL DEFAULT 0,
  "created_at" timestamp NOT NULL DEFAULT (now()),
  "expired_at" timestamp
);

CREATE TABLE "VERIFICATION" (
  "id" uuid PRIMARY KEY NOT NULL,
  "user_id" uuid,
  "session_id" uuid,
  "type_category_code" varchar(40) NOT NULL DEFAULT 'VERIFICATION_TYPE',
  "type" varchar(40) NOT NULL,
  "email" varchar(256) NOT NULL,
  "code" varchar(50) NOT NULL,
  "is_verified" boolean NOT NULL DEFAULT false,
  "is_sent" boolean NOT NULL DEFAULT false,
  "created_at" timestamp NOT NULL DEFAULT (now()),
  "expired_at" timestamp
);

CREATE TABLE "USER_SESSION" (
  "id" uuid PRIMARY KEY NOT NULL,
  "user_id" uuid NOT NULL,
  "refresh_token" varchar(512) NOT NULL,
  "user_agent" varchar(255),
  "ip_address" varchar(45),
  "is_revoked" boolean NOT NULL DEFAULT false,
  "created_at" timestamp NOT NULL DEFAULT (now()),
  "expired_at" timestamp NOT NULL
);

CREATE TABLE "AUDIT_LOG" (
  "id" uuid PRIMARY KEY NOT NULL,
  "target_type" varchar(40) NOT NULL,
  "target_id" uuid,
  "action" varchar(40) NOT NULL,
  "before_data" jsonb,
  "after_data" jsonb,
  "actor_user_id" uuid,
  "ip_address" varchar(45),
  "created_at" timestamp NOT NULL DEFAULT (now())
);

CREATE TABLE "NOTIFICATION" (
  "id" uuid PRIMARY KEY NOT NULL,
  "user_id" uuid NOT NULL,
  "type_category_code" varchar(40) NOT NULL DEFAULT 'NOTIFICATION_TYPE',
  "type" varchar(40) NOT NULL,
  "message" text NOT NULL,
  "link" text,
  "is_read" boolean NOT NULL DEFAULT false,
  "created_at" timestamp NOT NULL DEFAULT (now()),
  "read_at" timestamp
);

CREATE TABLE "COMMENT" (
  "id" uuid PRIMARY KEY NOT NULL,
  "topic_id" uuid NOT NULL,
  "user_id" uuid NOT NULL,
  "upper_comment_id" uuid,
  "content" text NOT NULL,
  "is_deleted" boolean NOT NULL DEFAULT false,
  "created_at" timestamp NOT NULL DEFAULT (now()),
  "updated_at" timestamp NOT NULL DEFAULT (now()),
  "deleted_at" timestamp
);

CREATE TABLE "TAG" (
  "id" uuid PRIMARY KEY NOT NULL,
  "name" varchar(50) UNIQUE NOT NULL,
  "description" text,
  "created_at" timestamp NOT NULL DEFAULT (now())
);

CREATE TABLE "REL__TOPIC_TAG" (
  "id" uuid PRIMARY KEY NOT NULL,
  "topic_id" uuid NOT NULL,
  "tag_id" uuid NOT NULL,
  "created_at" timestamp NOT NULL DEFAULT (now())
);

CREATE UNIQUE INDEX ON "REL__TOPIC_TAG" ("topic_id", "tag_id");

COMMENT ON COLUMN "CODE_CATEGORY"."code" IS '공통코드 분류 식별자';

COMMENT ON COLUMN "CODE_CATEGORY"."is_sealed" IS '해당 분류 내 코드 수정/추가 가능 여부';

COMMENT ON COLUMN "CODE_CATEGORY"."name" IS '공통코드 분류 명';

COMMENT ON COLUMN "CODE_CATEGORY"."description" IS '분류 설명';

COMMENT ON COLUMN "CODE_CATEGORY"."note" IS '비고';

COMMENT ON COLUMN "CODE_CATEGORY"."created_at" IS '생성일시';

COMMENT ON COLUMN "CODE_CATEGORY"."updated_at" IS '수정일시';

COMMENT ON COLUMN "CODE_CATEGORY"."deleted_at" IS '삭제일시 (소프트 삭제)';

COMMENT ON COLUMN "CODE"."category_code" IS '공통코드 분류 코드';

COMMENT ON COLUMN "CODE"."code" IS '공통코드 값';

COMMENT ON COLUMN "CODE"."name" IS '공통코드 명';

COMMENT ON COLUMN "CODE"."value" IS '코드에 매핑되는 값';

COMMENT ON COLUMN "CODE"."description" IS '코드 설명';

COMMENT ON COLUMN "CODE"."note" IS '비고';

COMMENT ON COLUMN "CODE"."order" IS '정렬 순서';

COMMENT ON COLUMN "CODE"."upper_category_code" IS '상위 코드 분류 (upper_code와 함께 null이거나 함께 사용)';

COMMENT ON COLUMN "CODE"."upper_code" IS '상위 코드 값 (upper_category_code와 함께 null이거나 함께 사용)';

COMMENT ON COLUMN "CODE"."created_at" IS '생성일시';

COMMENT ON COLUMN "CODE"."updated_at" IS '수정일시';

COMMENT ON COLUMN "CODE"."deleted_at" IS '삭제일시';

COMMENT ON COLUMN "BOARD"."id" IS '게시판 고유 ID';

COMMENT ON COLUMN "BOARD"."menu_code" IS '연결된 메뉴 코드';

COMMENT ON COLUMN "BOARD"."type_category_code" IS '게시판 타입 분류 코드 (BOARD_TYPE)';

COMMENT ON COLUMN "BOARD"."type" IS '게시판 타입 코드 값';

COMMENT ON COLUMN "BOARD"."name" IS '게시판 명';

COMMENT ON COLUMN "BOARD"."description" IS '게시판 설명';

COMMENT ON COLUMN "BOARD"."note" IS '비고';

COMMENT ON COLUMN "BOARD"."is_public" IS '게시판 공개 여부';

COMMENT ON COLUMN "BOARD"."order" IS '게시판 정렬 순서';

COMMENT ON COLUMN "BOARD"."created_at" IS '생성일시';

COMMENT ON COLUMN "BOARD"."updated_at" IS '수정일시';

COMMENT ON COLUMN "BOARD"."deleted_at" IS '삭제일시';

COMMENT ON COLUMN "TOPIC"."id" IS '게시글 고유 ID';

COMMENT ON COLUMN "TOPIC"."author_user_id" IS '게시글 작성자 ID';

COMMENT ON COLUMN "TOPIC"."menu_code" IS '연결된 메뉴 코드';

COMMENT ON COLUMN "TOPIC"."status_category_code" IS '게시글 상태 분류 코드';

COMMENT ON COLUMN "TOPIC"."status" IS '게시글 상태 코드 값';

COMMENT ON COLUMN "TOPIC"."board_id" IS '소속 게시판 ID';

COMMENT ON COLUMN "TOPIC"."title" IS '게시글 제목';

COMMENT ON COLUMN "TOPIC"."content" IS '게시글 본문';

COMMENT ON COLUMN "TOPIC"."is_notice" IS '공지글 여부';

COMMENT ON COLUMN "TOPIC"."is_pinned" IS '상단 고정 여부';

COMMENT ON COLUMN "TOPIC"."is_public" IS '공개 여부';

COMMENT ON COLUMN "TOPIC"."view_count" IS '조회수';

COMMENT ON COLUMN "TOPIC"."published_at" IS '게시글 공개 예정 시각';

COMMENT ON COLUMN "TOPIC"."created_at" IS '작성일시';

COMMENT ON COLUMN "TOPIC"."updated_at" IS '수정일시';

COMMENT ON COLUMN "TOPIC"."deleted_at" IS '삭제일시';

COMMENT ON COLUMN "COMMON_FILE"."id" IS '파일 고유 ID';

COMMENT ON COLUMN "COMMON_FILE"."session_id" IS '임시 업로드 세션 ID';

COMMENT ON COLUMN "COMMON_FILE"."original_name" IS '원본 파일명';

COMMENT ON COLUMN "COMMON_FILE"."stored_name" IS '서버 저장 파일명';

COMMENT ON COLUMN "COMMON_FILE"."file_path" IS '파일 저장 경로';

COMMENT ON COLUMN "COMMON_FILE"."file_size" IS '파일 크기 (byte)';

COMMENT ON COLUMN "COMMON_FILE"."mime_type" IS '파일 MIME 타입';

COMMENT ON COLUMN "COMMON_FILE"."file_ext" IS '파일 확장자';

COMMENT ON COLUMN "COMMON_FILE"."created_at" IS '업로드 일시';

COMMENT ON COLUMN "REL__TOPIC_FILE"."id" IS '게시글-파일 연결 ID';

COMMENT ON COLUMN "REL__TOPIC_FILE"."topic_id" IS '게시글 ID';

COMMENT ON COLUMN "REL__TOPIC_FILE"."file_id" IS '파일 ID';

COMMENT ON COLUMN "REL__TOPIC_FILE"."order" IS '게시글 내 파일 정렬 순서';

COMMENT ON COLUMN "REL__TOPIC_FILE"."is_main" IS '대표 파일 여부';

COMMENT ON COLUMN "REL__TOPIC_FILE"."created_at" IS '연결 생성일시';

COMMENT ON COLUMN "REL__USER_FILE"."id" IS '사용자-파일 연결 ID';

COMMENT ON COLUMN "REL__USER_FILE"."user_id" IS '사용자 ID';

COMMENT ON COLUMN "REL__USER_FILE"."file_id" IS '파일 ID';

COMMENT ON COLUMN "REL__USER_FILE"."usage" IS '파일 사용 목적 (PROFILE, COVER 등)';

COMMENT ON COLUMN "REL__USER_FILE"."is_main" IS '대표 이미지 여부';

COMMENT ON COLUMN "REL__USER_FILE"."created_at" IS '연결 생성일시';

COMMENT ON COLUMN "MENU"."code" IS '메뉴 코드';

COMMENT ON COLUMN "MENU"."name" IS '메뉴 명';

COMMENT ON COLUMN "MENU"."description" IS '메뉴 설명';

COMMENT ON COLUMN "MENU"."is_active" IS '메뉴 활성 여부';

COMMENT ON COLUMN "MENU"."is_admin" IS '관리자 전용 메뉴 여부';

COMMENT ON COLUMN "MENU"."order" IS '메뉴 정렬 순서';

COMMENT ON COLUMN "MENU"."upper_code" IS '상위 메뉴 코드';

COMMENT ON COLUMN "MENU"."created_at" IS '생성일시';

COMMENT ON COLUMN "MENU"."updated_at" IS '수정일시';

COMMENT ON COLUMN "MENU"."deleted_at" IS '삭제일시';

COMMENT ON COLUMN "USER"."id" IS '사용자 고유 ID';

COMMENT ON COLUMN "USER"."role_category_code" IS '권한 분류 코드';

COMMENT ON COLUMN "USER"."role" IS '권한 코드 값';

COMMENT ON COLUMN "USER"."username" IS '로그인 아이디';

COMMENT ON COLUMN "USER"."password" IS '비밀번호 해시';

COMMENT ON COLUMN "USER"."salt" IS '비밀번호 해시 솔트';

COMMENT ON COLUMN "USER"."email" IS '이메일';

COMMENT ON COLUMN "USER"."name" IS '사용자 실명';

COMMENT ON COLUMN "USER"."nickname" IS '닉네임';

COMMENT ON COLUMN "USER"."is_active" IS '계정 활성 여부';

COMMENT ON COLUMN "USER"."is_locked" IS '계정 잠금 여부';

COMMENT ON COLUMN "USER"."created_at" IS '생성일시';

COMMENT ON COLUMN "USER"."updated_at" IS '수정일시';

COMMENT ON COLUMN "USER"."deleted_at" IS '삭제일시';

COMMENT ON COLUMN "USER_AUTH_COUNT"."id" IS '인증 시도 카운트 ID';

COMMENT ON COLUMN "USER_AUTH_COUNT"."user_id" IS '사용자 ID';

COMMENT ON COLUMN "USER_AUTH_COUNT"."email" IS '이메일 (비정규화)';

COMMENT ON COLUMN "USER_AUTH_COUNT"."type_category_code" IS '인증 시도 유형 분류 코드';

COMMENT ON COLUMN "USER_AUTH_COUNT"."type" IS '인증 시도 유형 코드';

COMMENT ON COLUMN "USER_AUTH_COUNT"."count" IS '시도 횟수';

COMMENT ON COLUMN "USER_AUTH_COUNT"."created_at" IS '생성일시';

COMMENT ON COLUMN "USER_AUTH_COUNT"."expired_at" IS '만료 일시';

COMMENT ON COLUMN "VERIFICATION"."id" IS '인증 정보 ID';

COMMENT ON COLUMN "VERIFICATION"."user_id" IS '사용자 ID';

COMMENT ON COLUMN "VERIFICATION"."session_id" IS '세션 ID';

COMMENT ON COLUMN "VERIFICATION"."type_category_code" IS '인증 유형 분류 코드';

COMMENT ON COLUMN "VERIFICATION"."type" IS '인증 유형 코드';

COMMENT ON COLUMN "VERIFICATION"."email" IS '인증 대상 이메일';

COMMENT ON COLUMN "VERIFICATION"."code" IS '인증 코드';

COMMENT ON COLUMN "VERIFICATION"."is_verified" IS '인증 완료 여부';

COMMENT ON COLUMN "VERIFICATION"."is_sent" IS '인증 메일 발송 여부';

COMMENT ON COLUMN "VERIFICATION"."created_at" IS '생성일시';

COMMENT ON COLUMN "VERIFICATION"."expired_at" IS '만료 일시';

COMMENT ON COLUMN "USER_SESSION"."id" IS '세션 ID';

COMMENT ON COLUMN "USER_SESSION"."user_id" IS '사용자 ID';

COMMENT ON COLUMN "USER_SESSION"."refresh_token" IS '리프레시 토큰';

COMMENT ON COLUMN "USER_SESSION"."user_agent" IS '브라우저/디바이스 정보';

COMMENT ON COLUMN "USER_SESSION"."ip_address" IS '접속 IP (IPv4/IPv6)';

COMMENT ON COLUMN "USER_SESSION"."is_revoked" IS '강제 만료 여부';

COMMENT ON COLUMN "USER_SESSION"."created_at" IS '생성일';

COMMENT ON COLUMN "USER_SESSION"."expired_at" IS '만료일';

COMMENT ON COLUMN "AUDIT_LOG"."id" IS '감사 로그 ID';

COMMENT ON COLUMN "AUDIT_LOG"."target_type" IS '대상 타입 (USER, TOPIC, CODE 등)';

COMMENT ON COLUMN "AUDIT_LOG"."target_id" IS '대상 ID (nullable 허용)';

COMMENT ON COLUMN "AUDIT_LOG"."action" IS '행위 유형 (CREATE, UPDATE, DELETE)';

COMMENT ON COLUMN "AUDIT_LOG"."before_data" IS '변경 전 데이터';

COMMENT ON COLUMN "AUDIT_LOG"."after_data" IS '변경 후 데이터';

COMMENT ON COLUMN "AUDIT_LOG"."actor_user_id" IS '행위자 사용자 ID';

COMMENT ON COLUMN "AUDIT_LOG"."ip_address" IS '요청 IP';

COMMENT ON COLUMN "AUDIT_LOG"."created_at" IS '행위 시점';

COMMENT ON COLUMN "NOTIFICATION"."id" IS '알림 ID';

COMMENT ON COLUMN "NOTIFICATION"."user_id" IS '수신 사용자 ID';

COMMENT ON COLUMN "NOTIFICATION"."type_category_code" IS '알림 타입 분류';

COMMENT ON COLUMN "NOTIFICATION"."type" IS '알림 타입 코드 (COMMENT, REPLY, SYSTEM 등)';

COMMENT ON COLUMN "NOTIFICATION"."message" IS '알림 메시지';

COMMENT ON COLUMN "NOTIFICATION"."link" IS '이동 링크';

COMMENT ON COLUMN "NOTIFICATION"."is_read" IS '읽음 여부';

COMMENT ON COLUMN "NOTIFICATION"."created_at" IS '생성일';

COMMENT ON COLUMN "NOTIFICATION"."read_at" IS '읽은 시점';

COMMENT ON COLUMN "COMMENT"."id" IS '댓글 ID';

COMMENT ON COLUMN "COMMENT"."topic_id" IS '게시글 ID';

COMMENT ON COLUMN "COMMENT"."user_id" IS '작성자 사용자 ID';

COMMENT ON COLUMN "COMMENT"."upper_comment_id" IS '상위 댓글 ID';

COMMENT ON COLUMN "COMMENT"."content" IS '댓글 내용';

COMMENT ON COLUMN "COMMENT"."is_deleted" IS '삭제 여부';

COMMENT ON COLUMN "COMMENT"."created_at" IS '작성일시';

COMMENT ON COLUMN "COMMENT"."updated_at" IS '수정일시';

COMMENT ON COLUMN "COMMENT"."deleted_at" IS '삭제일시';

COMMENT ON COLUMN "TAG"."id" IS '태그 ID';

COMMENT ON COLUMN "TAG"."name" IS '태그 명';

COMMENT ON COLUMN "TAG"."description" IS '태그 설명';

COMMENT ON COLUMN "TAG"."created_at" IS '생성일시';

COMMENT ON COLUMN "REL__TOPIC_TAG"."id" IS '게시글-태그 연결 ID';

COMMENT ON COLUMN "REL__TOPIC_TAG"."topic_id" IS '게시글 ID';

COMMENT ON COLUMN "REL__TOPIC_TAG"."tag_id" IS '태그 ID';

COMMENT ON COLUMN "REL__TOPIC_TAG"."created_at" IS '연결 생성일시';

ALTER TABLE "CODE" ADD FOREIGN KEY ("category_code") REFERENCES "CODE_CATEGORY" ("code");

ALTER TABLE "CODE" ADD FOREIGN KEY ("upper_category_code") REFERENCES "CODE_CATEGORY" ("code");

ALTER TABLE "CODE" ADD FOREIGN KEY ("upper_category_code", "upper_code") REFERENCES "CODE" ("category_code", "code");

ALTER TABLE "BOARD" ADD FOREIGN KEY ("menu_code") REFERENCES "MENU" ("code");

ALTER TABLE "BOARD" ADD FOREIGN KEY ("type_category_code") REFERENCES "CODE_CATEGORY" ("code");

ALTER TABLE "BOARD" ADD FOREIGN KEY ("type_category_code", "type") REFERENCES "CODE" ("category_code", "code");

ALTER TABLE "TOPIC" ADD FOREIGN KEY ("author_user_id") REFERENCES "USER" ("id");

ALTER TABLE "TOPIC" ADD FOREIGN KEY ("board_id") REFERENCES "BOARD" ("id");

ALTER TABLE "TOPIC" ADD FOREIGN KEY ("menu_code") REFERENCES "MENU" ("code");

ALTER TABLE "TOPIC" ADD FOREIGN KEY ("status_category_code") REFERENCES "CODE_CATEGORY" ("code");

ALTER TABLE "TOPIC" ADD FOREIGN KEY ("status_category_code", "status") REFERENCES "CODE" ("category_code", "code");

ALTER TABLE "COMMENT" ADD FOREIGN KEY ("topic_id") REFERENCES "TOPIC" ("id");

ALTER TABLE "COMMENT" ADD FOREIGN KEY ("user_id") REFERENCES "USER" ("id");

ALTER TABLE "COMMENT" ADD FOREIGN KEY ("upper_comment_id") REFERENCES "COMMENT" ("id");

ALTER TABLE "REL__TOPIC_FILE" ADD FOREIGN KEY ("topic_id") REFERENCES "TOPIC" ("id");

ALTER TABLE "REL__TOPIC_FILE" ADD FOREIGN KEY ("file_id") REFERENCES "COMMON_FILE" ("id");

ALTER TABLE "REL__USER_FILE" ADD FOREIGN KEY ("user_id") REFERENCES "USER" ("id");

ALTER TABLE "REL__USER_FILE" ADD FOREIGN KEY ("file_id") REFERENCES "COMMON_FILE" ("id");

ALTER TABLE "REL__TOPIC_TAG" ADD FOREIGN KEY ("topic_id") REFERENCES "TOPIC" ("id");

ALTER TABLE "REL__TOPIC_TAG" ADD FOREIGN KEY ("tag_id") REFERENCES "TAG" ("id");

ALTER TABLE "MENU" ADD FOREIGN KEY ("upper_code") REFERENCES "MENU" ("code");

ALTER TABLE "USER" ADD FOREIGN KEY ("role_category_code") REFERENCES "CODE_CATEGORY" ("code");

ALTER TABLE "USER" ADD FOREIGN KEY ("role_category_code", "role") REFERENCES "CODE" ("category_code", "code");

ALTER TABLE "USER_AUTH_COUNT" ADD FOREIGN KEY ("user_id") REFERENCES "USER" ("id");

ALTER TABLE "USER_AUTH_COUNT" ADD FOREIGN KEY ("type_category_code") REFERENCES "CODE_CATEGORY" ("code");

ALTER TABLE "USER_AUTH_COUNT" ADD FOREIGN KEY ("type_category_code", "type") REFERENCES "CODE" ("category_code", "code");

ALTER TABLE "VERIFICATION" ADD FOREIGN KEY ("user_id") REFERENCES "USER" ("id");

ALTER TABLE "VERIFICATION" ADD FOREIGN KEY ("type_category_code") REFERENCES "CODE_CATEGORY" ("code");

ALTER TABLE "VERIFICATION" ADD FOREIGN KEY ("type_category_code", "type") REFERENCES "CODE" ("category_code", "code");

ALTER TABLE "USER_SESSION" ADD FOREIGN KEY ("user_id") REFERENCES "USER" ("id");

ALTER TABLE "AUDIT_LOG" ADD FOREIGN KEY ("actor_user_id") REFERENCES "USER" ("id");

ALTER TABLE "NOTIFICATION" ADD FOREIGN KEY ("user_id") REFERENCES "USER" ("id");

ALTER TABLE "NOTIFICATION" ADD FOREIGN KEY ("type_category_code") REFERENCES "CODE_CATEGORY" ("code");

ALTER TABLE "NOTIFICATION" ADD FOREIGN KEY ("type_category_code", "type") REFERENCES "CODE" ("category_code", "code");
