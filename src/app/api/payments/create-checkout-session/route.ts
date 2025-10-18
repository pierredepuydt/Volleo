import { createClient } from '@/lib/supabase/server';
import { stripe, CURRENCY } from '@/lib/stripe/server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { registrationId } = await request.json();

    if (!registrationId) {
      return NextResponse.json({ error: 'ID d\'inscription manquant' }, { status: 400 });
    }

    // Récupérer l'inscription avec les infos du tournoi
    const { data: registration, error: regError } = await supabase
      .from('registrations')
      .select(`
        *,
        tournaments (
          id,
          title,
          price,
          organizer_id
        )
      `)
      .eq('id', registrationId)
      .single();

    if (regError || !registration) {
      return NextResponse.json({ error: 'Inscription non trouvée' }, { status: 404 });
    }

    // Vérifier que l'utilisateur est bien le propriétaire de l'inscription
    if (registration.user_id !== user.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    // Vérifier que l'inscription est bien en attente de paiement
    if (registration.status !== 'accepted_unpaid') {
      return NextResponse.json(
        { error: 'Cette inscription n\'est pas en attente de paiement' },
        { status: 400 }
      );
    }

    const tournament = registration.tournaments as any;

    if (!tournament.price || tournament.price <= 0) {
      return NextResponse.json({ error: 'Ce tournoi est gratuit' }, { status: 400 });
    }

    // Vérifier que la deadline n'est pas dépassée
    if (registration.payment_deadline && new Date(registration.payment_deadline) < new Date()) {
      // Expirer l'inscription
      await supabase
        .from('registrations')
        .update({
          status: 'expired_unpaid',
          payment_status: 'expired',
        })
        .eq('id', registrationId);

      return NextResponse.json({ error: 'Le délai de paiement est expiré' }, { status: 400 });
    }

    // Créer ou réutiliser une session Stripe
    let sessionId = registration.stripe_session_id;
    let session;

    if (!sessionId) {
      // Créer une nouvelle session Stripe Checkout
      session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: CURRENCY,
              product_data: {
                name: `Inscription - ${tournament.title}`,
                description: `Inscription au tournoi: ${tournament.title}`,
                images: [], // Vous pouvez ajouter une image du tournoi
              },
              unit_amount: Math.round(tournament.price * 100), // Stripe utilise les centimes
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/tournois/${tournament.id}?payment=success`,
        cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/tournois/${tournament.id}?payment=cancelled`,
        metadata: {
          registrationId: registration.id,
          tournamentId: tournament.id,
          userId: user.id,
        },
        customer_email: registration.email,
        expires_at: Math.floor(new Date(registration.payment_deadline!).getTime() / 1000),
      });

      sessionId = session.id;

      // Enregistrer l'ID de session dans la base de données
      await supabase
        .from('registrations')
        .update({
          stripe_session_id: sessionId,
          payment_status: 'pending',
        })
        .eq('id', registrationId);
    } else {
      // Récupérer la session existante
      session = await stripe.checkout.sessions.retrieve(sessionId);
    }

    return NextResponse.json({ sessionId, url: session.url });
  } catch (error: any) {
    console.error('Erreur lors de la création de la session de paiement:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de la session de paiement', details: error.message },
      { status: 500 }
    );
  }
}

