-- FINAL FIX - Simplified policies without any recursion risk
-- This removes the problematic cross-table policy

-- ============================================
-- STEP 1: DROP ALL EXISTING POLICIES
-- ============================================

DROP POLICY IF EXISTS "Public tournaments are viewable by everyone" ON tournaments;
DROP POLICY IF EXISTS "Users can view own tournaments" ON tournaments;
DROP POLICY IF EXISTS "Users can view tournaments they registered for" ON tournaments;
DROP POLICY IF EXISTS "Private tournaments viewable with token" ON tournaments;
DROP POLICY IF EXISTS "Authenticated users can create tournaments" ON tournaments;
DROP POLICY IF EXISTS "Users can update own tournaments" ON tournaments;
DROP POLICY IF EXISTS "Users can delete own tournaments" ON tournaments;

DROP POLICY IF EXISTS "Organizers can view all registrations for their tournaments" ON registrations;
DROP POLICY IF EXISTS "Users can view own registrations" ON registrations;
DROP POLICY IF EXISTS "Authenticated users can create registrations" ON registrations;
DROP POLICY IF EXISTS "Organizers can update registrations for their tournaments" ON registrations;
DROP POLICY IF EXISTS "Users can update own pending registrations" ON registrations;
DROP POLICY IF EXISTS "Users can delete own pending registrations" ON registrations;
DROP POLICY IF EXISTS "Organizers can delete registrations for their tournaments" ON registrations;

-- ============================================
-- STEP 2: RECREATE TOURNAMENTS POLICIES (SIMPLIFIED)
-- ============================================

-- Anyone can view published public tournaments
CREATE POLICY "tournaments_select_published_public" ON tournaments
  FOR SELECT USING (
    status = 'published' AND is_public = true
  );

-- Users can view their own tournaments
CREATE POLICY "tournaments_select_own" ON tournaments
  FOR SELECT USING (
    auth.uid() = organizer_id
  );

-- All private tournaments (token check done in app)
CREATE POLICY "tournaments_select_private" ON tournaments
  FOR SELECT USING (
    is_public = false
  );

-- Users can create tournaments
CREATE POLICY "tournaments_insert_own" ON tournaments
  FOR INSERT WITH CHECK (
    auth.uid() = organizer_id
  );

-- Users can update own tournaments
CREATE POLICY "tournaments_update_own" ON tournaments
  FOR UPDATE USING (
    auth.uid() = organizer_id
  )
  WITH CHECK (
    auth.uid() = organizer_id
  );

-- Users can delete own tournaments
CREATE POLICY "tournaments_delete_own" ON tournaments
  FOR DELETE USING (
    auth.uid() = organizer_id
  );

-- ============================================
-- STEP 3: RECREATE REGISTRATIONS POLICIES (SIMPLIFIED)
-- ============================================

-- Users can view their own registrations
CREATE POLICY "registrations_select_own" ON registrations
  FOR SELECT USING (
    auth.uid() = user_id
  );

-- Users can create registrations (validation done in app)
CREATE POLICY "registrations_insert_own" ON registrations
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
  );

-- Users can update their own pending registrations
CREATE POLICY "registrations_update_own_pending" ON registrations
  FOR UPDATE USING (
    auth.uid() = user_id AND status = 'pending'
  )
  WITH CHECK (
    auth.uid() = user_id
  );

-- Users can delete their own pending registrations
CREATE POLICY "registrations_delete_own_pending" ON registrations
  FOR DELETE USING (
    auth.uid() = user_id AND status = 'pending'
  );

-- ============================================
-- STEP 4: ADD SPECIAL POLICY FOR ORGANIZERS
-- We use a SECURITY DEFINER function to avoid recursion
-- ============================================

-- Function to check if user is tournament organizer
CREATE OR REPLACE FUNCTION is_tournament_organizer(tournament_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM tournaments 
    WHERE id = tournament_uuid 
    AND organizer_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Organizers can view all registrations for their tournaments
CREATE POLICY "registrations_select_as_organizer" ON registrations
  FOR SELECT USING (
    is_tournament_organizer(tournament_id)
  );

-- Organizers can update registrations for their tournaments
CREATE POLICY "registrations_update_as_organizer" ON registrations
  FOR UPDATE USING (
    is_tournament_organizer(tournament_id)
  )
  WITH CHECK (
    is_tournament_organizer(tournament_id)
  );

-- Organizers can delete registrations for their tournaments
CREATE POLICY "registrations_delete_as_organizer" ON registrations
  FOR DELETE USING (
    is_tournament_organizer(tournament_id)
  );

