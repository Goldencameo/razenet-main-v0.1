-- Fix permissions for friendships table

-- Enable RLS if not already enabled
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow all authenticated users" ON friendships;
DROP POLICY IF EXISTS "Allow insert for authenticated" ON friendships;
DROP POLICY IF EXISTS "Allow select for authenticated" ON friendships;
DROP POLICY IF EXISTS "Allow update for authenticated" ON friendships;
DROP POLICY IF EXISTS "Allow delete for authenticated" ON friendships;

-- Create policies for authenticated users
CREATE POLICY "Allow insert for authenticated" ON friendships
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow select for authenticated" ON friendships
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow update for authenticated" ON friendships
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow delete for authenticated" ON friendships
  FOR DELETE USING (auth.role() = 'authenticated');

-- Grant permissions
GRANT ALL ON friendships TO authenticated;
GRANT SELECT ON friendships TO anon;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_friendships_requester_id ON friendships(requester_id);
CREATE INDEX IF NOT EXISTS idx_friendships_addressee_id ON friendships(addressee_id);
CREATE INDEX IF NOT EXISTS idx_friendships_status ON friendships(status);

SELECT 'Friendships table permissions fixed' as status;
