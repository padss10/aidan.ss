-- SQL Migration for Supabase
-- Run this in the Supabase SQL Editor

CREATE TABLE IF NOT EXISTS inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  created_at BIGINT NOT NULL DEFAULT (extract(epoch from now()) * 1000)
);

-- Enable Row Level Security (RLS)
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow all access (for development)
-- In production, you should restrict this to authenticated users.
CREATE POLICY "Allow all access" ON inventory_items FOR ALL USING (true);
