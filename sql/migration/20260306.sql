CREATE TABLE audit_log (
    id            UUID        PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
    target_type   VARCHAR(40) NOT NULL,
    target_id     UUID,
    action        VARCHAR(40) NOT NULL,
    before_data   JSONB,
    after_data    JSONB,
    actor_user_id UUID REFERENCES "user"(id),
    ip_address    VARCHAR(45),
    metadata      JSONB,
    created_at    TIMESTAMP   NOT NULL DEFAULT now(),
    updated_at    TIMESTAMP   NOT NULL DEFAULT now(),
    deleted_at    TIMESTAMP
);
