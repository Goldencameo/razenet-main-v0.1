-- Create game_players table for multiplayer tracking
CREATE TABLE IF NOT EXISTS game_players (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  game_id TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  avatar_color TEXT DEFAULT '#3B82F6',
  position_x FLOAT DEFAULT 0,
  position_y FLOAT DEFAULT 1,
  position_z FLOAT DEFAULT 0,
  rotation_y FLOAT DEFAULT 0,
  is_jumping BOOLEAN DEFAULT false,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(game_id, user_id)
);

-- Enable realtime
alter publication supabase_realtime add table game_players;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_game_players_game_id ON game_players(game_id);
CREATE INDEX IF NOT EXISTS idx_game_players_user_id ON game_players(user_id);

-- Enable RLS
ALTER TABLE game_players ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view players in their game"
  ON game_players FOR SELECT
  USING (game_id IN (
    SELECT id::text FROM games WHERE id::text = game_players.game_id
  ));

CREATE POLICY "Users can insert their own player state"
  ON game_players FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own player state"
  ON game_players FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own player state"
  ON game_players FOR DELETE
  USING (auth.uid() = user_id);
