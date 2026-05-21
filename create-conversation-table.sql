-- Drop existing table if it exists
DROP TABLE IF EXISTS conversation CASCADE;

-- Create conversation table
CREATE TABLE conversation (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE conversation ENABLE ROW LEVEL SECURITY;

-- Simple policies
CREATE POLICY "Allow all authenticated users" ON conversation
  FOR ALL USING (auth.role() = 'authenticated');

-- Grant permissions
GRANT ALL ON conversation TO authenticated;
GRANT SELECT ON conversation TO anon;

-- Create indexes
CREATE INDEX idx_conversation_created_at ON conversation(created_at);
CREATE INDEX idx_conversation_updated_at ON conversation(updated_at);

SELECT 'Conversation table created' as status;
