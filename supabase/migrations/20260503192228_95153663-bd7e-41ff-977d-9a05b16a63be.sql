
-- Allow conversation creators to see their conversations (fixes .select() after .insert())
CREATE POLICY "Creators can view their conversations"
ON public.conversations
FOR SELECT
TO authenticated
USING (created_by = auth.uid());

-- Add last_seen_at for real online/offline tracking
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_seen_at timestamptz DEFAULT now();
