-- Fix permissions for notifications table

-- Enable RLS if not already enabled
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow all authenticated users" ON notifications;
DROP POLICY IF EXISTS "Allow insert for authenticated" ON notifications;
DROP POLICY IF EXISTS "Allow select for authenticated" ON notifications;
DROP POLICY IF EXISTS "Allow update for authenticated" ON notifications;
DROP POLICY IF EXISTS "Allow delete for authenticated" ON notifications;

-- Create policies for authenticated users
CREATE POLICY "Allow insert for authenticated" ON notifications
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow select for authenticated" ON notifications
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow update for authenticated" ON notifications
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow delete for authenticated" ON notifications
  FOR DELETE USING (auth.role() = 'authenticated');

-- Grant permissions
GRANT ALL ON notifications TO authenticated;
GRANT SELECT ON notifications TO anon;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_actor_id ON notifications(actor_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

SELECT 'Notifications table permissions fixed' as status;
