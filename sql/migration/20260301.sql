INSERT INTO code_category (code, name, description, created_at, updated_at)
VALUES ('landing_section_type', 'Landing Section Type', 'Types of landing page sections (hero/image/board_top/image_link)', now(), now())
ON CONFLICT (code) DO NOTHING;

INSERT INTO code (category_code, code, name, "order", created_at, updated_at)
VALUES
    ('landing_section_type', 'hero',       'Hero Slider Section',   1, now(), now()),
    ('landing_section_type', 'image',      'Description Image',     2, now(), now()),
    ('landing_section_type', 'board_top',  'Board Top Items',       3, now(), now()),
    ('landing_section_type', 'image_link', 'Image + Link Section',  4, now(), now())
ON CONFLICT (category_code, code) DO NOTHING;

INSERT INTO code_category (code, name, description, created_at, updated_at)
VALUES ('landing_cta_type', 'CTA Button Type', 'CTA display formats (text/button/image)', now(), now())
ON CONFLICT (code) DO NOTHING;

INSERT INTO code (category_code, code, name, "order", created_at, updated_at)
VALUES
    ('landing_cta_type', 'text',   'Text Type',   1, now(), now()),
    ('landing_cta_type', 'button', 'Button Type', 2, now(), now()),
    ('landing_cta_type', 'image',  'Image Type',  3, now(), now())
ON CONFLICT (category_code, code) DO NOTHING;

CREATE TABLE landing_section (
    id                   UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    type_category_code   VARCHAR(40)   NOT NULL DEFAULT 'landing_section_type',
    type                 VARCHAR(40)   NOT NULL,
    title                VARCHAR(255),
    description          TEXT,
    board_id             UUID          REFERENCES board(id) ON DELETE SET NULL,
    is_active            BOOLEAN       NOT NULL DEFAULT true,
    "order"              INT           NOT NULL DEFAULT 0,
    extra_config         JSONB         NOT NULL DEFAULT '{}',
    created_at           TIMESTAMP     NOT NULL DEFAULT now(),
    updated_at           TIMESTAMP     NOT NULL DEFAULT now(),
    deleted_at           TIMESTAMP
);

COMMENT ON COLUMN landing_section.type IS 'Section kinds: hero / image / board_top / image_link (Refs landing_section_type code)';
COMMENT ON COLUMN landing_section.board_id IS 'Board ID to link if section type is board_top';
COMMENT ON COLUMN landing_section.is_active IS 'Visibility flag (false hides on External view)';
COMMENT ON COLUMN landing_section.extra_config IS 'JSONB: Added flexible options like slider ms delay or board limit caps';

CREATE TABLE landing_cta (
    id                   UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    section_id           UUID          NOT NULL REFERENCES landing_section(id) ON DELETE CASCADE,
    type_category_code   VARCHAR(40)   NOT NULL DEFAULT 'landing_cta_type',
    type                 VARCHAR(40)   NOT NULL DEFAULT 'button',
    label                VARCHAR(255),
    href                 VARCHAR(1000) NOT NULL,
    class_name           TEXT,
    position_top         DECIMAL(6,2),
    position_left        DECIMAL(6,2),
    position_bottom      DECIMAL(6,2),
    position_right       DECIMAL(6,2),
    position_transform   VARCHAR(255),
    image_file_id        UUID          REFERENCES common_file(id) ON DELETE SET NULL,
    "order"              INT           NOT NULL DEFAULT 0,
    is_active            BOOLEAN       NOT NULL DEFAULT true,
    created_at           TIMESTAMP     NOT NULL DEFAULT now(),
    updated_at           TIMESTAMP     NOT NULL DEFAULT now(),
    deleted_at           TIMESTAMP
);

COMMENT ON COLUMN landing_cta.label IS 'CTA display text. Store direct text or i18n keys';
COMMENT ON COLUMN landing_cta.class_name IS 'Tailwind CSS class string (e.g. bg-blue-600 text-white rounded-xl px-8 py-4)';
COMMENT ON COLUMN landing_cta.position_top IS 'Absolute top position (%) value. Unused if null';
COMMENT ON COLUMN landing_cta.position_left IS 'Absolute left position (%) value. Unused if null';
COMMENT ON COLUMN landing_cta.image_file_id IS 'common_file target ID when type is image';

CREATE TABLE rel__landing_section_file (
    id          UUID      PRIMARY KEY DEFAULT gen_random_uuid(),
    section_id  UUID      NOT NULL REFERENCES landing_section(id) ON DELETE CASCADE,
    file_id     UUID      NOT NULL REFERENCES common_file(id) ON DELETE CASCADE,
    "order"     INT       NOT NULL DEFAULT 0,
    is_main     BOOLEAN   NOT NULL DEFAULT false,
    created_at  TIMESTAMP NOT NULL DEFAULT now()
);

COMMENT ON TABLE rel__landing_section_file IS 'N:M relationship schema between landing sections and files(images/slides)';
COMMENT ON COLUMN rel__landing_section_file.order IS 'Sequential order parameter useful for sliders/image strips';

CREATE INDEX IF NOT EXISTS idx_landing_section_order     ON landing_section ("order")   WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_landing_cta_section_id    ON landing_cta (section_id)    WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_landing_cta_order         ON landing_cta ("order")       WHERE deleted_at IS NULL;

INSERT INTO menu (id, channel, upper_id, code, name, path, "order", is_active, created_at, updated_at)
VALUES (gen_random_uuid(), 'INTERNAL', NULL, 'landing-manage', '랜딩 관리', '/landing', 99, true, now(), now())
ON CONFLICT (code) WHERE deleted_at IS NULL DO NOTHING;
