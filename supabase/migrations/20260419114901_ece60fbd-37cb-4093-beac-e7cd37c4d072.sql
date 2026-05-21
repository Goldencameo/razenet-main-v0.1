UPDATE auth.users
SET email_confirmed_at = now()
WHERE email_confirmed_at IS NULL;

INSERT INTO public.user_roles (user_id, role)
SELECT '7741a7a3-2c81-43eb-9e79-01d2101b38d5'::uuid, 'admin'::public.app_role
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_roles
  WHERE user_id = '7741a7a3-2c81-43eb-9e79-01d2101b38d5'::uuid AND role = 'admin'
);