-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE tournament_variant AS ENUM ('indoor_6x6', 'beach_2x2');
CREATE TYPE tournament_category AS ENUM ('mixed', 'men', 'women');
CREATE TYPE tournament_level AS ENUM ('beginner', 'intermediate', 'advanced');
CREATE TYPE registration_mode AS ENUM ('team', 'solo', 'solo_positional', 'team_or_solo');
CREATE TYPE tournament_status AS ENUM ('draft', 'published', 'ongoing', 'completed', 'cancelled');
CREATE TYPE registration_status AS ENUM ('pending', 'approved', 'rejected', 'waitlisted');
CREATE TYPE gender_type AS ENUM ('male', 'female', 'other');
CREATE TYPE position_type AS ENUM ('setter', 'middle', 'outside', 'opposite', 'libero');

-- Create profiles table (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  gender gender_type,
  level tournament_level,
  city TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create tournaments table
CREATE TABLE tournaments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organizer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  variant tournament_variant NOT NULL,
  category tournament_category NOT NULL,
  level tournament_level NOT NULL,
  registration_mode registration_mode NOT NULL,
  max_teams INTEGER,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  registration_deadline TIMESTAMPTZ NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  postal_code TEXT,
  country TEXT NOT NULL DEFAULT 'France',
  is_public BOOLEAN DEFAULT TRUE,
  access_token TEXT UNIQUE,
  status tournament_status DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create registrations table
CREATE TABLE registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status registration_status DEFAULT 'pending',
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  gender gender_type NOT NULL,
  level tournament_level NOT NULL,
  position position_type,
  team_name TEXT,
  teammate_first_name TEXT,
  teammate_last_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tournament_id, user_id)
);

-- Create indexes for better performance
CREATE INDEX idx_tournaments_organizer ON tournaments(organizer_id);
CREATE INDEX idx_tournaments_status ON tournaments(status);
CREATE INDEX idx_tournaments_city ON tournaments(city);
CREATE INDEX idx_tournaments_level ON tournaments(level);
CREATE INDEX idx_tournaments_variant ON tournaments(variant);
CREATE INDEX idx_tournaments_is_public ON tournaments(is_public);
CREATE INDEX idx_tournaments_start_date ON tournaments(start_date);
CREATE INDEX idx_registrations_tournament ON registrations(tournament_id);
CREATE INDEX idx_registrations_user ON registrations(user_id);
CREATE INDEX idx_registrations_status ON registrations(status);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tournaments_updated_at BEFORE UPDATE ON tournaments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_registrations_updated_at BEFORE UPDATE ON registrations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Row Level Security (RLS) Policies

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Tournaments policies
-- Anyone can view published public tournaments
CREATE POLICY "Public tournaments are viewable by everyone" ON tournaments
  FOR SELECT USING (
    status = 'published' AND is_public = true
  );

-- Users can view their own tournaments (any status)
CREATE POLICY "Users can view own tournaments" ON tournaments
  FOR SELECT USING (auth.uid() = organizer_id);

-- Users can view tournaments they're registered for
CREATE POLICY "Users can view tournaments they registered for" ON tournaments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM registrations 
      WHERE registrations.tournament_id = tournaments.id 
      AND registrations.user_id = auth.uid()
    )
  );

-- Users can view private tournaments with valid access token (handled in app logic)
CREATE POLICY "Private tournaments viewable with token" ON tournaments
  FOR SELECT USING (
    NOT is_public AND access_token IS NOT NULL
  );

-- Users can create tournaments
CREATE POLICY "Authenticated users can create tournaments" ON tournaments
  FOR INSERT WITH CHECK (auth.uid() = organizer_id);

-- Users can update own tournaments
CREATE POLICY "Users can update own tournaments" ON tournaments
  FOR UPDATE USING (auth.uid() = organizer_id);

-- Users can delete own tournaments
CREATE POLICY "Users can delete own tournaments" ON tournaments
  FOR DELETE USING (auth.uid() = organizer_id);

-- Registrations policies
-- Users can view registrations for tournaments they organize
CREATE POLICY "Organizers can view all registrations for their tournaments" ON registrations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM tournaments 
      WHERE tournaments.id = registrations.tournament_id 
      AND tournaments.organizer_id = auth.uid()
    )
  );

-- Users can view their own registrations
CREATE POLICY "Users can view own registrations" ON registrations
  FOR SELECT USING (auth.uid() = user_id);

-- Users can create registrations for published tournaments
CREATE POLICY "Authenticated users can create registrations" ON registrations
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM tournaments 
      WHERE tournaments.id = tournament_id 
      AND tournaments.status = 'published'
    )
  );

-- Organizers can update registrations for their tournaments
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

-- Organizers can delete registrations for their tournaments
CREATE POLICY "Organizers can delete registrations for their tournaments" ON registrations
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM tournaments 
      WHERE tournaments.id = registrations.tournament_id 
      AND tournaments.organizer_id = auth.uid()
    )
  );





