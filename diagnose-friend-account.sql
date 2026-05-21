-- Diagnose friend's account issues
-- Run these queries to understand what's wrong with the friend's account

-- 1. Check the friend's profile data (the one with wrong username)
SELECT 
  p.user_id,
  p.username,
  p.username_lower,
  p.display_name,
  p.email,
  p.avatar_color,
  p.status,
  p.created_at,
  p.updated_at,
  u.id as auth_user_id,
  u.email as auth_email,
  u.created_at as auth_created_at,
  u.last_sign_in_at,
  u.raw_user_meta_data
FROM profiles p
LEFT JOIN auth.users u ON p.user_id::text = u.id::text
WHERE p.username LIKE 'user-f5711e42%';

-- 2. Check if Mashkz_442 exists (the correct username)
SELECT 
  p.user_id,
  p.username,
  p.username_lower,
  p.display_name,
  p.email,
  p.avatar_color,
  p.status,
  p.created_at,
  p.updated_at,
  u.id as auth_user_id,
  u.email as auth_email,
  u.created_at as auth_created_at,
  u.last_sign_in_at
FROM profiles p
LEFT JOIN auth.users u ON p.user_id::text = u.id::text
WHERE p.username_lower = 'mashkz_442';

-- 3. Check all profiles to see what's in the database
SELECT 
  user_id,
  username,
  username_lower,
  display_name,
  status,
  created_at
FROM profiles
ORDER BY created_at DESC
LIMIT 20;

-- 4. Check if there are any RLS policy issues
-- Check if the friend's user has proper roles
SELECT 
  ur.user_id,
  ur.role,
  p.username
FROM user_roles ur
JOIN profiles p ON ur.user_id::text = p.user_id::text
WHERE p.username LIKE 'user-f5711e42%' OR p.username_lower = 'mashkz_442';

-- 5. Check friend requests between accounts
SELECT 
  f.id,
  f.user_id,
  f.friend_id,
  f.status,
  u1.username as requester_username,
  u2.username as addressee_username
FROM friendships f
JOIN profiles u1 ON f.user_id::text = u1.user_id::text
JOIN profiles u2 ON f.friend_id::text = u2.user_id::text
WHERE u1.username LIKE 'user-f5711e42%'
   OR u1.username_lower = 'mashkz_442'
   OR u2.username LIKE 'user-f5711e42%'
   OR u2.username_lower = 'mashkz_442';

-- 6. FIX: Update the wrong username to the correct one (if Mashkz_442 doesn't exist)
-- Uncomment and run ONLY if the query above shows Mashkz_442 doesn't exist
-- UPDATE profiles 
-- SET username = 'Mashkz_442',
--     username_lower = 'mashkz_442',
--     display_name = 'Mashkz_442'
-- WHERE username LIKE 'user-f5711e42%';

-- 7. FIX: If Mashkz_442 exists but is a different account, delete the wrong one
-- WARNING: This will delete all data for the wrong account!
-- Uncomment and run ONLY if you're sure this is the wrong account
-- DELETE FROM profiles WHERE username LIKE 'user-f5711e42%';
-- DELETE FROM auth.users WHERE id::text IN (
--   SELECT user_id::text FROM profiles WHERE username LIKE 'user-f5711e42%'
-- );

-- 8. FIX: Force logout by clearing sessions
-- This will force the user to log out
-- Uncomment and run with the actual user_id from the queries above
-- DELETE FROM auth.sessions WHERE user_id::text = 'ACTUAL_USER_ID_HERE';
