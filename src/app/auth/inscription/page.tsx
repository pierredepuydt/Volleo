import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { SignupForm } from './signup-form';

export const metadata: Metadata = {
  title: 'Inscription | Volleyball Tournament Manager',
};

export default async function SignupPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    redirect('/');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 px-4 py-8">
      <div className="w-full max-w-md">
        <SignupForm />
      </div>
    </div>
  );
}





