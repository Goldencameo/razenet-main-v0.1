
-- 1. Fix profiles email exposure: restrict SELECT to own row
DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON public.profiles;
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Create a public view excluding email for other users to query
CREATE OR REPLACE VIEW public.public_profiles AS
  SELECT user_id, username, username_lower, display_name, avatar_color, bio, status, created_at
  FROM public.profiles;

-- Grant access to the view
GRANT SELECT ON public.public_profiles TO authenticated;
GRANT SELECT ON public.public_profiles TO anon;

-- 2. Fix safe_reviews: recreate as SECURITY DEFINER so it can read reviews despite RLS
DROP VIEW IF EXISTS public.safe_reviews;
CREATE VIEW public.safe_reviews
  WITH (security_barrier = true)
AS
  SELECT
    id, game_id, recommended, stars, content, is_incognito, created_at, updated_at,
    CASE WHEN is_incognito THEN '00000000-0000-0000-0000-000000000000'::uuid ELSE user_id END AS user_id
  FROM public.reviews;

ALTER VIEW public.safe_reviews OWNER TO postgres;
GRANT SELECT ON public.safe_reviews TO authenticated;
GRANT SELECT ON public.safe_reviews TO anon;
