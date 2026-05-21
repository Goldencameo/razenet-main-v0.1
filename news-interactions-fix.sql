-- Fix news_interactions table RLS policies
-- This script drops and recreates the RLS policies to allow proper CRUD operations

-- First, drop existing policies
DROP POLICY IF EXISTS "Users can view their own news interactions" ON news_interactions;
DROP POLICY IF EXISTS "Users can insert their own news interactions" ON news_interactions;
DROP POLICY IF EXISTS "Users can update their own news interactions" ON news_interactions;
DROP POLICY IF EXISTS "Users can delete their own news interactions" ON news_interactions;

-- Create new policies for authenticated users
CREATE POLICY "Users can view their own news interactions" ON news_interactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own news interactions" ON news_interactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own news interactions" ON news_interactions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own news interactions" ON news_interactions
  FOR DELETE USING (auth.uid() = user_id);

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON news_interactions TO authenticated;
GRANT SELECT ON news_interactions TO anon;

-- Verify the policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'news_interactions';

-- Check RLS is enabled
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'news_interactions';
