-- Fix permissions for messages table

-- Enable RLS if not already enabled
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow all authenticated users" ON messages;
DROP POLICY IF EXISTS "Allow insert for authenticated" ON messages;
DROP POLICY IF EXISTS "Allow select for authenticated" ON messages;
DROP POLICY IF EXISTS "Allow update for authenticated" ON messages;
DROP POLICY IF EXISTS "Allow delete for authenticated" ON messages;

-- Create policies for authenticated users
CREATE POLICY "Allow insert for authenticated" ON messages
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow select for authenticated" ON messages
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow update for authenticated" ON messages
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow delete for authenticated" ON messages
  FOR DELETE USING (auth.role() = 'authenticated');

-- Grant permissions
GRANT ALL ON messages TO authenticated;
GRANT SELECT ON messages TO anon;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

SELECT 'Messages table permissions fixed' as status;
