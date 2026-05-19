-- ============================================================
-- ZumboX FYB Week Pre-Order System — Supabase Schema
-- Run this in the Supabase SQL Editor to create the tables.
-- ============================================================

-- ── orders ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.orders (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id              TEXT NOT NULL UNIQUE,              -- format: ZBX-XXXXXX
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  student_name          TEXT NOT NULL,
  email                 TEXT NOT NULL,
  phone                 TEXT NOT NULL,
  student_id            TEXT,                             -- matric number (nullable)
  gender                TEXT NOT NULL CHECK (gender IN ('Male', 'Female')),
  selected_design       TEXT NOT NULL,
  measurements          JSONB,                            -- null when in_person_measurement = true
  in_person_measurement BOOLEAN NOT NULL DEFAULT FALSE,
  payment_status        TEXT NOT NULL DEFAULT 'pending'
                          CHECK (payment_status IN ('pending', 'paid', 'completed')),
  paystack_reference    TEXT NOT NULL,
  deposit_amount        INTEGER NOT NULL DEFAULT 15000,   -- in NGN
  balance_amount        INTEGER NOT NULL DEFAULT 10000    -- in NGN
);

-- Index for admin dashboard queries
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON public.orders (payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_email ON public.orders (email);

-- Enable Row Level Security
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Allow the service role (server-side) to do everything
CREATE POLICY "service_role_all" ON public.orders
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ── config ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.config (
  id                  INTEGER PRIMARY KEY,                -- always row id = 1
  announcement_text   TEXT NOT NULL DEFAULT 'FYB Week 2026 Pre-Orders are now open! Secure your uniform today.',
  pre_orders_open     BOOLEAN NOT NULL DEFAULT TRUE,
  pickup_date         TEXT NOT NULL DEFAULT 'July 26, 2026',
  deposit_amount      INTEGER NOT NULL DEFAULT 15000,
  balance_amount      INTEGER NOT NULL DEFAULT 10000,
  whatsapp_number     TEXT NOT NULL DEFAULT ''
);

-- Seed with default config row
INSERT INTO public.config (id, announcement_text, pre_orders_open, pickup_date, deposit_amount, balance_amount, whatsapp_number)
VALUES (
  1,
  'FYB Week 2026 Pre-Orders are now open! Secure your uniform today.',
  TRUE,
  'July 26, 2026',
  15000,
  10000,
  ''
)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS
ALTER TABLE public.config ENABLE ROW LEVEL SECURITY;

-- Public read (used by gallery and order pages via anon key)
CREATE POLICY "public_read_config" ON public.config
  FOR SELECT
  TO anon
  USING (true);

-- Service role can write
CREATE POLICY "service_role_write_config" ON public.config
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
