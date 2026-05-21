-- Fix permissions for conversations table (plural)

-- Enable RLS if not already enabled
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow all authenticated users" ON conversations;
DROP POLICY IF EXISTS "Allow insert for authenticated" ON conversations;
DROP POLICY IF EXISTS "Allow select for authenticated" ON conversations;
DROP POLICY IF EXISTS "Allow update for authenticated" ON conversations;
DROP POLICY IF EXISTS "Allow delete for authenticated" ON conversations;

-- Create policies for authenticated users
CREATE POLICY "Allow insert for authenticated" ON conversations
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow select for authenticated" ON conversations
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow update for authenticated" ON conversations
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow delete for authenticated" ON conversations
  FOR DELETE USING (auth.role() = 'authenticated');

-- Grant permissions
GRANT ALL ON conversations TO authenticated;
GRANT SELECT ON conversations TO anon;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON conversations(created_at);
CREATE INDEX IF NOT EXISTS idx_conversations_updated_at ON conversations(updated_at);

SELECT 'Conversations table permissions fixed' as status;
