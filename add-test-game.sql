-- Add a new game called "Game" for testing UI
-- This game looks like it was just published with random UIs/events

INSERT INTO public.games (
  id,
  name,
  description,
  image_urls,
  developer,
  genre,
  subgenre,
  age_rating,
  max_players,
  text_chat,
  voice_chat,
  trailer_url,
  avatar_color,
  published_at,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'Game',
  'A testing ground for UI development. This game was just published and contains random UI elements and events that weren''t specifically designed for it. Perfect for testing and experimenting with new features.',
  ARRAY['https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800', 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800'],
  'RazeHub Team',
  'Testing',
  'Experimental',
  'Everyone',
  100,
  true,
  true,
  NULL,
  '#3B82F6',
  NOW(),
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;
