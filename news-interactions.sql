-- Create table for news interactions (likes/dislikes)
CREATE TABLE IF NOT EXISTS news_interactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  news_id TEXT NOT NULL, -- Since news is mock data, use text ID
  user_id TEXT NOT NULL REFERENCES profiles(user_id),
  interaction_type TEXT NOT NULL CHECK (interaction_type IN ('like', 'dislike')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(news_id, user_id) -- One interaction per user per news
);

-- Enable RLS
ALTER TABLE news_interactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view all news interactions" ON news_interactions FOR SELECT USING (true);
CREATE POLICY "Users can insert own interactions" ON news_interactions FOR INSERT WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY "Users can update own interactions" ON news_interactions FOR UPDATE USING (auth.uid()::text = user_id);
CREATE POLICY "Users can delete own interactions" ON news_interactions FOR DELETE USING (auth.uid()::text = user_id);

-- Grant public access for reading
GRANT SELECT ON news_interactions TO public;
