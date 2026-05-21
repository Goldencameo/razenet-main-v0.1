
-- 1. Restrict email column on profiles from public reads
-- Drop the overly permissive public policy and replace with one that excludes email
DROP POLICY IF EXISTS "Anyone can view profiles" ON public.profiles;

-- Revoke email column access from anon/authenticated for safety
REVOKE SELECT (email) ON public.profiles FROM anon, authenticated;

-- Grant SELECT on all non-sensitive columns
GRANT SELECT (id, user_id, username, username_lower, display_name, avatar_color, bio, status, created_at, updated_at) ON public.profiles TO anon, authenticated;

-- Re-add a public read policy (column-level grants will block email)
CREATE POLICY "Public can view non-sensitive profile fields"
ON public.profiles
FOR SELECT
TO anon, authenticated
USING (true);

-- 2. Fix incognito review identity leak
DROP POLICY IF EXISTS "Public can view non-identifying review fields" ON public.reviews;

-- Drop existing safe_reviews view if present and recreate
DROP VIEW IF EXISTS public.safe_reviews CASCADE;

CREATE VIEW public.safe_reviews
WITH (security_invoker = true)
AS
SELECT
  id,
  game_id,
  CASE WHEN is_incognito THEN NULL ELSE user_id END AS user_id,
  recommended,
  stars,
  content,
  is_incognito,
  created_at,
  updated_at
FROM public.reviews;

GRANT SELECT ON public.safe_reviews TO anon, authenticated;

-- Restrict raw reviews public SELECT to only non-identifying when incognito
CREATE POLICY "Public can view reviews when not incognito"
ON public.reviews
FOR SELECT
TO anon, authenticated
USING (is_incognito = false);

-- 3. Remove client-side notification insert (only triggers/service role can insert)
DROP POLICY IF EXISTS "Users can insert notifications for themselves" ON public.notifications;
