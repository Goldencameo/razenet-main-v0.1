
-- 1. Fix profiles public email exposure: restrict SELECT to authenticated users
DROP POLICY "Profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Profiles are viewable by authenticated users"
  ON public.profiles FOR SELECT TO authenticated
  USING (true);

-- 2. Create secure RPC for username-to-email lookup (for login flow)
CREATE OR REPLACE FUNCTION public.get_email_by_username(lookup_username text)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT email FROM public.profiles WHERE username_lower = LOWER(lookup_username) LIMIT 1
$$;

-- 3. Fix incognito review leak: create a view that masks user_id for incognito reviews
CREATE OR REPLACE VIEW public.safe_reviews AS
SELECT
  id,
  CASE WHEN is_incognito THEN '00000000-0000-0000-0000-000000000000'::uuid ELSE user_id END AS user_id,
  game_id,
  recommended,
  stars,
  content,
  is_incognito,
  created_at,
  updated_at
FROM public.reviews;

-- Grant access to the view
GRANT SELECT ON public.safe_reviews TO anon, authenticated;

-- 4. Add server-side username format constraint
ALTER TABLE public.profiles
  ADD CONSTRAINT username_format
  CHECK (
    length(username) BETWEEN 3 AND 20
    AND username ~ '^[a-zA-Z0-9][a-zA-Z0-9_.]*[a-zA-Z0-9]$'
    AND username !~ '[_.]{2}'
  );
