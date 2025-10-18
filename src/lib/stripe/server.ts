import Stripe from 'stripe';

// Utiliser une clé factice pendant le build si STRIPE_SECRET_KEY n'est pas définie
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder';

if (!process.env.STRIPE_SECRET_KEY && process.env.NODE_ENV !== 'production') {
  console.warn('⚠️  STRIPE_SECRET_KEY not defined - using placeholder for build');
}

export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2025-09-30.clover',
  typescript: true,
});

export const CURRENCY = 'eur';

