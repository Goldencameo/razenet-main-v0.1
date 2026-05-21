
-- Auto-accept friend requests sent to the test 'friend' account
CREATE OR REPLACE FUNCTION public.auto_accept_friend_for_test_account()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_test_friend boolean;
BEGIN
  IF NEW.status = 'pending' THEN
    SELECT EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = NEW.addressee_id AND username_lower = 'friend'
    ) INTO is_test_friend;

    IF is_test_friend THEN
      NEW.status := 'accepted';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_auto_accept_friend_for_test ON public.friendships;
CREATE TRIGGER trg_auto_accept_friend_for_test
BEFORE INSERT ON public.friendships
FOR EACH ROW EXECUTE FUNCTION public.auto_accept_friend_for_test_account();

-- Seed test games (idempotent: only inserts if name doesn't already exist)
INSERT INTO public.games (name, description, developer, genre, subgenre, age_rating, max_players, voice_chat, text_chat, tags, published_at)
SELECT 'Game1', 'A fast-paced arcade test game. Perfect for trying out features in RazeHub.', 'RazeHub Test Studios', 'Arcade', 'Casual', 'E', 4, true, true, ARRAY['Test','Arcade','Casual','Multiplayer'], CURRENT_DATE - INTERVAL '30 days'
WHERE NOT EXISTS (SELECT 1 FROM public.games WHERE name = 'Game1');

INSERT INTO public.games (name, description, developer, genre, subgenre, age_rating, max_players, voice_chat, text_chat, tags, published_at)
SELECT 'Game2', 'A cooperative puzzle test game. Solve rooms with friends.', 'RazeHub Test Studios', 'Puzzle', 'Co-op', 'E10+', 2, true, true, ARRAY['Test','Puzzle','Co-op','Story'], CURRENT_DATE - INTERVAL '60 days'
WHERE NOT EXISTS (SELECT 1 FROM public.games WHERE name = 'Game2');

INSERT INTO public.games (name, description, developer, genre, subgenre, age_rating, max_players, voice_chat, text_chat, tags, published_at)
SELECT 'Game3', 'A competitive shooter test game. Sharpen your aim.', 'RazeHub Test Studios', 'Shooter', 'PvP', 'T', 16, true, true, ARRAY['Test','Shooter','PvP','Action'], CURRENT_DATE - INTERVAL '14 days'
WHERE NOT EXISTS (SELECT 1 FROM public.games WHERE name = 'Game3');
