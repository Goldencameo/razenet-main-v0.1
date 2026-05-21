
ALTER TABLE public.user_games
  ADD COLUMN IF NOT EXISTS hours_played numeric NOT NULL DEFAULT 0;

ALTER TABLE public.privacy_settings
  ADD COLUMN IF NOT EXISTS show_playtime boolean NOT NULL DEFAULT true;
