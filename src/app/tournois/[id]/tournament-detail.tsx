'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, MapPin, Users, Trophy, Clock, Share2, Edit } from 'lucide-react';
import {
  TOURNAMENT_VARIANTS,
  TOURNAMENT_CATEGORIES,
  TOURNAMENT_LEVELS,
  REGISTRATION_MODES,
  TOURNAMENT_STATUS,
} from '@/lib/constants';
import { RegistrationForm } from './registration-form';
import { RegistrationsList } from './registrations-list';
import { useToast } from '@/components/ui/use-toast';
import { PaymentBanner } from '@/components/payment-banner';

interface TournamentDetailProps {
  tournament: any;
  user: any;
  userRegistration: any;
  registrations: any[];
  accessToken?: string;
  currentUserProfile?: any;
}

export function TournamentDetail({
  tournament,
  user,
  userRegistration,
  registrations,
  accessToken,
  currentUserProfile,
}: TournamentDetailProps) {
  const { toast } = useToast();
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const isOrganizer = user?.id === tournament.organizer_id;
  const canRegister =
    user &&
    !isOrganizer &&
    !userRegistration &&
    tournament.status === 'published' &&
    new Date(tournament.registration_deadline) > new Date();
  
  // Show login/signup prompt for non-logged users when registration is open
  const shouldShowAuthPrompt =
    !user &&
    tournament.status === 'published' &&
    new Date(tournament.registration_deadline) > new Date();

  const handleShare = async () => {
    const url = tournament.is_public
      ? `${window.location.origin}/tournois/${tournament.id}`
      : `${window.location.origin}/tournois/${tournament.id}?token=${tournament.access_token}`;

    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: 'Lien copié !',
        description: 'Le lien du tournoi a été copié dans le presse-papier',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de copier le lien',
      });
    }
  };

  const organizerName =
    tournament.profiles?.first_name && tournament.profiles?.last_name
      ? `${tournament.profiles.first_name} ${tournament.profiles.last_name}`
      : tournament.profiles?.email || 'Organisateur';

  const formattedStartDate = new Date(tournament.start_date).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const formattedEndDate = new Date(tournament.end_date).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const formattedDeadline = new Date(tournament.registration_deadline).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="flex gap-2 mb-3">
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-primary/10 text-primary">
                  {TOURNAMENT_VARIANTS[tournament.variant as keyof typeof TOURNAMENT_VARIANTS]}
                </span>
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-secondary">
                  {TOURNAMENT_LEVELS[tournament.level as keyof typeof TOURNAMENT_LEVELS]}
                </span>
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-secondary">
                  {TOURNAMENT_STATUS[tournament.status as keyof typeof TOURNAMENT_STATUS]}
                </span>
                {!tournament.is_public && (
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-yellow-100 text-yellow-800">
                    Privé
                  </span>
                )}
              </div>
              <h1 className="text-4xl font-bold mb-2">{tournament.title}</h1>
              <p className="text-muted-foreground">Organisé par {organizerName}</p>
            </div>
            <div className="flex gap-2">
              {isOrganizer && (
                <Link href={`/tournois/${tournament.id}/editer`}>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    Éditer
                  </Button>
                </Link>
              )}
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Partager
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>À propos du tournoi</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">
                  {tournament.description || 'Aucune description fournie.'}
                </p>
              </CardContent>
            </Card>

            {/* Auth prompt for non-logged users */}
            {shouldShowAuthPrompt && (
              <Card className="border-primary bg-primary/5">
                <CardHeader>
                  <CardTitle>Rejoignez-nous pour participer !</CardTitle>
                  <CardDescription>
                    Connectez-vous ou créez un compte pour vous inscrire à ce tournoi
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Link href="/auth/connexion" className="flex-1">
                      <Button variant="default" className="w-full">
                        Se connecter
                      </Button>
                    </Link>
                    <Link href="/auth/inscription" className="flex-1">
                      <Button variant="outline" className="w-full">
                        Créer un compte
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Registration */}
            {canRegister && (
              <Card>
                <CardHeader>
                  <CardTitle>S&apos;inscrire au tournoi</CardTitle>
                  <CardDescription>
                    Inscription {REGISTRATION_MODES[tournament.registration_mode as keyof typeof REGISTRATION_MODES].toLowerCase()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {!showRegistrationForm ? (
                    <Button onClick={() => setShowRegistrationForm(true)} className="w-full">
                      Je m&apos;inscris
                    </Button>
                  ) : (
                    <RegistrationForm
                      tournament={tournament}
                      userId={user.id}
                      userProfile={currentUserProfile}
                      onSuccess={() => {
                        setShowRegistrationForm(false);
                        window.location.reload();
                      }}
                      onCancel={() => setShowRegistrationForm(false)}
                    />
                  )}
                </CardContent>
              </Card>
            )}

            {userRegistration && (
              <Card className="border-primary">
                <CardHeader>
                  <CardTitle>Votre inscription</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p>
                      <span className="font-semibold">Statut :</span>{' '}
                      <span
                        className={`px-2 py-1 rounded text-sm ${
                          userRegistration.status === 'approved'
                            ? 'bg-green-100 text-green-800'
                            : userRegistration.status === 'accepted_paid'
                            ? 'bg-green-100 text-green-800'
                            : userRegistration.status === 'accepted_unpaid'
                            ? 'bg-orange-100 text-orange-800'
                            : userRegistration.status === 'expired_unpaid'
                            ? 'bg-red-100 text-red-800'
                            : userRegistration.status === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {userRegistration.status === 'approved'
                          ? 'Approuvé'
                          : userRegistration.status === 'accepted_paid'
                          ? 'Payé'
                          : userRegistration.status === 'accepted_unpaid'
                          ? 'En attente de paiement'
                          : userRegistration.status === 'expired_unpaid'
                          ? 'Paiement expiré'
                          : userRegistration.status === 'rejected'
                          ? 'Refusé'
                          : 'En attente'}
                      </span>
                    </p>
                    {userRegistration.team_name && (
                      <p>
                        <span className="font-semibold">Équipe :</span> {userRegistration.team_name}
                      </p>
                    )}
                    {userRegistration.position && (
                      <p>
                        <span className="font-semibold">Poste :</span> {userRegistration.position}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Payment Banner pour les inscriptions avec paiement */}
            {userRegistration && tournament.price && tournament.price > 0 && (
              <>
                {/* Debug info - à supprimer après test */}
                <div className="mb-4 p-4 bg-gray-100 rounded text-sm">
                  <strong>Debug PaymentBanner:</strong><br/>
                  Status: {userRegistration.status}<br/>
                  Payment Status: {userRegistration.payment_status || 'null'}<br/>
                  Payment Deadline: {userRegistration.payment_deadline || 'null'}<br/>
                  Tournament Price: {tournament.price}
                </div>
                <PaymentBanner
                  registration={userRegistration}
                  tournamentPrice={tournament.price}
                  tournamentTitle={tournament.title}
                />
              </>
            )}

            {/* Organizer view */}
            {isOrganizer && (
              <Card>
                <CardHeader>
                  <CardTitle>Gestion des inscriptions</CardTitle>
                  <CardDescription>
                    {registrations.length} inscription(s)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="all">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="all">Toutes</TabsTrigger>
                      <TabsTrigger value="pending">En attente</TabsTrigger>
                      <TabsTrigger value="approved">Approuvées</TabsTrigger>
                      <TabsTrigger value="rejected">Refusées</TabsTrigger>
                    </TabsList>
                    <TabsContent value="all">
                      <RegistrationsList
                        registrations={registrations}
                        tournamentId={tournament.id}
                        tournamentPrice={tournament.price}
                      />
                    </TabsContent>
                    <TabsContent value="pending">
                      <RegistrationsList
                        registrations={registrations.filter((r) => r.status === 'pending')}
                        tournamentId={tournament.id}
                        tournamentPrice={tournament.price}
                      />
                    </TabsContent>
                    <TabsContent value="approved">
                      <RegistrationsList
                        registrations={registrations.filter((r) => r.status === 'approved')}
                        tournamentId={tournament.id}
                        tournamentPrice={tournament.price}
                      />
                    </TabsContent>
                    <TabsContent value="rejected">
                      <RegistrationsList
                        registrations={registrations.filter((r) => r.status === 'rejected')}
                        tournamentId={tournament.id}
                        tournamentPrice={tournament.price}
                      />
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm">Dates</p>
                    <p className="text-sm text-muted-foreground">
                      Du {formattedStartDate}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      au {formattedEndDate}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm">Inscription jusqu&apos;au</p>
                    <p className="text-sm text-muted-foreground">{formattedDeadline}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm">Lieu</p>
                    <p className="text-sm text-muted-foreground">{tournament.address}</p>
                    <p className="text-sm text-muted-foreground">
                      {tournament.postal_code} {tournament.city}
                    </p>
                    <p className="text-sm text-muted-foreground">{tournament.country}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm">Catégorie</p>
                    <p className="text-sm text-muted-foreground">
                      {TOURNAMENT_CATEGORIES[tournament.category as keyof typeof TOURNAMENT_CATEGORIES]}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Trophy className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm">Mode d&apos;inscription</p>
                    <p className="text-sm text-muted-foreground">
                      {REGISTRATION_MODES[tournament.registration_mode as keyof typeof REGISTRATION_MODES]}
                    </p>
                    {tournament.max_teams && (
                      <p className="text-sm text-muted-foreground">
                        Maximum {tournament.max_teams} équipes
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}





