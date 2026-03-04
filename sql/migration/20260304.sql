ALTER TABLE landing_section DROP COLUMN IF EXISTS title;
ALTER TABLE landing_section DROP COLUMN IF EXISTS description;

ALTER TABLE landing_cta ADD COLUMN IF NOT EXISTS style_config JSONB;