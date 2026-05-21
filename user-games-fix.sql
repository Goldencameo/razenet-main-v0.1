-- Fix user_games table RLS policies to allow follow/favorite operations

-- First, let's check current RLS status
SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_games';

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own games" ON user_games;
DROP POLICY IF EXISTS "Users can insert own games" ON user_games;
DROP POLICY IF EXISTS "Users can update own games" ON user_games;
DROP POLICY IF EXISTS "Users can delete own games" ON user_games;

-- Recreate RLS policies with proper permissions
CREATE POLICY "Users can view own games" ON user_games FOR SELECT USING (auth.uid()::text = user_id);
CREATE POLICY "Users can insert own games" ON user_games FOR INSERT WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY "Users can update own games" ON user_games FOR UPDATE USING (auth.uid()::text = user_id);
CREATE POLICY "Users can delete own games" ON user_games FOR DELETE USING (auth.uid()::text = user_id);

-- Grant necessary permissions
GRANT ALL ON user_games TO authenticated;
GRANT SELECT ON user_games TO anon;

-- Test the policy by checking
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd, 
  qual 
FROM pg_policies 
WHERE tablename = 'user_games' AND schemaname = 'public';
