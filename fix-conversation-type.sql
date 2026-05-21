-- Check current enum type
SELECT enumlabel FROM pg_enum WHERE enumtypid = (
  SELECT oid FROM pg_type WHERE typname = 'conversation_type'
);

-- Add discussion type if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type 
    WHERE typname = 'conversation_type' 
    AND typtype = 'e'
  ) THEN
    ALTER TYPE conversation_type_enum ADD VALUE 'discussion';
  END IF;
END $$;
