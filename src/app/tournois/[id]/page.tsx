import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Navigation } from '@/components/navigation';
import { TournamentDetail } from './tournament-detail';

interface TournamentPageProps {
  params: { id: string };
  searchParams: { token?: string };
}

export default async function TournamentPage({
  params,
  searchParams,
}: TournamentPageProps) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Get tournament
  const { data: tournament } = await supabase
    .from('tournaments')
    .select(`
      *,
      profiles!tournaments_organizer_id_fkey(
        id,
        first_name,
        last_name,
        email
      )
    `)
    .eq('id', params.id)
    .single();

  if (!tournament) {
    notFound();
  }

  // Check access for private tournaments
  if (!tournament.is_public) {
    const tokenFromUrl = searchParams.token;
    const isOrganizer = user?.id === tournament.organizer_id;

    if (!isOrganizer && tokenFromUrl !== tournament.access_token) {
      redirect('/?error=tournament_private');
    }
  }

  // Get user's registration and profile if logged in
  let userRegistration = null;
  let currentUserProfile = null;
  if (user) {
    const { data: registration } = await supabase
      .from('registrations')
      .select('*')
      .eq('tournament_id', params.id)
      .eq('user_id', user.id)
      .single();
    userRegistration = registration;

    // Get full user profile for pre-filling form
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    currentUserProfile = profile;
  }

  // Get all registrations for organizer
  let registrations = [];
  if (user?.id === tournament.organizer_id) {
    const { data } = await supabase
      .from('registrations')
      .select('*')
      .eq('tournament_id', params.id)
      .order('created_at', { ascending: false });
    registrations = data || [];
  }

  // Get user profile if logged in
  let userProfile = null;
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('first_name, last_name')
      .eq('id', user.id)
      .single();
    userProfile = profile;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation user={user} userProfile={userProfile} />
      <TournamentDetail
        tournament={tournament}
        user={user}
        userRegistration={userRegistration}
        registrations={registrations}
        accessToken={searchParams.token}
        currentUserProfile={currentUserProfile}
      />
    </div>
  );
}





