-- CREATE GAME FOLLOWERS TABLE FOR GAME FOLLOWING
-- This will store which users are following specific games

-- Drop existing table if it exists
DROP TABLE IF EXISTS game_followers CASCADE;

-- Create game_followers table
CREATE TABLE game_followers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  game_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(game_id, user_id)
);

-- Enable RLS
ALTER TABLE game_followers ENABLE ROW LEVEL SECURITY;

-- Simple policies
CREATE POLICY "Allow all authenticated users" ON game_followers
  FOR ALL USING (auth.role() = 'authenticated');

-- Grant permissions
GRANT ALL ON game_followers TO authenticated;
GRANT SELECT ON game_followers TO anon;

-- Create indexes
CREATE INDEX idx_game_followers_game_id ON game_followers(game_id);
CREATE INDEX idx_game_followers_user_id ON game_followers(user_id);

SELECT 'Game followers table created' as status;
