import { createClient } from '@/lib/supabase/server';

/**
 * Expire automatiquement les inscriptions non payées après 24h
 * Cette fonction peut être appelée à la demande au lieu d'utiliser un cron
 */
export async function expireUnpaidRegistrations() {
  const supabase = await createClient();
  
  try {
    // Appeler la fonction PostgreSQL pour expirer les inscriptions
    const { data, error } = await supabase.rpc('expire_unpaid_registrations');
    
    if (error) {
      console.error('Erreur lors de l\'expiration des inscriptions:', error);
      return { success: false, error: error.message, expiredCount: 0 };
    }
    
    console.log(`✅ ${data} inscriptions expirées automatiquement`);
    return { success: true, expiredCount: data, error: null };
  } catch (error: any) {
    console.error('Erreur inattendue lors de l\'expiration:', error);
    return { success: false, error: error.message, expiredCount: 0 };
  }
}

/**
 * Vérifie et expire une inscription spécifique si elle est en retard
 */
export async function checkAndExpireRegistration(registrationId: string) {
  const supabase = await createClient();
  
  try {
    // Récupérer l'inscription
    const { data: registration, error } = await supabase
      .from('registrations')
      .select('id, status, payment_deadline')
      .eq('id', registrationId)
      .single();
    
    if (error || !registration) {
      return { success: false, error: 'Inscription non trouvée' };
    }
    
    // Vérifier si elle est en retard
    if (registration.status === 'accepted_unpaid' && 
        registration.payment_deadline && 
        new Date(registration.payment_deadline) < new Date()) {
      
      // Expirer l'inscription
      const { error: updateError } = await supabase
        .from('registrations')
        .update({
          status: 'expired_unpaid',
          payment_status: 'expired',
          updated_at: new Date().toISOString(),
        })
        .eq('id', registrationId);
      
      if (updateError) {
        return { success: false, error: updateError.message };
      }
      
      return { success: true, expired: true };
    }
    
    return { success: true, expired: false };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
