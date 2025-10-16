import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { HeroSection } from '@/components/hero-section';
import { StatsSection } from '@/components/stats-section';
import { TournamentSearch } from '@/components/tournament-search';
import { Suspense } from 'react';
import { TournamentSkeletonGrid } from '@/components/tournament-skeleton';

// Métadonnées SEO optimisées
export const metadata: Metadata = {
  title: 'Volleo - Plateforme de Tournois de Volleyball Indoor & Beach',
  description: 'Créez, découvrez et participez à des tournois de volleyball indoor et beach. Plateforme gratuite pour organiser vos compétitions et rejoindre une communauté de passionnés.',
  keywords: ['volleyball', 'tournoi', 'beach volley', 'volleyball indoor', 'compétition', 'sport', 'tournoi sportif'],
  authors: [{ name: 'Volleo Team' }],
  creator: 'Volleo',
  publisher: 'Volleo',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://volleo.fr'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Volleo - Plateforme de Tournois de Volleyball',
    description: 'Créez, découvrez et participez à des tournois de volleyball. Rejoignez la communauté des volleyeurs !',
    url: 'https://volleo.fr',
    siteName: 'Volleo',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=1200&h=630&auto=format&fit=crop',
        width: 1200,
        height: 630,
        alt: 'Volleo - Tournois de Volleyball',
      },
    ],
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Volleo - Plateforme de Tournois de Volleyball',
    description: 'Créez, découvrez et participez à des tournois de volleyball',
    images: ['https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=1200&h=630&auto=format&fit=crop'],
    creator: '@volleo',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
};

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
      
      <main id="main-content">
        {/* Hero Section */}
        <HeroSection user={user} />

        {/* Stats Section - Social Proof */}
        <StatsSection />

        {/* Tournaments Section with Search & Filters */}
        <section id="tournois" className="py-12 px-6 bg-gradient-to-b from-white via-blue-50/30 to-white scroll-mt-16">
          <div className="container mx-auto max-w-7xl">
            <div className="text-center mb-8">
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-3 tracking-tight">
                Tournois à venir
              </h2>
              <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
                Découvre les prochains tournois et inscris-toi en quelques clics.
                <br />
                <span className="text-blue-600 font-medium">C&apos;est gratuit et sans engagement !</span>
              </p>
            </div>
            <Suspense fallback={<TournamentSkeletonGrid count={6} />}>
              <TournamentSearch tournaments={tournaments || []} userProfile={userProfile} />
            </Suspense>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

