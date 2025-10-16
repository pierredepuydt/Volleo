'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CreditCard, Clock, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface PaymentBannerProps {
  registration: {
    id: string;
    status: string;
    payment_status: string | null;
    payment_deadline: string | null;
    accepted_at: string | null;
  };
  tournamentPrice: number;
  tournamentTitle: string;
}

export function PaymentBanner({ registration, tournamentPrice, tournamentTitle }: PaymentBannerProps) {
  const { toast } = useToast();
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [isExpired, setIsExpired] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Calculer le temps restant
  useEffect(() => {
    if (!registration.payment_deadline) return;

    const updateTimeLeft = () => {
      const now = new Date().getTime();
      const deadline = new Date(registration.payment_deadline!).getTime();
      const difference = deadline - now;

      if (difference <= 0) {
        setIsExpired(true);
        setTimeLeft('Expiré');
        return;
      }

      const hours = Math.floor(difference / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
    };

    updateTimeLeft();
    const interval = setInterval(updateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [registration.payment_deadline]);

  const handlePayment = async () => {
    setIsLoading(true);

    try {
      // Créer une session de paiement
      const response = await fetch('/api/payments/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          registrationId: registration.id,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de la création de la session de paiement');
      }

      const { url } = await response.json();

      if (!url) {
        throw new Error('URL de paiement non reçue');
      }

      // Rediriger vers Stripe Checkout
      window.location.href = url;
    } catch (error: any) {
      console.error('Erreur lors du paiement:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: error.message || 'Une erreur est survenue lors du paiement',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Inscription payée
  if (registration.status === 'accepted_paid') {
    return (
      <Alert className="border-green-200 bg-green-50">
        <CheckCircle2 className="h-5 w-5 text-green-600" />
        <AlertTitle className="text-green-900 font-semibold">Participation confirmée</AlertTitle>
        <AlertDescription className="text-green-800">
          Votre paiement a été confirmé. Vous êtes inscrit au tournoi !
        </AlertDescription>
      </Alert>
    );
  }

  // Inscription expirée
  if (registration.status === 'expired_unpaid' || isExpired) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <XCircle className="h-5 w-5 text-red-600" />
        <AlertTitle className="text-red-900 font-semibold">Inscription expirée</AlertTitle>
        <AlertDescription className="text-red-800">
          Le délai de paiement de 24 heures est dépassé. Votre inscription a été annulée.
          <br />
          Vous pouvez faire une nouvelle demande d&apos;inscription si des places sont disponibles.
        </AlertDescription>
      </Alert>
    );
  }

  // Paiement échoué
  if (registration.payment_status === 'failed') {
    return (
      <Alert className="border-orange-200 bg-orange-50">
        <AlertTriangle className="h-5 w-5 text-orange-600" />
        <AlertTitle className="text-orange-900 font-semibold">Échec du paiement</AlertTitle>
        <AlertDescription className="text-orange-800">
          Le paiement a échoué. Veuillez réessayer avant l&apos;expiration du délai.
        </AlertDescription>
        <div className="mt-4">
          <Button
            onClick={handlePayment}
            disabled={isLoading}
            className="bg-orange-600 hover:bg-orange-700"
          >
            <CreditCard className="h-4 w-4 mr-2" />
            {isLoading ? 'Chargement...' : 'Réessayer le paiement'}
          </Button>
        </div>
      </Alert>
    );
  }

  // Inscription acceptée, en attente de paiement
  if (registration.status === 'accepted_unpaid') {
    return (
      <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50 shadow-lg">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-start gap-3 mb-4">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-blue-900 mb-1">
                    Paiement requis
                  </h3>
                  <p className="text-sm text-blue-800">
                    Votre inscription a été acceptée ! Payez maintenant pour confirmer votre participation.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                  <span className="text-sm font-medium text-slate-700">Montant à payer</span>
                  <span className="text-xl font-bold text-blue-600">
                    {tournamentPrice.toFixed(2)} €
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                  <span className="text-sm font-medium text-slate-700">Temps restant</span>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-orange-500" />
                    <span className={`text-lg font-bold ${isExpired ? 'text-red-600' : 'text-orange-600'}`}>
                      {timeLeft}
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-blue-700 mt-4">
                ⚠️ Vous avez 24 heures après acceptation pour effectuer le paiement.
                Passé ce délai, votre inscription sera annulée.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <Button
                onClick={handlePayment}
                disabled={isLoading || isExpired}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md h-14"
              >
                <CreditCard className="h-5 w-5 mr-2" />
                {isLoading ? 'Chargement...' : 'Payer maintenant'}
              </Button>
              
              <p className="text-xs text-center text-slate-500">
                Paiement sécurisé par Stripe
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}

