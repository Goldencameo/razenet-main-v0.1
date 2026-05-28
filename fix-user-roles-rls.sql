-- Fix RLS policy for user_roles table
-- This allows authenticated users to read their own role

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own role" ON public.user_roles;

-- Create policy to allow users to read their own role
CREATE POLICY "Users can view their own role"
ON public.user_roles
FOR SELECT
USING (auth.uid()::text = user_id::text);

-- Enable RLS on user_roles table
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
