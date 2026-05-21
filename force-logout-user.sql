-- Force logout for the bugged account
-- This will clear all sessions for the user with the wrong username

-- First, get the user_id of the bugged account
SELECT user_id, username FROM profiles WHERE username LIKE 'user-f5711e42%';

-- Then delete all sessions for that user_id
-- Replace 'ACTUAL_USER_ID_HERE' with the user_id from the query above
-- DELETE FROM auth.sessions WHERE user_id = 'ACTUAL_USER_ID_HERE';

-- Alternative: Delete the entire bugged account (WARNING: irreversible)
-- This will delete the profile and auth user
-- DELETE FROM profiles WHERE username LIKE 'user-f5711e42%';
-- The auth user will be cascade deleted due to ON DELETE CASCADE
