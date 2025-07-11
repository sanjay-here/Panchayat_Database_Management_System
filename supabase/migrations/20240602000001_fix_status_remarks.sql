-- Add status and remarks columns if they don't exist
ALTER TABLE citizens ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'alive';
ALTER TABLE citizens ADD COLUMN IF NOT EXISTS remarks TEXT;
