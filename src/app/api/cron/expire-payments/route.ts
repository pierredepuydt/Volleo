import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Créer un client Supabase avec la clé service role pour bypass RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

/**
 * Route pour expirer automatiquement les inscriptions non payées après 24h
 * 
 * Cette route doit être appelée par un cron job (ex: Vercel Cron, GitHub Actions)
 * Protection: Utiliser un secret dans les headers ou Vercel Cron
 */
export async function GET(request: Request) {
  try {
    // Vérification de sécurité: vérifier un secret dans les headers
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    console.log('🔄 Début de l\'expiration des paiements...');

    // Récupérer toutes les inscriptions en attente de paiement dont la deadline est dépassée
    const { data: expiredRegistrations, error: fetchError } = await supabaseAdmin
      .from('registrations')
      .select('id, tournament_id, first_name, last_name, email, payment_deadline')
      .eq('status', 'accepted_unpaid')
      .eq('payment_status', 'pending')
      .lt('payment_deadline', new Date().toISOString());

    if (fetchError) {
      console.error('❌ Erreur lors de la récupération des inscriptions:', fetchError);
      throw fetchError;
    }

    if (!expiredRegistrations || expiredRegistrations.length === 0) {
      console.log('✅ Aucune inscription à expirer');
      return NextResponse.json({
        success: true,
        expired: 0,
        message: 'Aucune inscription à expirer',
      });
    }

    console.log(`📋 ${expiredRegistrations.length} inscription(s) à expirer`);

    // Expirer toutes ces inscriptions
    const { error: updateError } = await supabaseAdmin
      .from('registrations')
      .update({
        status: 'expired_unpaid',
        payment_status: 'expired',
        updated_at: new Date().toISOString(),
      })
      .in(
        'id',
        expiredRegistrations.map((r) => r.id)
      );

    if (updateError) {
      console.error('❌ Erreur lors de l\'expiration des inscriptions:', updateError);
      throw updateError;
    }

    console.log(`✅ ${expiredRegistrations.length} inscription(s) expirée(s) avec succès`);

    // TODO: Envoyer des emails de notification aux utilisateurs concernés
    // Pour chaque inscription expirée, envoyer un email

    return NextResponse.json({
      success: true,
      expired: expiredRegistrations.length,
      registrations: expiredRegistrations.map((r) => ({
        id: r.id,
        email: r.email,
        name: `${r.first_name} ${r.last_name}`,
        deadline: r.payment_deadline,
      })),
    });
  } catch (error: any) {
    console.error('❌ Erreur lors de l\'expiration des paiements:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de l\'expiration des paiements',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  // Permettre aussi POST pour compatibilité avec certains cron services
  return GET(request);
}

