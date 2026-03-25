-- Create table for storing flat PINs
CREATE TABLE IF NOT EXISTS flat_pins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  flat_no TEXT NOT NULL UNIQUE,
  pin_hash TEXT NOT NULL,
  failed_attempts INT DEFAULT 0,
  locked_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookup by flat number
CREATE INDEX IF NOT EXISTS idx_flat_pins_flat_no ON flat_pins(flat_no);

-- Enable Row Level Security (RLS)
ALTER TABLE flat_pins ENABLE ROW LEVEL SECURITY;

-- Policy: Allow service role (Edge Functions) full access
CREATE POLICY "Service role can perform all on flat_pins"
ON flat_pins
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Manual Insert for 4E8 (PIN: 1234)
INSERT INTO flat_pins (flat_no, pin_hash) 
VALUES ('4E8', '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4')
ON CONFLICT (flat_no) DO UPDATE SET pin_hash = EXCLUDED.pin_hash;
