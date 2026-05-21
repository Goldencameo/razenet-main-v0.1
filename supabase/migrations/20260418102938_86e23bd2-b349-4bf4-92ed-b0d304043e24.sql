-- 1) Profiles: remove blanket public SELECT that exposes email
DROP POLICY IF EXISTS "Public profile fields are readable" ON public.profiles;
-- Keep "Users can view their own profile" (owner-only) so email stays private.
-- Public read access for non-sensitive fields is provided by the public_profiles view.

-- 2) Notifications: tighten INSERT to require recipient = self
DROP POLICY IF EXISTS "Authenticated users can create notifications targeted at others" ON public.notifications;
CREATE POLICY "Users can insert notifications for themselves"
  ON public.notifications FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND (auth.uid() = actor_id OR actor_id IS NULL)
  );
-- Server-side SECURITY DEFINER triggers (notify_on_friend_request, notify_on_friend_accept) bypass RLS and continue to work.

-- 3) login_attempts: RLS is enabled but no policy. Add an explicit deny-all so intent is clear.
CREATE POLICY "No client access to login attempts"
  ON public.login_attempts FOR ALL TO anon, authenticated
  USING (false) WITH CHECK (false);
-- The edge function uses the service role key and bypasses RLS.