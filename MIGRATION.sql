-- SQL Migration for Supabase
-- Run this in the Supabase SQL Editor

CREATE TABLE IF NOT EXISTS inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  unit TEXT,
  length TEXT,
  width TEXT,
  height TEXT,
  weight TEXT,
  ean TEXT,
  dun TEXT,
  nfe TEXT,
  quantity TEXT,
  total_value TEXT,
  order_number TEXT,
  requester TEXT,
  supplier TEXT,
  seal TEXT,
  created_at BIGINT NOT NULL DEFAULT (extract(epoch from now()) * 1000)
);

-- If table already exists, run these:
-- ALTER TABLE inventory_items RENAME COLUMN name TO description;
-- ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS unit TEXT;
-- ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS length TEXT;
-- ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS width TEXT;
-- ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS height TEXT;
-- ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS weight TEXT;
-- ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS ean TEXT;
-- ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS dun TEXT;
-- ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS nfe TEXT;
-- ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS quantity TEXT;
-- ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS total_value TEXT;
-- ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS order_number TEXT;
-- ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS requester TEXT;
-- ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS supplier TEXT;
-- ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS seal TEXT;

-- Enable Row Level Security (RLS)
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow all access (for development)
-- In production, you should restrict this to authenticated users.
CREATE POLICY "Allow all access" ON inventory_items FOR ALL USING (true);
