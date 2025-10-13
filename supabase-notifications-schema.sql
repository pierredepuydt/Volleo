-- Create notifications system
-- Run this in Supabase SQL Editor

-- Create notification types
CREATE TYPE notification_type AS ENUM (
  'registration_request',
  'registration_approved',
  'registration_rejected'
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  related_tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
  related_registration_id UUID REFERENCES registrations(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for better performance
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users can only see their own notifications
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own notifications
CREATE POLICY "Users can delete own notifications" ON notifications
  FOR DELETE USING (auth.uid() = user_id);

-- System can create notifications (we'll use service role for this)
CREATE POLICY "System can create notifications" ON notifications
  FOR INSERT WITH CHECK (true);

-- ============================================
-- TRIGGERS TO AUTO-CREATE NOTIFICATIONS
-- ============================================

-- Function to notify organizer of new registration
CREATE OR REPLACE FUNCTION notify_organizer_new_registration()
RETURNS TRIGGER AS $$
DECLARE
  organizer_id UUID;
  tournament_title TEXT;
  registrant_name TEXT;
BEGIN
  -- Get tournament organizer and title
  SELECT t.organizer_id, t.title INTO organizer_id, tournament_title
  FROM tournaments t
  WHERE t.id = NEW.tournament_id;

  -- Get registrant name
  registrant_name := NEW.first_name || ' ' || NEW.last_name;

  -- Create notification for organizer
  INSERT INTO notifications (
    user_id,
    type,
    title,
    message,
    link,
    related_tournament_id,
    related_registration_id
  ) VALUES (
    organizer_id,
    'registration_request',
    'Nouvelle demande d''inscription',
    registrant_name || ' souhaite s''inscrire à "' || tournament_title || '"',
    '/tournois/' || NEW.tournament_id,
    NEW.tournament_id,
    NEW.id
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger when a new registration is created
CREATE TRIGGER trigger_notify_organizer_new_registration
  AFTER INSERT ON registrations
  FOR EACH ROW
  WHEN (NEW.status = 'pending')
  EXECUTE FUNCTION notify_organizer_new_registration();

-- Function to notify user when registration status changes
CREATE OR REPLACE FUNCTION notify_user_registration_status()
RETURNS TRIGGER AS $$
DECLARE
  tournament_title TEXT;
  notification_title TEXT;
  notification_message TEXT;
  notification_type notification_type;
BEGIN
  -- Only notify on status change
  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;

  -- Get tournament title
  SELECT title INTO tournament_title
  FROM tournaments
  WHERE id = NEW.tournament_id;

  -- Determine notification content based on status
  IF NEW.status = 'approved' THEN
    notification_type := 'registration_approved';
    notification_title := 'Inscription acceptée ! 🎉';
    notification_message := 'Votre inscription à "' || tournament_title || '" a été acceptée';
  ELSIF NEW.status = 'rejected' THEN
    notification_type := 'registration_rejected';
    notification_title := 'Inscription refusée';
    notification_message := 'Votre inscription à "' || tournament_title || '" a été refusée';
  ELSE
    RETURN NEW; -- Don't notify for other status changes
  END IF;

  -- Create notification for user
  INSERT INTO notifications (
    user_id,
    type,
    title,
    message,
    link,
    related_tournament_id,
    related_registration_id
  ) VALUES (
    NEW.user_id,
    notification_type,
    notification_title,
    notification_message,
    '/tournois/' || NEW.tournament_id,
    NEW.tournament_id,
    NEW.id
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger when registration status changes
CREATE TRIGGER trigger_notify_user_registration_status
  AFTER UPDATE ON registrations
  FOR EACH ROW
  EXECUTE FUNCTION notify_user_registration_status();

