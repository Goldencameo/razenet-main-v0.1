-- SIMPLE NEWS_INTERACTIONS FIX
-- Run this in Supabase SQL Editor to fix likes functionality

-- Drop existing table
DROP TABLE IF EXISTS news_interactions CASCADE;

-- Create simple table without complex RLS
CREATE TABLE news_interactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  news_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  interaction_type TEXT NOT NULL CHECK (interaction_type IN ('like', 'dislike')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS but with simple policies
ALTER TABLE news_interactions ENABLE ROW LEVEL SECURITY;

-- Simple policy: allow all authenticated users to do everything
CREATE POLICY "Allow all authenticated users" ON news_interactions
  FOR ALL USING (auth.role() = 'authenticated');

-- Grant permissions
GRANT ALL ON news_interactions TO authenticated;
GRANT SELECT ON news_interactions TO anon;

-- Create indexes for performance
CREATE INDEX idx_news_interactions_news_id ON news_interactions(news_id);
CREATE INDEX idx_news_interactions_user_id ON news_interactions(user_id);

-- Verify table exists
SELECT 'Table created successfully' as status;
