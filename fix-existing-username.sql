-- First, let's check what accounts exist with the username Mashkz_442
SELECT user_id, username, username_lower, display_name, email, created_at 
FROM profiles 
WHERE username_lower = 'mashkz_442' OR username LIKE 'Mashkz_442';

-- Check for the account with the wrong username (user-f5711e42-f168-40d1-8992-24e01fcd116b)
SELECT user_id, username, username_lower, display_name, email, created_at 
FROM profiles 
WHERE username LIKE 'user-f5711e42%';

-- If the account with wrong username exists and Mashkz_442 is already taken by someone else,
-- we need to either:
-- 1. Delete the wrong account and recreate it with the correct username
-- 2. Or use a different username

-- OPTION 1: Delete the wrong account and let the friend recreate it
-- WARNING: This will delete all data for this account!
-- Uncomment and run ONLY if you're sure this is the wrong account:
-- DELETE FROM profiles WHERE username LIKE 'user-f5711e42%';
-- Then the friend can sign up again with username Mashkz_442

-- OPTION 2: Update the wrong account to a different username (if Mashkz_442 is taken by someone else)
-- Replace 'Mashkz_442_New' with the desired username
-- UPDATE profiles 
-- SET username = 'Mashkz_442_New', 
--     username_lower = 'mashkz_442_new',
--     display_name = 'Mashkz_442_New'
-- WHERE username LIKE 'user-f5711e42%';

-- OPTION 3: If Mashkz_442 is the friend's actual account but they can't access it,
-- we might need to reset their password or help them recover access
-- Check if there's an auth user for this profile:
-- SELECT id, email, created_at FROM auth.users 
-- WHERE id IN (SELECT user_id FROM profiles WHERE username_lower = 'mashkz_442');
