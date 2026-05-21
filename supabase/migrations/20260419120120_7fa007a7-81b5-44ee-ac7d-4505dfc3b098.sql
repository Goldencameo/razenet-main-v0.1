-- Grant access to public_profiles view
GRANT SELECT ON public.public_profiles TO anon, authenticated;
GRANT SELECT ON public.safe_reviews TO anon, authenticated;

-- Moderation actions table (audit log + active mutes/bans)
CREATE TABLE IF NOT EXISTS public.moderation_actions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  target_user_id UUID NOT NULL,
  moderator_id UUID NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('mute','unmute','ban','unban','warn','delete')),
  reason TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.moderation_actions ENABLE ROW LEVEL SECURITY;

-- Only admins/moderators can read; only admins can write
CREATE POLICY "Mods can view moderation actions"
ON public.moderation_actions FOR SELECT TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin','moderator'))
);

CREATE POLICY "Admins can insert moderation actions"
ON public.moderation_actions FOR INSERT TO authenticated
WITH CHECK (
  moderator_id = auth.uid() AND
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

CREATE INDEX IF NOT EXISTS idx_mod_actions_target ON public.moderation_actions(target_user_id, created_at DESC);

-- Helper view: current active status per user
CREATE OR REPLACE VIEW public.user_moderation_status AS
SELECT 
  target_user_id AS user_id,
  bool_or(action = 'ban' AND (expires_at IS NULL OR expires_at > now()) 
    AND NOT EXISTS (
      SELECT 1 FROM public.moderation_actions m2 
      WHERE m2.target_user_id = m.target_user_id 
        AND m2.action = 'unban' 
        AND m2.created_at > m.created_at
    )) AS is_banned,
  bool_or(action = 'mute' AND (expires_at IS NULL OR expires_at > now())
    AND NOT EXISTS (
      SELECT 1 FROM public.moderation_actions m2 
      WHERE m2.target_user_id = m.target_user_id 
        AND m2.action = 'unmute' 
        AND m2.created_at > m.created_at
    )) AS is_muted
FROM public.moderation_actions m
GROUP BY target_user_id;

GRANT SELECT ON public.user_moderation_status TO authenticated;