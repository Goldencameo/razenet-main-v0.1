-- Check if news_interactions table exists and its structure
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'news_interactions' 
ORDER BY ordinal_position;

-- Check if table exists at all
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'news_interactions'
) AS table_exists;

-- Check current RLS policies
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

-- Check RLS status
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'news_interactions';

-- Check if there are any existing interactions
SELECT COUNT(*) as total_interactions FROM news_interactions;

-- Create the table if it doesn't exist
CREATE TABLE IF NOT EXISTS news_interactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  news_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  interaction_type TEXT NOT NULL CHECK (interaction_type IN ('like', 'dislike')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on the table
ALTER TABLE news_interactions ENABLE ROW LEVEL SECURITY;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_news_interactions_news_id ON news_interactions(news_id);
CREATE INDEX IF NOT EXISTS idx_news_interactions_user_id ON news_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_news_interactions_news_user ON news_interactions(news_id, user_id);
