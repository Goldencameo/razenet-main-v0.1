-- Fix the handle_new_user trigger to properly handle username from metadata
-- This should prevent the default "user-{uuid}" usernames

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  username_from_meta TEXT;
  avatar_color_from_meta TEXT;
BEGIN
  -- Get username from metadata, fallback to a generated one if not present
  username_from_meta := COALESCE(
    NEW.raw_user_meta_data->>'username',
    'user-' || substring(NEW.id::text, 1, 8)
  );
  
  -- Get avatar color from metadata, fallback to default
  avatar_color_from_meta := COALESCE(
    NEW.raw_user_meta_data->>'avatar_color',
    '#3B82F6'
  );
  
  -- Only create profile if it doesn't already exist
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles WHERE user_id = NEW.id
  ) THEN
    INSERT INTO public.profiles (user_id, username, username_lower, display_name, email, avatar_color)
    VALUES (
      NEW.id,
      username_from_meta,
      LOWER(username_from_meta),
      COALESCE(NEW.raw_user_meta_data->>'display_name', username_from_meta),
      NEW.email,
      avatar_color_from_meta
    );
  END IF;
  
  -- Insert user role if not exists
  IF NOT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = NEW.id
  ) THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
