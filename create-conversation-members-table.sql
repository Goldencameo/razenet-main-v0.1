-- Drop existing table if it exists
DROP TABLE IF EXISTS conversation_members CASCADE;

-- Create conversation_members table
CREATE TABLE conversation_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL,
  user_id TEXT NOT NULL,
  last_read_at TIMESTAMP WITH TIME ZONE,
  muted BOOLEAN DEFAULT FALSE,
  notifications_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(conversation_id, user_id)
);

-- Enable RLS
ALTER TABLE conversation_members ENABLE ROW LEVEL SECURITY;

-- Simple policies
CREATE POLICY "Allow all authenticated users" ON conversation_members
  FOR ALL USING (auth.role() = 'authenticated');

-- Grant permissions
GRANT ALL ON conversation_members TO authenticated;
GRANT SELECT ON conversation_members TO anon;

-- Create indexes
CREATE INDEX idx_conversation_members_conversation_id ON conversation_members(conversation_id);
CREATE INDEX idx_conversation_members_user_id ON conversation_members(user_id);

SELECT 'Conversation_members table created' as status;
