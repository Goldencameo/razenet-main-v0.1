-- CREATE COMMUNITY_MEMBERS TABLE FOR PROPER MEMBER TRACKING
-- This will allow tracking real community membership and online status

-- Drop existing table if it exists
DROP TABLE IF EXISTS community_members CASCADE;

-- Create community_members table
CREATE TABLE community_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  community_name TEXT NOT NULL,
  user_id TEXT NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_online BOOLEAN DEFAULT FALSE,
  UNIQUE(community_name, user_id)
);

-- Enable RLS
ALTER TABLE community_members ENABLE ROW LEVEL SECURITY;

-- Simple policies
CREATE POLICY "Allow all authenticated users" ON community_members
  FOR ALL USING (auth.role() = 'authenticated');

-- Grant permissions
GRANT ALL ON community_members TO authenticated;
GRANT SELECT ON community_members TO anon;

-- Create indexes
CREATE INDEX idx_community_members_name ON community_members(community_name);
CREATE INDEX idx_community_members_user ON community_members(user_id);
CREATE INDEX idx_community_members_online ON community_members(is_online) WHERE is_online = true;

SELECT 'Community members table created' as status;
