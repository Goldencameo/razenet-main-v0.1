DROP POLICY IF EXISTS "Public can view profiles for search" ON public.profiles;

-- Revert public_profiles to security_definer so it bypasses profiles RLS,
-- but only exposes safe columns (it does not select email).
ALTER VIEW public.public_profiles SET (security_invoker = false);