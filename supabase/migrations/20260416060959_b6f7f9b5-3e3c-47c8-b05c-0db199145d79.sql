
-- Drop the email lookup RPC that was callable by anon users
DROP FUNCTION IF EXISTS public.get_email_by_username(text);

-- Restrict reviews table SELECT to only the author (public reads use safe_reviews view)
DROP POLICY IF EXISTS "Reviews are viewable by everyone" ON public.reviews;
CREATE POLICY "Users can view their own reviews"
  ON public.reviews FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
