ALTER VIEW public.user_moderation_status SET (security_invoker = true);
ALTER VIEW public.public_profiles SET (security_invoker = true);
ALTER VIEW public.safe_reviews SET (security_invoker = true);