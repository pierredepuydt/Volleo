import { createClient } from '@/lib/supabase/server';
import { Navigation } from '@/components/navigation';
import { TournamentList } from '@/components/tournament-list';
import { Footer } from '@/components/footer';
import { HeroSection } from '@/components/hero-section';

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Get user profile if logged in
  let userProfile = null;
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    userProfile = profile;
  }

  // Get published public tournaments
  const { data: tournaments } = await supabase
    .from('tournaments')
    .select('*, profiles!tournaments_organizer_id_fkey(first_name, last_name)')
    .eq('status', 'published')
    .eq('is_public', true)
    .gte('start_date', new Date().toISOString())
    .order('start_date', { ascending: true });

  return (
    <div className="min-h-screen bg-white">
      <Navigation user={user} userProfile={userProfile} />
      
      <main>
        <HeroSection user={user} />

        {/* Tournaments Section */}
        <section className="py-20 px-6 bg-gradient-to-b from-white to-slate-50">
          <div className="container mx-auto max-w-7xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                Tournois à venir
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Découvre les prochains tournois et inscris-toi en quelques clics
              </p>
            </div>
            <TournamentList tournaments={tournaments || []} userProfile={userProfile} />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

