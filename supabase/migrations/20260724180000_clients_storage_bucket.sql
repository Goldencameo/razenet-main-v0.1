-- RazePlayer client downloads (public read) + optional game packs bucket for loaded games
-- Upload files with Supabase CLI after applying this migration:
--   supabase storage cp razeplayer/RazePlayer.exe supabase://clients/windows/RazePlayer.exe
--   supabase storage cp razeplayer/RazePlayer.pck supabase://clients/windows/RazePlayer.pck

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'clients',
  'clients',
  true,
  524288000,
  ARRAY[
    'application/octet-stream',
    'application/x-msdownload',
    'application/x-msdos-program',
    'application/zip',
    'application/x-executable'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'game-packs',
  'game-packs',
  true,
  524288000,
  ARRAY['application/zip', 'application/octet-stream', 'application/x-zip-compressed']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- clients: anyone can download
DROP POLICY IF EXISTS "Public read clients bucket" ON storage.objects;
CREATE POLICY "Public read clients bucket"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'clients');

-- game-packs: anyone can download published game ZIPs
DROP POLICY IF EXISTS "Public read game-packs bucket" ON storage.objects;
CREATE POLICY "Public read game-packs bucket"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'game-packs');

-- Admins upload/update client binaries and game packs
DROP POLICY IF EXISTS "Admins insert clients bucket" ON storage.objects;
CREATE POLICY "Admins insert clients bucket"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'clients'
    AND EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins update clients bucket" ON storage.objects;
CREATE POLICY "Admins update clients bucket"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'clients'
    AND EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    bucket_id = 'clients'
    AND EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins delete clients bucket" ON storage.objects;
CREATE POLICY "Admins delete clients bucket"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'clients'
    AND EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Developers insert game-packs bucket" ON storage.objects;
CREATE POLICY "Developers insert game-packs bucket"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'game-packs'
    AND EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role IN ('admin', 'developer', 'creator')
    )
  );

DROP POLICY IF EXISTS "Developers update game-packs bucket" ON storage.objects;
CREATE POLICY "Developers update game-packs bucket"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'game-packs'
    AND EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role IN ('admin', 'developer', 'creator')
    )
  )
  WITH CHECK (
    bucket_id = 'game-packs'
    AND EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role IN ('admin', 'developer', 'creator')
    )
  );

DROP POLICY IF EXISTS "Developers delete game-packs bucket" ON storage.objects;
CREATE POLICY "Developers delete game-packs bucket"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'game-packs'
    AND EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role IN ('admin', 'developer', 'creator')
    )
  );
