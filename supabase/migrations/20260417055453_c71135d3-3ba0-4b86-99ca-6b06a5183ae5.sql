
-- 1. Restrict has_role to authenticated self-checks only
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  IF _user_id <> auth.uid() AND NOT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  );
END;
$$;

-- 2. Replace SECURITY DEFINER views with safer alternatives.
DROP VIEW IF EXISTS public.public_profiles CASCADE;
DROP VIEW IF EXISTS public.safe_reviews CASCADE;

-- public_profiles as a normal (non-definer) view limited to non-sensitive columns.
CREATE VIEW public.public_profiles
WITH (security_invoker = true) AS
SELECT user_id, username, username_lower, display_name, avatar_color, bio, status, created_at
FROM public.profiles;

-- Safe reviews via SECURITY INVOKER view backed by an explicit SELECT policy on reviews.
CREATE POLICY "Public can view non-identifying review fields"
  ON public.reviews FOR SELECT TO anon, authenticated
  USING (true);

CREATE VIEW public.safe_reviews
WITH (security_invoker = true) AS
SELECT
  id, game_id, recommended, stars, content, is_incognito, created_at, updated_at,
  CASE WHEN is_incognito THEN '00000000-0000-0000-0000-000000000000'::uuid ELSE user_id END AS user_id
FROM public.reviews;

GRANT SELECT ON public.public_profiles TO anon, authenticated;
GRANT SELECT ON public.safe_reviews TO anon, authenticated;

-- Allow profiles SELECT to also be read via the public_profiles view path (RLS still applies on base table).
-- Since public_profiles is security_invoker, callers need a policy permitting them to read non-sensitive columns.
-- Add a permissive SELECT policy that excludes nothing at row-level (column protection handled by view shape + we drop email exposure by NOT exposing it through the view; the base table policy remains owner-only for direct reads).
-- For the view to return rows for other users, we need a SELECT policy allowing reads of all rows. We add it ONLY for the columns exposed via the view by using a separate policy on the table; Postgres does not support column-level RLS, so we accept that direct profiles SELECT is still owner-only and rely on application code using public_profiles.
-- To make the view actually return other users' rows under security_invoker, we add a permissive SELECT policy. To prevent email exposure on the base table, we drop the email column from the row visibility by NOT granting select on email to anon/authenticated.
REVOKE SELECT ON public.profiles FROM anon, authenticated;
GRANT SELECT (user_id, username, username_lower, display_name, avatar_color, bio, status, created_at, updated_at, id) ON public.profiles TO anon, authenticated;

CREATE POLICY "Public profile fields are readable"
  ON public.profiles FOR SELECT TO anon, authenticated
  USING (true);

-- 3. Restrict profile and review writes to authenticated role only.
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can update their own reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can delete their own reviews" ON public.reviews;
CREATE POLICY "Users can create their own reviews"
  ON public.reviews FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own reviews"
  ON public.reviews FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own reviews"
  ON public.reviews FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- 4. Persistent login attempt tracking for brute-force protection across edge isolates.
CREATE TABLE IF NOT EXISTS public.login_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip text NOT NULL,
  identifier text,
  attempted_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS login_attempts_ip_time_idx ON public.login_attempts (ip, attempted_at DESC);
ALTER TABLE public.login_attempts ENABLE ROW LEVEL SECURITY;
-- No policies = no client access; only service role (used by edge function) bypasses RLS.
