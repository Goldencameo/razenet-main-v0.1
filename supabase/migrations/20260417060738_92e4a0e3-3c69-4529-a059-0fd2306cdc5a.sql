
-- ================================================
-- FRIENDSHIPS
-- ================================================
CREATE TYPE public.friendship_status AS ENUM ('pending', 'accepted');

CREATE TABLE public.friendships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id uuid NOT NULL,
  addressee_id uuid NOT NULL,
  status public.friendship_status NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT no_self_friend CHECK (requester_id <> addressee_id),
  CONSTRAINT unique_pair UNIQUE (requester_id, addressee_id)
);

CREATE INDEX friendships_requester_idx ON public.friendships (requester_id);
CREATE INDEX friendships_addressee_idx ON public.friendships (addressee_id);

ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can see friendships they're part of"
  ON public.friendships FOR SELECT TO authenticated
  USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

CREATE POLICY "Users can create friend requests they send"
  ON public.friendships FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Recipient can update (accept) and either side can update"
  ON public.friendships FOR UPDATE TO authenticated
  USING (auth.uid() = addressee_id OR auth.uid() = requester_id);

CREATE POLICY "Either side can delete the friendship"
  ON public.friendships FOR DELETE TO authenticated
  USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

-- Helper: are these two users friends?
CREATE OR REPLACE FUNCTION public.are_friends(_a uuid, _b uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.friendships
    WHERE status = 'accepted'
      AND ((requester_id = _a AND addressee_id = _b)
        OR (requester_id = _b AND addressee_id = _a))
  );
$$;

REVOKE EXECUTE ON FUNCTION public.are_friends(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.are_friends(uuid, uuid) TO authenticated;

-- ================================================
-- FOLLOWS
-- ================================================
CREATE TABLE public.follows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id uuid NOT NULL,
  followee_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT no_self_follow CHECK (follower_id <> followee_id),
  CONSTRAINT unique_follow UNIQUE (follower_id, followee_id)
);

CREATE INDEX follows_follower_idx ON public.follows (follower_id);
CREATE INDEX follows_followee_idx ON public.follows (followee_id);

ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view follows"
  ON public.follows FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Users can follow others as themselves"
  ON public.follows FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow as themselves"
  ON public.follows FOR DELETE TO authenticated
  USING (auth.uid() = follower_id);

-- ================================================
-- NOTIFICATIONS
-- ================================================
CREATE TYPE public.notification_type AS ENUM (
  'system',
  'friend_request',
  'friend_accepted',
  'event_reminder',
  'marketplace_receipt',
  'group_invite'
);

CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type public.notification_type NOT NULL,
  title text NOT NULL,
  body text,
  actor_id uuid,
  link text,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX notifications_user_idx ON public.notifications (user_id, created_at DESC);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
  ON public.notifications FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can create notifications targeted at others"
  ON public.notifications FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = actor_id OR actor_id IS NULL);

CREATE POLICY "Users can update their own notifications"
  ON public.notifications FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications"
  ON public.notifications FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Trigger: when a friend request is created, insert a notification for the addressee
CREATE OR REPLACE FUNCTION public.notify_on_friend_request()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  requester_name text;
BEGIN
  IF NEW.status = 'pending' THEN
    SELECT COALESCE(display_name, username) INTO requester_name
    FROM public.profiles WHERE user_id = NEW.requester_id;

    INSERT INTO public.notifications (user_id, type, title, body, actor_id, link)
    VALUES (
      NEW.addressee_id,
      'friend_request',
      'New friend request',
      COALESCE(requester_name, 'Someone') || ' sent you a friend request',
      NEW.requester_id,
      '/profile/' || NEW.requester_id::text
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER friendships_notify_request
AFTER INSERT ON public.friendships
FOR EACH ROW EXECUTE FUNCTION public.notify_on_friend_request();

-- Trigger: when status changes pending -> accepted, notify the original requester
CREATE OR REPLACE FUNCTION public.notify_on_friend_accept()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  accepter_name text;
BEGIN
  IF OLD.status = 'pending' AND NEW.status = 'accepted' THEN
    SELECT COALESCE(display_name, username) INTO accepter_name
    FROM public.profiles WHERE user_id = NEW.addressee_id;

    INSERT INTO public.notifications (user_id, type, title, body, actor_id, link)
    VALUES (
      NEW.requester_id,
      'friend_accepted',
      'Friend request accepted',
      COALESCE(accepter_name, 'Someone') || ' accepted your friend request',
      NEW.addressee_id,
      '/profile/' || NEW.addressee_id::text
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER friendships_notify_accept
AFTER UPDATE ON public.friendships
FOR EACH ROW EXECUTE FUNCTION public.notify_on_friend_accept();

-- ================================================
-- PRIVACY SETTINGS
-- ================================================
CREATE TYPE public.visibility_audience AS ENUM ('everyone', 'friends', 'nobody');
CREATE TYPE public.profile_visibility AS ENUM ('everyone', 'friends', 'private');

CREATE TABLE public.privacy_settings (
  user_id uuid PRIMARY KEY,
  profile_visibility public.profile_visibility NOT NULL DEFAULT 'everyone',
  show_online_to public.visibility_audience NOT NULL DEFAULT 'everyone',
  show_playing_to public.visibility_audience NOT NULL DEFAULT 'everyone',
  allow_friend_requests boolean NOT NULL DEFAULT true,
  notify_on_friend_request boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.privacy_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own privacy settings"
  ON public.privacy_settings FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Auto-create privacy_settings for new users
CREATE OR REPLACE FUNCTION public.handle_new_user_privacy()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.privacy_settings (user_id) VALUES (NEW.user_id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_create_privacy
AFTER INSERT ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_privacy();

-- Backfill for existing profiles
INSERT INTO public.privacy_settings (user_id)
SELECT user_id FROM public.profiles
ON CONFLICT (user_id) DO NOTHING;

-- ================================================
-- SUPPORT MESSAGES (write us)
-- ================================================
CREATE TABLE public.support_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  recipient text NOT NULL,           -- 'razehub' | 'support' | 'community:<name>'
  reason text NOT NULL,              -- 'suggestion' | 'review' | 'bug' | 'other'
  reason_other text,
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own support messages"
  ON public.support_messages FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can send support messages as themselves"
  ON public.support_messages FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- ================================================
-- updated_at triggers for friendships and privacy
-- ================================================
CREATE TRIGGER friendships_set_updated_at
BEFORE UPDATE ON public.friendships
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER privacy_set_updated_at
BEFORE UPDATE ON public.privacy_settings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
