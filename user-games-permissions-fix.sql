-- Fix permissions for user_games table

-- Enable RLS if not already enabled
ALTER TABLE user_games ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow all authenticated users" ON user_games;
DROP POLICY IF EXISTS "Allow insert for authenticated" ON user_games;
DROP POLICY IF EXISTS "Allow select for authenticated" ON user_games;
DROP POLICY IF EXISTS "Allow update for authenticated" ON user_games;
DROP POLICY IF EXISTS "Allow delete for authenticated" ON user_games;

-- Create policies for authenticated users
CREATE POLICY "Allow insert for authenticated" ON user_games
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow select for authenticated" ON user_games
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow update for authenticated" ON user_games
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow delete for authenticated" ON user_games
  FOR DELETE USING (auth.role() = 'authenticated');

-- Grant permissions
GRANT ALL ON user_games TO authenticated;
GRANT SELECT ON user_games TO anon;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_user_games_user_id ON user_games(user_id);
CREATE INDEX IF NOT EXISTS idx_user_games_game_id ON user_games(game_id);
CREATE INDEX IF NOT EXISTS idx_user_games_is_favorite ON user_games(is_favorite);

SELECT 'User_games table permissions fixed' as status;
