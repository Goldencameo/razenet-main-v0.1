-- Create missing database views and fix RLS policies for full functionality

-- Create safe_reviews view (public readable reviews with privacy)
CREATE OR REPLACE VIEW safe_reviews AS
SELECT 
  r.id,
  r.user_id,
  r.game_id,
  r.content,
  r.stars,
  r.recommended,
  r.is_incognito,
  r.created_at,
  r.updated_at
FROM reviews r;

-- Grant public access to the view
GRANT SELECT ON safe_reviews TO public;
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Create public_profiles view (public readable profiles)
CREATE OR REPLACE VIEW public_profiles AS
SELECT 
  p.id,
  p.user_id,
  p.username,
  p.username_lower,
  p.display_name,
  p.avatar_color,
  p.bio,
  p.status,
  p.created_at,
  p.updated_at
FROM profiles p;

-- Grant public access to the view
GRANT SELECT ON public_profiles TO public;

-- Fix RLS policies for user_games table
ALTER TABLE user_games ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own games" ON user_games;
DROP POLICY IF EXISTS "Users can insert own games" ON user_games;
DROP POLICY IF EXISTS "Users can update own games" ON user_games;

CREATE POLICY "Users can view own games" ON user_games FOR SELECT USING (auth.uid()::text = user_id);
CREATE POLICY "Users can insert own games" ON user_games FOR INSERT WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY "Users can update own games" ON user_games FOR UPDATE USING (auth.uid()::text = user_id);
CREATE POLICY "Users can delete own games" ON user_games FOR DELETE USING (auth.uid()::text = user_id);

-- Fix RLS policies for reviews table
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own reviews" ON reviews;
DROP POLICY IF EXISTS "Users can insert own reviews" ON reviews;
DROP POLICY IF EXISTS "Users can update own reviews" ON reviews;

CREATE POLICY "Users can view all reviews" ON reviews FOR SELECT USING (true);
CREATE POLICY "Users can insert own reviews" ON reviews FOR INSERT WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY "Users can update own reviews" ON reviews FOR UPDATE USING (auth.uid()::text = user_id);
CREATE POLICY "Users can delete own reviews" ON reviews FOR DELETE USING (auth.uid()::text = user_id);

-- Fix RLS policies for follows table
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage follows" ON follows;

CREATE POLICY "Users can manage follows" ON follows FOR ALL USING (auth.uid()::text = follower_id);

-- Add some test data for likes/dislikes functionality
ALTER TABLE games ADD COLUMN IF NOT EXISTS likes INTEGER DEFAULT 0;
ALTER TABLE games ADD COLUMN IF NOT EXISTS dislikes INTEGER DEFAULT 0;
ALTER TABLE games ADD COLUMN IF NOT EXISTS discussions INTEGER DEFAULT 0;

-- Update Baseplate game with some test stats
UPDATE games 
SET likes = 42, dislikes = 3, discussions = 15 
WHERE name = 'Baseplate';
