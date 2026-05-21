
CREATE TYPE best_friend_status AS ENUM ('pending', 'accepted');

CREATE TABLE public.best_friends (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  friend_id UUID NOT NULL,
  status best_friend_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, friend_id)
);

ALTER TABLE public.best_friends ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view best friend entries they are part of"
ON public.best_friends FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Users can send best friend requests"
ON public.best_friends FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Friend can accept best friend request"
ON public.best_friends FOR UPDATE
TO authenticated
USING (auth.uid() = friend_id);

CREATE POLICY "Either side can remove best friend"
ON public.best_friends FOR DELETE
TO authenticated
USING (auth.uid() = user_id OR auth.uid() = friend_id);
