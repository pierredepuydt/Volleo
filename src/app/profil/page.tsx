import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Navigation } from '@/components/navigation';
import { ProfileForm } from './profile-form';

export const metadata = {
  title: 'Mon Profil | Volleyball Tournament Manager',
};

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/connexion');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return (
    <div className="min-h-screen bg-background">
      <Navigation user={user} userProfile={profile} />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Mon Profil</h1>
            <p className="text-muted-foreground">
              Gérez vos informations personnelles
            </p>
          </div>
          <ProfileForm profile={profile} userId={user.id} />
        </div>
      </main>
    </div>
  );
}





