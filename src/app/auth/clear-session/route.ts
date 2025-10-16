import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = await createClient();
    
    // Sign out de Supabase
    await supabase.auth.signOut();
    
    // Nettoyer tous les cookies
    const cookieStore = cookies();
    const allCookies = cookieStore.getAll();
    
    allCookies.forEach(cookie => {
      cookieStore.delete(cookie.name);
    });
    
    // Rediriger vers la page de connexion
    return NextResponse.redirect(new URL('/auth/connexion', process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'));
  } catch (error) {
    console.error('Error clearing session:', error);
    return NextResponse.redirect(new URL('/auth/connexion', process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'));
  }
}

