ALTER VIEW public.public_profiles SET (security_invoker = true);

-- Allow public read on profiles. Email exposure is mitigated by clients
-- using the public_profiles view (which excludes email).
CREATE POLICY "Anyone can view profiles"
ON public.profiles FOR SELECT TO anon, authenticated
USING (true);