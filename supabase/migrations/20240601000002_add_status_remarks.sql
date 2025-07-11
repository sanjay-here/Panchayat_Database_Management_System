ALTER TABLE citizens ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'alive';
ALTER TABLE citizens ADD COLUMN IF NOT EXISTS remarks TEXT;

alter publication supabase_realtime add table citizens;