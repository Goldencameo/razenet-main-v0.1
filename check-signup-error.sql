-- Check if Mashkz_442 username already exists
SELECT user_id, username, username_lower, created_at 
FROM profiles 
WHERE username_lower = 'mashkz_442';

-- Check if there are any auth users with emails matching the signup pattern
SELECT id, email, created_at, last_sign_in_at, raw_user_meta_data
FROM auth.users
WHERE email LIKE '%@razehub.local'
ORDER BY created_at DESC
LIMIT 10;

-- Check for any recent auth users that might be stuck
SELECT id, email, created_at, last_sign_in_at, raw_user_meta_data
FROM auth.users
ORDER BY created_at DESC
LIMIT 5;
