-- CREATE NEWS TABLE FOR DATABASE STORAGE
-- This creates a proper news table to store news data in the database

-- Drop existing news table if it exists
DROP TABLE IF EXISTS news CASCADE;

-- Create news table
CREATE TABLE news (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  game_id TEXT NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  full_content TEXT NOT NULL,
  image TEXT,
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE news ENABLE ROW LEVEL SECURITY;

-- Simple policy for news table
CREATE POLICY "Allow all authenticated users" ON news
  FOR ALL USING (auth.role() = 'authenticated');

-- Grant permissions
GRANT ALL ON news TO authenticated;
GRANT SELECT ON news TO anon;

-- Create indexes
CREATE INDEX idx_news_game_id ON news(game_id);
CREATE INDEX idx_news_date ON news(date);

-- Insert sample news data for testing
INSERT INTO news (game_id, type, title, content, full_content, image) VALUES
  ('sample-game-1', 'Small Update', 'Counter-Strike 2 Update', 'We''ve released a new update with bug fixes and performance improvements.', 'We''ve released a new update with bug fixes and performance improvements. This update includes several balance changes and new features.', null),
  ('sample-game-1', 'Patch Notes', 'Summer Patch 1.2.3', 'Major patch with new weapons, maps, and gameplay improvements.', 'Major patch with new weapons, maps, and gameplay improvements. Check out the full patch notes for all details.', null),
  ('sample-game-1', 'Announcement', 'Community Tournament', 'Join our upcoming community tournament with prizes and exclusive rewards.', 'Join our upcoming community tournament with prizes and exclusive rewards for winners. Registration opens next week.', null),
  ('sample-game-1', 'Event', 'Game Jam Weekend', 'Join us for a 48-hour game jam event. Create amazing games and win prizes!', 'Join us for a 48-hour game jam event. Create amazing games and win prizes! This event is open to all skill levels.', null);

SELECT 'News table created with sample data' as status;
