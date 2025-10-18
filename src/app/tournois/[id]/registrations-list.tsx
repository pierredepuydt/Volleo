'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { createClient } from '@/lib/supabase/client';
import { Check, X } from 'lucide-react';

interface Registration {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  gender: string;
  level: string;
  position: string | null;
  team_name: string | null;
  teammate_first_name: string | null;
  teammate_last_name: string | null;
  status: 'pending' | 'approved' | 'rejected' | 'waitlisted' | 'accepted_unpaid' | 'accepted_paid' | 'expired_unpaid';
  payment_status: 'pending' | 'completed' | 'failed' | 'expired' | null;
  accepted_at: string | null;
  payment_deadline: string | null;
  paid_at: string | null;
  created_at: string;
}

interface RegistrationsListProps {
  registrations: Registration[];
  tournamentId: string;
  tournamentPrice: number | null;
}

export function RegistrationsList({ registrations, tournamentId, tournamentPrice }: RegistrationsListProps) {
  const { toast } = useToast();
  const [updating, setUpdating] = useState<string | null>(null);

  const updateStatus = async (registrationId: string, status: 'approved' | 'rejected') => {
    setUpdating(registrationId);
    const supabase = createClient();

    try {
      // Debug: afficher les valeurs
      console.log('🔍 Debug updateStatus:');
      console.log('- tournamentPrice:', tournamentPrice);
      console.log('- status:', status);
      
      // Déterminer le statut final selon le prix du tournoi
      const finalStatus = status === 'approved' 
        ? (tournamentPrice && tournamentPrice > 0 ? 'accepted_unpaid' : 'approved')
        : 'rejected';

      console.log('- finalStatus:', finalStatus);

      // Préparer les données de mise à jour
      const updateData: any = { status: finalStatus };
      
      // Si c'est une acceptation avec paiement, ajouter les champs de paiement
      if (finalStatus === 'accepted_unpaid') {
        const now = new Date();
        const paymentDeadline = new Date(now.getTime() + 24 * 60 * 60 * 1000); // +24h
        
        updateData.accepted_at = now.toISOString();
        updateData.payment_deadline = paymentDeadline.toISOString();
        updateData.payment_status = 'pending';
        
        console.log('- updateData avec paiement:', updateData);
      } else {
        console.log('- updateData sans paiement:', updateData);
      }

      const { error } = await supabase
        .from('registrations')
        .update(updateData)
        .eq('id', registrationId);

      if (error) throw error;

      const message = status === 'approved' 
        ? (tournamentPrice && tournamentPrice > 0 
          ? 'Inscription acceptée - En attente de paiement (24h)'
          : 'Inscription approuvée')
        : 'Inscription refusée';

      toast({
        title: status === 'approved' ? 'Inscription acceptée' : 'Inscription refusée',
        description: message,
      });

      window.location.reload();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: error.message || 'Une erreur est survenue',
      });
    } finally {
      setUpdating(null);
    }
  };

  if (registrations.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Aucune inscription
      </div>
    );
  }

  return (
    <div className="space-y-4 mt-4">
      {registrations.map((registration) => (
        <div
          key={registration.id}
          className="border rounded-lg p-4 space-y-2"
        >
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-semibold">
                {registration.first_name} {registration.last_name}
              </h4>
              {registration.team_name && (
                <p className="text-sm text-muted-foreground">
                  Équipe: {registration.team_name}
                </p>
              )}
              {registration.teammate_first_name && (
                <p className="text-sm text-muted-foreground">
                  Avec: {registration.teammate_first_name} {registration.teammate_last_name}
                </p>
              )}
              {registration.position && (
                <p className="text-sm text-muted-foreground">
                  Poste: {registration.position}
                </p>
              )}
            </div>
            <span
              className={`text-xs px-2 py-1 rounded ${
                registration.status === 'approved'
                  ? 'bg-green-100 text-green-800'
                  : registration.status === 'accepted_paid'
                  ? 'bg-green-100 text-green-800'
                  : registration.status === 'accepted_unpaid'
                  ? 'bg-orange-100 text-orange-800'
                  : registration.status === 'expired_unpaid'
                  ? 'bg-red-100 text-red-800'
                  : registration.status === 'rejected'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}
            >
              {registration.status === 'approved'
                ? 'Approuvé'
                : registration.status === 'accepted_paid'
                ? 'Payé'
                : registration.status === 'accepted_unpaid'
                ? 'En attente de paiement'
                : registration.status === 'expired_unpaid'
                ? 'Paiement expiré'
                : registration.status === 'rejected'
                ? 'Refusé'
                : 'En attente'}
            </span>
          </div>

          <div className="text-sm text-muted-foreground space-y-1">
            <p>Email: {registration.email}</p>
            <p>Téléphone: {registration.phone}</p>
            <p>Niveau: {registration.level}</p>
            <p>Genre: {registration.gender}</p>
          </div>

          {registration.status === 'pending' && (
            <div className="flex gap-2 pt-2">
              <Button
                size="sm"
                onClick={() => updateStatus(registration.id, 'approved')}
                disabled={updating === registration.id}
              >
                <Check className="h-4 w-4 mr-1" />
                Approuver
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => updateStatus(registration.id, 'rejected')}
                disabled={updating === registration.id}
              >
                <X className="h-4 w-4 mr-1" />
                Refuser
              </Button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}





