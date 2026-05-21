-- Insert test game "Baseplate" by RazeStudio
INSERT INTO games (
  id,
  name,
  description,
  developer,
  genre,
  subgenre,
  age_rating,
  max_players,
  text_chat,
  voice_chat,
  trailer_url,
  image_urls,
  avatar_color,
  published_at,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'Baseplate',
  'Welcome to Baseplate - the ultimate creative sandbox experience! Build, create, and explore in a vibrant open world filled with endless possibilities. Design your own structures, craft unique items, and collaborate with friends to bring your imagination to life. With advanced building tools, realistic physics, and a thriving community, Baseplate offers the perfect canvas for your creativity.',
  'RazeStudio',
  'Sandbox',
  'Creative Building',
  'E10+',
  100,
  true,
  true,
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  ARRAY['https://picsum.photos/seed/baseplate1/800/600.jpg', 'https://picsum.photos/seed/baseplate2/800/600.jpg', 'https://picsum.photos/seed/baseplate3/800/600.jpg'],
  '#FF6B6B',
  NOW() - INTERVAL '6 months',
  NOW(),
  NOW()
);

-- Insert test community "RazeHub Creators"
INSERT INTO communities (
  id,
  name,
  description,
  avatar_color,
  created_by,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'RazeHub Creators',
  'Welcome to RazeHub Creators - the ultimate community for game developers, designers, and creative minds! Share your projects, get feedback, collaborate with other creators, and stay up-to-date with the latest development tools and trends. Whether you''re building the next blockbuster game or just starting your development journey, this is your home for creativity and innovation.',
  '#9B59B6',
  'glagol', -- your username
  NOW(),
  NOW()
);

-- Add Baseplate to user's favorite games (replace with your actual user_id)
-- First, get your user_id from the profiles table
-- Then run: INSERT INTO user_games (user_id, game_id, is_favorite, created_at) VALUES ('your-user-id', (SELECT id FROM games WHERE name = 'Baseplate'), true, NOW());
