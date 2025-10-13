import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Navigation } from '@/components/navigation';
import { EditTournamentForm } from './edit-tournament-form';

interface EditTournamentPageProps {
  params: { id: string };
}

export default async function EditTournamentPage({ params }: EditTournamentPageProps) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/connexion');
  }

  // Get tournament
  const { data: tournament } = await supabase
    .from('tournaments')
    .select('*')
    .eq('id', params.id)
    .single();

  if (!tournament) {
    notFound();
  }

  // Check if user is the organizer
  if (tournament.organizer_id !== user.id) {
    redirect(`/tournois/${params.id}`);
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('first_name, last_name')
    .eq('id', user.id)
    .single();

  return (
    <div className="min-h-screen bg-background">
      <Navigation user={user} userProfile={profile} />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Éditer le tournoi</h1>
            <p className="text-muted-foreground">
              Modifiez les informations de votre tournoi
            </p>
          </div>
          <EditTournamentForm tournament={tournament} />
        </div>
      </main>
    </div>
  );
}





