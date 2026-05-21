CREATE POLICY "Public can view profiles for search"
ON public.profiles FOR SELECT TO anon, authenticated
USING (true);