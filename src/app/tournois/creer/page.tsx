import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Navigation } from '@/components/navigation';
import { CreateTournamentForm } from './create-tournament-form';

export const metadata = {
  title: 'Créer un tournoi | Volleyball Tournament Manager',
};

export default async function CreateTournamentPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/connexion');
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
            <h1 className="text-3xl font-bold mb-2">Créer un tournoi</h1>
            <p className="text-muted-foreground">
              Remplissez les informations ci-dessous pour créer votre tournoi de volleyball.
            </p>
          </div>
          <CreateTournamentForm userId={user.id} />
        </div>
      </main>
    </div>
  );
}





