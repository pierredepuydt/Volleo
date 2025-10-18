import { NextResponse } from 'next/server';
import { expireUnpaidRegistrations } from '@/lib/payment-utils';

export const dynamic = 'force-dynamic';

/**
 * API route pour expirer manuellement les inscriptions non payées
 * Peut être appelée par un service externe ou manuellement
 */
export async function POST(request: Request) {
  try {
    // Optionnel : vérifier une clé secrète pour sécuriser l'endpoint
    const authHeader = request.headers.get('Authorization');
    const expectedSecret = process.env.CRON_SECRET;
    
    if (expectedSecret && authHeader !== `Bearer ${expectedSecret}`) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
    
    const result = await expireUnpaidRegistrations();
    
    if (result.success) {
      return NextResponse.json({ 
        message: `Expiration réussie: ${result.expiredCount} inscriptions expirées`,
        expiredCount: result.expiredCount 
      });
    } else {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Erreur lors de l\'expiration des paiements:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * GET pour tester l'endpoint (développement uniquement)
 */
export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Non disponible en production' }, { status: 404 });
  }
  
  const result = await expireUnpaidRegistrations();
  return NextResponse.json(result);
}
