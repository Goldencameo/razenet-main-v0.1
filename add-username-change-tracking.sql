-- Add column to track last username change date
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS username_changed_at TIMESTAMP WITH TIME ZONE;

-- Create function to check if user can change username (1 week cooldown)
CREATE OR REPLACE FUNCTION public.can_change_username(user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    username_changed_at IS NULL 
    OR username_changed_at < NOW() - INTERVAL '7 days'
  FROM public.profiles
  WHERE user_id = user_id;
$$;

-- Create function to update username change timestamp
CREATE OR REPLACE FUNCTION public.update_username_change_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.username IS DISTINCT FROM NEW.username THEN
    NEW.username_changed_at = NOW();
  END IF;
  RETURN NEW;
END;
$$;

-- Add trigger to automatically update timestamp when username changes
DROP TRIGGER IF EXISTS update_username_timestamp ON public.profiles;
CREATE TRIGGER update_username_timestamp
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_username_change_timestamp();
