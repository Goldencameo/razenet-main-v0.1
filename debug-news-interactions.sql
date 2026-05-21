-- DEBUG: Check news_interactions table and data
-- Run this script to verify what's happening with the table

-- Check if table exists
SELECT 
  'Table exists' as check,
  COUNT(*) as row_count
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name = 'news_interactions';

-- Check table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'news_interactions' 
ORDER BY ordinal_position;

-- Check RLS policies
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

-- Check if there are any existing interactions
SELECT 
  id,
  news_id,
  user_id,
  interaction_type,
  created_at,
  updated_at
FROM news_interactions 
LIMIT 5;

-- Check RLS status
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'news_interactions';

-- Test if we can insert a sample record
-- (Uncomment this to test)
-- INSERT INTO news_interactions (news_id, user_id, interaction_type) 
-- VALUES ('test-news-123', 'test-user-456', 'like');
