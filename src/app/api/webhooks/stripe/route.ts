import { stripe } from '@/lib/stripe/server';
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export const dynamic = 'force-dynamic';

// Désactiver le parsing automatique du body pour les webhooks Stripe
export const runtime = 'nodejs';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // Clé service role pour bypass RLS
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Signature manquante' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error('❌ Erreur de vérification de signature webhook:', err.message);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  console.log('✅ Webhook Stripe reçu:', event.type);

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutSessionCompleted(session);
        break;
      }

      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutSessionExpired(session);
        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentIntentSucceeded(paymentIntent);
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentIntentFailed(paymentIntent);
        break;
      }

      default:
        console.log(`Event non géré: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Erreur lors du traitement du webhook:', error);
    return NextResponse.json(
      { error: 'Erreur lors du traitement du webhook', details: error.message },
      { status: 500 }
    );
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  console.log('💰 Paiement complété pour la session:', session.id);

  const registrationId = session.metadata?.registrationId;

  if (!registrationId) {
    console.error('❌ ID d\'inscription manquant dans les métadonnées');
    return;
  }

  const { error } = await supabaseAdmin
    .from('registrations')
    .update({
      status: 'accepted_paid',
      payment_status: 'completed',
      stripe_payment_intent_id: session.payment_intent as string,
      paid_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', registrationId);

  if (error) {
    console.error('❌ Erreur lors de la mise à jour de l\'inscription:', error);
    throw error;
  }

  console.log('✅ Inscription mise à jour: accepted_paid');

  // TODO: Envoyer un email de confirmation
}

async function handleCheckoutSessionExpired(session: Stripe.Checkout.Session) {
  console.log('⏰ Session expirée:', session.id);

  const registrationId = session.metadata?.registrationId;

  if (!registrationId) {
    console.error('❌ ID d\'inscription manquant dans les métadonnées');
    return;
  }

  const { error } = await supabaseAdmin
    .from('registrations')
    .update({
      status: 'expired_unpaid',
      payment_status: 'expired',
      updated_at: new Date().toISOString(),
    })
    .eq('id', registrationId)
    .eq('status', 'accepted_unpaid'); // Seulement si toujours en attente

  if (error) {
    console.error('❌ Erreur lors de l\'expiration de l\'inscription:', error);
    throw error;
  }

  console.log('✅ Inscription expirée');

  // TODO: Envoyer un email d'expiration
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  console.log('✅ PaymentIntent réussi:', paymentIntent.id);
  // La logique principale est gérée dans checkout.session.completed
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  console.log('❌ PaymentIntent échoué:', paymentIntent.id);

  // Chercher l'inscription associée via le payment_intent_id
  const { data: registration } = await supabaseAdmin
    .from('registrations')
    .select('*')
    .eq('stripe_payment_intent_id', paymentIntent.id)
    .single();

  if (registration) {
    await supabaseAdmin
      .from('registrations')
      .update({
        payment_status: 'failed',
        updated_at: new Date().toISOString(),
      })
      .eq('id', registration.id);

    console.log('✅ Statut de paiement mis à jour: failed');
  }

  // TODO: Envoyer un email d'échec de paiement avec possibilité de réessayer
}

