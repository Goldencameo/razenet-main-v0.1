-- Fix permissions for conversation table

-- Enable RLS if not already enabled
ALTER TABLE conversation ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow all authenticated users" ON conversation;
DROP POLICY IF EXISTS "Allow insert for authenticated" ON conversation;
DROP POLICY IF EXISTS "Allow select for authenticated" ON conversation;
DROP POLICY IF EXISTS "Allow update for authenticated" ON conversation;
DROP POLICY IF EXISTS "Allow delete for authenticated" ON conversation;

-- Create policies for authenticated users
CREATE POLICY "Allow insert for authenticated" ON conversation
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow select for authenticated" ON conversation
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow update for authenticated" ON conversation
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow delete for authenticated" ON conversation
  FOR DELETE USING (auth.role() = 'authenticated');

-- Grant permissions
GRANT ALL ON conversation TO authenticated;
GRANT SELECT ON conversation TO anon;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_conversation_created_at ON conversation(created_at);
CREATE INDEX IF NOT EXISTS idx_conversation_updated_at ON conversation(updated_at);

SELECT 'Conversation table permissions fixed' as status;
