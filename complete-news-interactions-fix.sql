-- COMPLETE NEWS_INTERACTIONS TABLE FIX
-- Run this entire script in Supabase SQL Editor to fix likes functionality

-- Step 1: Drop existing table if it exists
DROP TABLE IF EXISTS news_interactions CASCADE;

-- Step 2: Create the table with proper structure
CREATE TABLE news_interactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  news_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  interaction_type TEXT NOT NULL CHECK (interaction_type IN ('like', 'dislike')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 3: Enable Row Level Security
ALTER TABLE news_interactions ENABLE ROW LEVEL SECURITY;

-- Step 4: Create RLS policies
CREATE POLICY "Users can view their own news interactions" ON news_interactions
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own news interactions" ON news_interactions
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own news interactions" ON news_interactions
  FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own news interactions" ON news_interactions
  FOR DELETE USING (auth.uid()::text = user_id);

-- Step 5: Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON news_interactions TO authenticated;
GRANT SELECT ON news_interactions TO anon;

-- Step 6: Create indexes for performance
CREATE INDEX idx_news_interactions_news_id ON news_interactions(news_id);
CREATE INDEX idx_news_interactions_user_id ON news_interactions(user_id);
CREATE INDEX idx_news_interactions_news_user ON news_interactions(news_id, user_id);

-- Step 7: Verify everything is working
SELECT 
  'Table exists' as check,
  COUNT(*) as row_count
FROM information_schema.tables 
WHERE table_name = 'news_interactions';

SELECT 
  'RLS enabled' as rls_status,
  COUNT(*) as policy_count
FROM pg_policies 
WHERE tablename = 'news_interactions';
