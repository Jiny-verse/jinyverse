CREATE TABLE notification_template (
    id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(255) NOT NULL,
    channel         VARCHAR(40)  NOT NULL DEFAULT 'both',
    email_subject   VARCHAR(255),
    body            TEXT         NOT NULL,
    variables       JSONB        NOT NULL DEFAULT '[]',
    description     TEXT,
    created_at      TIMESTAMP    NOT NULL DEFAULT now(),
    updated_at      TIMESTAMP    NOT NULL DEFAULT now(),
    deleted_at      TIMESTAMP
);

-- notification_channel 공통 코드
INSERT INTO code_category (code, name, description, created_at, updated_at)
VALUES ('notification_channel', '알림 채널', '알림 발송 채널 (system/email/both)', now(), now())
ON CONFLICT (code) DO NOTHING;

INSERT INTO code (category_code, code, name, "order", created_at, updated_at)
VALUES
    ('notification_channel', 'system', 'System Only',    1, now(), now()),
    ('notification_channel', 'email',  'Email Only',     2, now(), now()),
    ('notification_channel', 'both',   'System + Email', 3, now(), now())
ON CONFLICT (category_code, code) DO NOTHING;

ALTER TABLE notification
    ADD COLUMN IF NOT EXISTS send_email    BOOLEAN   NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS email_sent    BOOLEAN   NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS email_sent_at TIMESTAMP,
    ADD COLUMN IF NOT EXISTS template_id   UUID      REFERENCES notification_template(id) ON DELETE SET NULL;

-- notification_type 공통 코드
INSERT INTO code_category (code, name, description, created_at, updated_at)
VALUES ('notification_type', '알림 타입', '알림 타입 분류', now(), now())
ON CONFLICT (code) DO NOTHING;

INSERT INTO code (category_code, code, name, "order", created_at, updated_at)
VALUES
    ('notification_type', 'comment',         '댓글',       1, now(), now()),
    ('notification_type', 'reply',           '답글',       2, now(), now()),
    ('notification_type', 'system',          '시스템 알림', 3, now(), now()),
    ('notification_type', 'inquiry_replied', '문의 답변',  4, now(), now())
ON CONFLICT (category_code, code) DO NOTHING;

CREATE TABLE notification_setting (
    id             UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id        UUID         NOT NULL UNIQUE REFERENCES "user"(id) ON DELETE CASCADE,
    system_enabled BOOLEAN      NOT NULL DEFAULT true,
    email_enabled  BOOLEAN      NOT NULL DEFAULT false,
    email_override VARCHAR(255),
    type_settings  JSONB        NOT NULL DEFAULT '{}',
    created_at     TIMESTAMP    NOT NULL DEFAULT now(),
    updated_at     TIMESTAMP    NOT NULL DEFAULT now()
);

CREATE TABLE inquiry (
    id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_no     VARCHAR(30)  NOT NULL UNIQUE,
    user_id       UUID         REFERENCES "user"(id) ON DELETE SET NULL,
    guest_email   VARCHAR(255),
    category_code VARCHAR(40)  NOT NULL,
    title         VARCHAR(255) NOT NULL,
    status_code   VARCHAR(40)  NOT NULL DEFAULT 'pending',
    priority_code VARCHAR(40)  NOT NULL DEFAULT 'medium',
    assignee_id   UUID         REFERENCES "user"(id) ON DELETE SET NULL,
    created_at    TIMESTAMP    NOT NULL DEFAULT now(),
    updated_at    TIMESTAMP    NOT NULL DEFAULT now(),
    deleted_at    TIMESTAMP
);

CREATE SEQUENCE IF NOT EXISTS inquiry_ticket_seq START 1;

CREATE TABLE inquiry_thread (
    id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    inquiry_id      UUID         NOT NULL REFERENCES inquiry(id) ON DELETE CASCADE,
    author_id       UUID         REFERENCES "user"(id) ON DELETE SET NULL,
    author_email    VARCHAR(255),
    type_code       VARCHAR(40)  NOT NULL,
    content         TEXT         NOT NULL,
    sent_from_email VARCHAR(255),
    sent_to_email   VARCHAR(255),
    email_sent      BOOLEAN      NOT NULL DEFAULT false,
    email_sent_at   TIMESTAMP,
    created_at      TIMESTAMP    NOT NULL DEFAULT now(),
    updated_at      TIMESTAMP    NOT NULL DEFAULT now(),
    deleted_at      TIMESTAMP
);

INSERT INTO code_category (code, name, description, created_at, updated_at)
VALUES
    ('inquiry_category',    '문의 카테고리',  '문의 유형 분류',        now(), now()),
    ('inquiry_status',      '문의 상태',      '문의 처리 상태',        now(), now()),
    ('inquiry_priority',    '문의 우선순위',  '문의 처리 우선순위',    now(), now()),
    ('inquiry_thread_type', '스레드 타입',    '문의 스레드 항목 유형', now(), now())
ON CONFLICT (code) DO NOTHING;

INSERT INTO code (category_code, code, name, "order", created_at, updated_at)
VALUES
    ('inquiry_category', 'general',     '일반 문의',   1, now(), now()),
    ('inquiry_category', 'bug',         '버그 제보',   2, now(), now()),
    ('inquiry_category', 'billing',     '결제/청구',   3, now(), now()),
    ('inquiry_category', 'partnership', '제휴/협력',   4, now(), now()),
    ('inquiry_category', 'other',       '기타',        5, now(), now()),
    ('inquiry_status', 'pending',     '접수 대기',   1, now(), now()),
    ('inquiry_status', 'in_progress', '처리 중',     2, now(), now()),
    ('inquiry_status', 'answered',    '답변 완료',   3, now(), now()),
    ('inquiry_status', 'closed',      '종료',        4, now(), now()),
    ('inquiry_priority', 'low',    '낮음',  1, now(), now()),
    ('inquiry_priority', 'medium', '보통',  2, now(), now()),
    ('inquiry_priority', 'high',   '높음',  3, now(), now()),
    ('inquiry_priority', 'urgent', '긴급',  4, now(), now()),
    ('inquiry_thread_type', 'customer_message', '고객 메시지', 1, now(), now()),
    ('inquiry_thread_type', 'staff_reply',      '직원 답변',   2, now(), now()),
    ('inquiry_thread_type', 'internal_note',    '내부 메모',   3, now(), now()),
    ('inquiry_thread_type', 'status_change',    '상태 변경',   4, now(), now())
ON CONFLICT (category_code, code) DO NOTHING;
