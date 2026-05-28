-- Check the actual schema of the games table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'games'
  AND table_schema = 'public'
ORDER BY ordinal_position;
