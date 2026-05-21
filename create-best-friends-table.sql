-- Drop existing table if it exists
DROP TABLE IF EXISTS best_friends CASCADE;

-- Create best_friends table
CREATE TABLE best_friends (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  friend_id TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, friend_id)
);

-- Enable RLS
ALTER TABLE best_friends ENABLE ROW LEVEL SECURITY;

-- Simple policies
CREATE POLICY "Allow all authenticated users" ON best_friends
  FOR ALL USING (auth.role() = 'authenticated');

-- Grant permissions
GRANT ALL ON best_friends TO authenticated;
GRANT SELECT ON best_friends TO anon;

-- Create indexes
CREATE INDEX idx_best_friends_user_id ON best_friends(user_id);
CREATE INDEX idx_best_friends_friend_id ON best_friends(friend_id);
CREATE INDEX idx_best_friends_status ON best_friends(status);

SELECT 'Best friends table created' as status;
