import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Navigation } from '@/components/navigation';
import { MyTournamentsContent } from './my-tournaments-content';

export const metadata = {
  title: 'Mes Tournois | Volleyball Tournament Manager',
};

export default async function MyTournamentsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/connexion');
  }

  // Get tournaments created by user
  const { data: createdTournaments } = await supabase
    .from('tournaments')
    .select('*')
    .eq('organizer_id', user.id)
    .order('created_at', { ascending: false });

  // Get tournaments user is registered for
  const { data: registrations } = await supabase
    .from('registrations')
    .select(`
      *,
      tournaments (*)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  // Separate by status
  const drafts = createdTournaments?.filter((t) => t.status === 'draft') || [];
  const published = createdTournaments?.filter((t) => t.status === 'published') || [];
  const ongoing = createdTournaments?.filter((t) => t.status === 'ongoing') || [];
  const completed = createdTournaments?.filter((t) => t.status === 'completed') || [];

  // Registrations
  const approvedRegistrations =
    registrations?.filter((r) => r.status === 'approved') || [];
  const pendingRegistrations =
    registrations?.filter((r) => r.status === 'pending') || [];

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
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Mes Tournois</h1>
            <p className="text-muted-foreground">
              Gérez vos tournois créés et consultez vos inscriptions
            </p>
          </div>

          <MyTournamentsContent
            drafts={drafts}
            published={published}
            ongoing={ongoing}
            completed={completed}
            approvedRegistrations={approvedRegistrations}
            pendingRegistrations={pendingRegistrations}
          />
        </div>
      </main>
    </div>
  );
}





