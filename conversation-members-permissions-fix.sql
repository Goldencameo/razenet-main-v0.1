-- Fix permissions for conversation_members table

-- Enable RLS if not already enabled
ALTER TABLE conversation_members ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow all authenticated users" ON conversation_members;
DROP POLICY IF EXISTS "Allow insert for authenticated" ON conversation_members;
DROP POLICY IF EXISTS "Allow select for authenticated" ON conversation_members;
DROP POLICY IF EXISTS "Allow update for authenticated" ON conversation_members;
DROP POLICY IF EXISTS "Allow delete for authenticated" ON conversation_members;

-- Create policies for authenticated users
CREATE POLICY "Allow insert for authenticated" ON conversation_members
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow select for authenticated" ON conversation_members
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow update for authenticated" ON conversation_members
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow delete for authenticated" ON conversation_members
  FOR DELETE USING (auth.role() = 'authenticated');

-- Grant permissions
GRANT ALL ON conversation_members TO authenticated;
GRANT SELECT ON conversation_members TO anon;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_conversation_members_conversation_id ON conversation_members(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversation_members_user_id ON conversation_members(user_id);

SELECT 'Conversation_members table permissions fixed' as status;
