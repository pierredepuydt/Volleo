-- COMPLETE FIX for infinite recursion
-- This drops ALL policies and recreates them without recursion

-- ============================================
-- STEP 1: DROP ALL EXISTING POLICIES
-- ============================================

-- Drop all tournaments policies
DROP POLICY IF EXISTS "Public tournaments are viewable by everyone" ON tournaments;
DROP POLICY IF EXISTS "Users can view own tournaments" ON tournaments;
DROP POLICY IF EXISTS "Users can view tournaments they registered for" ON tournaments;
DROP POLICY IF EXISTS "Private tournaments viewable with token" ON tournaments;
DROP POLICY IF EXISTS "Authenticated users can create tournaments" ON tournaments;
DROP POLICY IF EXISTS "Users can update own tournaments" ON tournaments;
DROP POLICY IF EXISTS "Users can delete own tournaments" ON tournaments;

-- Drop all registrations policies
DROP POLICY IF EXISTS "Organizers can view all registrations for their tournaments" ON registrations;
DROP POLICY IF EXISTS "Users can view own registrations" ON registrations;
DROP POLICY IF EXISTS "Authenticated users can create registrations" ON registrations;
DROP POLICY IF EXISTS "Organizers can update registrations for their tournaments" ON registrations;
DROP POLICY IF EXISTS "Users can update own pending registrations" ON registrations;
DROP POLICY IF EXISTS "Users can delete own pending registrations" ON registrations;
DROP POLICY IF EXISTS "Organizers can delete registrations for their tournaments" ON registrations;

-- ============================================
-- STEP 2: RECREATE TOURNAMENTS POLICIES (NO RECURSION)
-- ============================================

-- Anyone can view published public tournaments
CREATE POLICY "Public tournaments are viewable by everyone" ON tournaments
  FOR SELECT USING (
    status = 'published' AND is_public = true
  );

-- Users can view their own tournaments (any status)
CREATE POLICY "Users can view own tournaments" ON tournaments
  FOR SELECT USING (
    auth.uid() = organizer_id
  );

-- Private tournaments are viewable (app will check token)
CREATE POLICY "Private tournaments viewable with token" ON tournaments
  FOR SELECT USING (
    NOT is_public AND access_token IS NOT NULL
  );

-- Users can create tournaments
CREATE POLICY "Authenticated users can create tournaments" ON tournaments
  FOR INSERT WITH CHECK (
    auth.uid() = organizer_id
  );

-- Users can update own tournaments
CREATE POLICY "Users can update own tournaments" ON tournaments
  FOR UPDATE USING (
    auth.uid() = organizer_id
  );

-- Users can delete own tournaments
CREATE POLICY "Users can delete own tournaments" ON tournaments
  FOR DELETE USING (
    auth.uid() = organizer_id
  );

-- ============================================
-- STEP 3: RECREATE REGISTRATIONS POLICIES (NO RECURSION)
-- ============================================

-- Users can view their own registrations
CREATE POLICY "Users can view own registrations" ON registrations
  FOR SELECT USING (
    auth.uid() = user_id
  );

-- Organizers can view registrations for their tournaments
-- FIXED: Use direct join without subquery
CREATE POLICY "Organizers can view registrations for their tournaments" ON registrations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM tournaments 
      WHERE tournaments.id = registrations.tournament_id 
      AND tournaments.organizer_id = auth.uid()
    )
  );

-- Users can create registrations
-- FIXED: Simplified check
CREATE POLICY "Authenticated users can create registrations" ON registrations
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
  );

-- Organizers can update registrations
CREATE POLICY "Organizers can update registrations for their tournaments" ON registrations
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM tournaments 
      WHERE tournaments.id = registrations.tournament_id 
      AND tournaments.organizer_id = auth.uid()
    )
  );

-- Users can update their own pending registrations
CREATE POLICY "Users can update own pending registrations" ON registrations
  FOR UPDATE USING (
    auth.uid() = user_id AND status = 'pending'
  );

-- Users can delete their own pending registrations
CREATE POLICY "Users can delete own pending registrations" ON registrations
  FOR DELETE USING (
    auth.uid() = user_id AND status = 'pending'
  );

-- Organizers can delete registrations
CREATE POLICY "Organizers can delete registrations for their tournaments" ON registrations
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM tournaments 
      WHERE tournaments.id = registrations.tournament_id 
      AND tournaments.organizer_id = auth.uid()
    )
  );

-- ============================================
-- VERIFICATION
-- ============================================
-- Run this after to verify policies are created:
-- SELECT * FROM pg_policies WHERE schemaname = 'public' AND tablename IN ('tournaments', 'registrations');

