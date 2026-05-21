-- Drop existing table if it exists
DROP TABLE IF EXISTS conversations CASCADE;

-- Create conversations table (plural)
CREATE TABLE conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL DEFAULT 'dm',
  name TEXT,
  created_by TEXT NOT NULL,
  host_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- Simple policies
CREATE POLICY "Allow all authenticated users" ON conversations
  FOR ALL USING (auth.role() = 'authenticated');

-- Grant permissions
GRANT ALL ON conversations TO authenticated;
GRANT SELECT ON conversations TO anon;

-- Create indexes
CREATE INDEX idx_conversations_type ON conversations(type);
CREATE INDEX idx_conversations_created_by ON conversations(created_by);
CREATE INDEX idx_conversations_host_id ON conversations(host_id);
CREATE INDEX idx_conversations_created_at ON conversations(created_at);
CREATE INDEX idx_conversations_updated_at ON conversations(updated_at);

SELECT 'Conversations table (plural) created' as status;
