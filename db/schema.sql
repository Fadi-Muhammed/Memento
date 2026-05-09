-- Memento v1 — Postgres schema
-- Run in Supabase SQL editor in one shot.
-- gen_random_uuid() is built-in from Postgres 13+; no extension needed.

-- ─────────────────────────────────────────────
-- TABLES (in FK dependency order)
-- ─────────────────────────────────────────────

CREATE TABLE shops (
  id                        UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name                      TEXT        NOT NULL,
  owner_phone               TEXT        NOT NULL,
  whatsapp_business_number  TEXT        NOT NULL,
  bot_enabled               BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE customers (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id             UUID        NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  phone               TEXT        NOT NULL,
  name                TEXT,
  email               TEXT,
  measurements        JSONB       NOT NULL DEFAULT '{}',
  fabric_preferences  TEXT,
  notes               TEXT,
  first_contact_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_contact_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  lifetime_value      NUMERIC     NOT NULL DEFAULT 0,
  UNIQUE (shop_id, phone)
);

CREATE TABLE leads (
  id                    UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id               UUID        NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  customer_id           UUID        NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  source                TEXT        NOT NULL DEFAULT 'meta_ad',
  garment_type          TEXT,
  fabric_pref           TEXT,
  deadline              TEXT,
  is_returning          BOOLEAN,
  status                TEXT        NOT NULL DEFAULT 'new',
  raw_qualification     JSONB       NOT NULL DEFAULT '{}',
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  qualified_at          TIMESTAMPTZ,
  followup_stage        TEXT        NOT NULL DEFAULT 'none',
  last_followup_sent_at TIMESTAMPTZ,
  followup_paused       BOOLEAN     NOT NULL DEFAULT FALSE
);

CREATE TABLE followup_events (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id        UUID        NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  stage          TEXT        NOT NULL,
  channel        TEXT        NOT NULL,
  template_name  TEXT,
  sent_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status         TEXT        NOT NULL,
  error          TEXT
);

CREATE TABLE orders (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id       UUID        NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  customer_id   UUID        NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  lead_id       UUID        REFERENCES leads(id) ON DELETE SET NULL,
  garment_type  TEXT        NOT NULL,
  fabric_details TEXT,
  agreed_price  NUMERIC,
  deposit_paid  NUMERIC     NOT NULL DEFAULT 0,
  stage         TEXT        NOT NULL DEFAULT 'confirmed',
  promised_date DATE,
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at  TIMESTAMPTZ
);

CREATE TABLE messages (
  id                   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id              UUID        NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  customer_id          UUID        NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  direction            TEXT        NOT NULL,
  body                 TEXT        NOT NULL,
  sender               TEXT        NOT NULL,
  whatsapp_message_id  TEXT        UNIQUE,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE stage_events (
  id                 UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id           UUID        NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  from_stage         TEXT,
  to_stage           TEXT        NOT NULL,
  customer_notified  BOOLEAN     NOT NULL DEFAULT FALSE,
  changed_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- All tables: RLS enabled, zero policies.
-- All data access is server-side via service role key (bypasses RLS).
-- The anon key is used only for Supabase Auth — never for data queries.
-- ─────────────────────────────────────────────

ALTER TABLE shops          ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers      ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads          ENABLE ROW LEVEL SECURITY;
ALTER TABLE followup_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders         ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages       ENABLE ROW LEVEL SECURITY;
ALTER TABLE stage_events   ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────
-- INDEXES
-- ─────────────────────────────────────────────

CREATE INDEX idx_customers_shop_phone        ON customers (shop_id, phone);
CREATE INDEX idx_messages_customer_created   ON messages  (customer_id, created_at DESC);
CREATE INDEX idx_orders_shop_stage           ON orders    (shop_id, stage);
CREATE INDEX idx_leads_shop_status           ON leads     (shop_id, status);
CREATE INDEX idx_leads_followup_qualified    ON leads     (followup_stage, qualified_at);
