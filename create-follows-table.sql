-- Drop existing table if it exists
DROP TABLE IF EXISTS follows CASCADE;

-- Create follows table
CREATE TABLE follows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id TEXT NOT NULL,
  followee_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(follower_id, followee_id)
);

-- Enable RLS
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

-- Simple policies
CREATE POLICY "Allow all authenticated users" ON follows
  FOR ALL USING (auth.role() = 'authenticated');

-- Grant permissions
GRANT ALL ON follows TO authenticated;
GRANT SELECT ON follows TO anon;

-- Create indexes
CREATE INDEX idx_follows_follower_id ON follows(follower_id);
CREATE INDEX idx_follows_followee_id ON follows(followee_id);

SELECT 'Follows table created' as status;
