-- Migration: add_onboarding_schema.sql
CREATE TABLE IF NOT EXISTS user_skills (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  skill text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS onboarding_status text DEFAULT 'not_started',
  ADD COLUMN IF NOT EXISTS role text,
  ADD COLUMN IF NOT EXISTS profile jsonb;
