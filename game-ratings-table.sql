-- CREATE GAME RATINGS TABLE FOR QUICK STAR RATINGS
-- This will store quick star ratings separate from full reviews

-- Drop existing table if it exists
DROP TABLE IF EXISTS game_ratings CASCADE;

-- Create game_ratings table
CREATE TABLE game_ratings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  game_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(game_id, user_id)
);

-- Enable RLS
ALTER TABLE game_ratings ENABLE ROW LEVEL SECURITY;

-- Simple policies
CREATE POLICY "Allow all authenticated users" ON game_ratings
  FOR ALL USING (auth.role() = 'authenticated');

-- Grant permissions
GRANT ALL ON game_ratings TO authenticated;
GRANT SELECT ON game_ratings TO anon;

-- Create indexes
CREATE INDEX idx_game_ratings_game_id ON game_ratings(game_id);
CREATE INDEX idx_game_ratings_user_id ON game_ratings(user_id);

SELECT 'Game ratings table created' as status;
