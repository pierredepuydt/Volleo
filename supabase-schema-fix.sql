-- Fix for infinite recursion in RLS policies
-- Run this to DROP existing problematic policies and recreate them correctly

-- Drop existing policies that cause recursion
DROP POLICY IF EXISTS "Users can view tournaments they registered for" ON tournaments;
DROP POLICY IF EXISTS "Organizers can view all registrations for their tournaments" ON registrations;
DROP POLICY IF EXISTS "Authenticated users can create registrations" ON registrations;
DROP POLICY IF EXISTS "Organizers can update registrations for their tournaments" ON registrations;
DROP POLICY IF EXISTS "Organizers can delete registrations for their tournaments" ON registrations;

-- Recreate tournaments policies (without recursion)
CREATE POLICY "Users can view tournaments they registered for" ON tournaments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM registrations 
      WHERE registrations.tournament_id = tournaments.id 
      AND registrations.user_id = auth.uid()
    )
  );

-- Recreate registrations policies (without recursion)
CREATE POLICY "Organizers can view all registrations for their tournaments" ON registrations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM tournaments 
      WHERE tournaments.id = registrations.tournament_id 
      AND tournaments.organizer_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can create registrations" ON registrations
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM tournaments 
      WHERE tournaments.id = tournament_id 
      AND tournaments.status = 'published'
    )
  );

CREATE POLICY "Organizers can update registrations for their tournaments" ON registrations
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM tournaments 
      WHERE tournaments.id = registrations.tournament_id 
      AND tournaments.organizer_id = auth.uid()
    )
  );

CREATE POLICY "Organizers can delete registrations for their tournaments" ON registrations
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM tournaments 
      WHERE tournaments.id = registrations.tournament_id 
      AND tournaments.organizer_id = auth.uid()
    )
  );

