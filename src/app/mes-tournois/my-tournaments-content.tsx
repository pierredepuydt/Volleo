'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Users, FileText, Trophy, Clock } from 'lucide-react';
import {
  TOURNAMENT_VARIANTS,
  TOURNAMENT_CATEGORIES,
  TOURNAMENT_LEVELS,
  TOURNAMENT_STATUS,
} from '@/lib/constants';

interface MyTournamentsContentProps {
  drafts: any[];
  published: any[];
  ongoing: any[];
  completed: any[];
  approvedRegistrations: any[];
  pendingRegistrations: any[];
}

export function MyTournamentsContent({
  drafts,
  published,
  ongoing,
  completed,
  approvedRegistrations,
  pendingRegistrations,
}: MyTournamentsContentProps) {
  return (
    <Tabs defaultValue="created" className="space-y-6">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="created">Tournois créés</TabsTrigger>
        <TabsTrigger value="participating">
          Participations ({approvedRegistrations.length})
        </TabsTrigger>
        <TabsTrigger value="pending">
          En attente ({pendingRegistrations.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="created" className="space-y-6">
        {drafts.length > 0 && (
          <div>
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Brouillons ({drafts.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {drafts.map((tournament) => (
                <TournamentCard key={tournament.id} tournament={tournament} isDraft />
              ))}
            </div>
          </div>
        )}

        {published.length > 0 && (
          <div>
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Publiés ({published.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {published.map((tournament) => (
                <TournamentCard key={tournament.id} tournament={tournament} />
              ))}
            </div>
          </div>
        )}

        {ongoing.length > 0 && (
          <div>
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5" />
              En cours ({ongoing.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {ongoing.map((tournament) => (
                <TournamentCard key={tournament.id} tournament={tournament} />
              ))}
            </div>
          </div>
        )}

        {completed.length > 0 && (
          <div>
            <h3 className="text-xl font-semibold mb-4">
              Historique ({completed.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {completed.map((tournament) => (
                <TournamentCard key={tournament.id} tournament={tournament} />
              ))}
            </div>
          </div>
        )}

        {drafts.length === 0 &&
          published.length === 0 &&
          ongoing.length === 0 &&
          completed.length === 0 && (
            <div className="text-center py-12">
              <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucun tournoi créé</h3>
              <p className="text-muted-foreground mb-6">
                Commencez par créer votre premier tournoi
              </p>
              <Link href="/tournois/creer">
                <Button>Créer un tournoi</Button>
              </Link>
            </div>
          )}
      </TabsContent>

      <TabsContent value="participating" className="space-y-6">
        {approvedRegistrations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {approvedRegistrations.map((registration) => (
              <RegistrationCard
                key={registration.id}
                registration={registration}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Aucune participation confirmée
            </h3>
            <p className="text-muted-foreground">
              Inscrivez-vous à des tournois pour les voir ici
            </p>
          </div>
        )}
      </TabsContent>

      <TabsContent value="pending" className="space-y-6">
        {pendingRegistrations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingRegistrations.map((registration) => (
              <RegistrationCard
                key={registration.id}
                registration={registration}
                isPending
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Aucune inscription en attente
            </h3>
            <p className="text-muted-foreground">
              Vos inscriptions en attente de validation apparaîtront ici
            </p>
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}

function TournamentCard({
  tournament,
  isDraft = false,
}: {
  tournament: any;
  isDraft?: boolean;
}) {
  const formattedDate = new Date(tournament.start_date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start mb-2">
          <div className="flex gap-2">
            <span className="text-xs font-semibold px-2 py-1 rounded-full bg-primary/10 text-primary">
              {TOURNAMENT_VARIANTS[tournament.variant as keyof typeof TOURNAMENT_VARIANTS]}
            </span>
            {isDraft && (
              <span className="text-xs font-semibold px-2 py-1 rounded-full bg-yellow-100 text-yellow-800">
                Brouillon
              </span>
            )}
          </div>
        </div>
        <CardTitle className="line-clamp-2">{tournament.title}</CardTitle>
        <CardDescription className="line-clamp-2">
          {tournament.description || 'Aucune description'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center text-sm text-muted-foreground">
          <Calendar className="h-4 w-4 mr-2" />
          {formattedDate}
        </div>
        <div className="flex items-center text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 mr-2" />
          {tournament.city}
        </div>
        <div className="flex items-center text-sm text-muted-foreground">
          <Users className="h-4 w-4 mr-2" />
          {TOURNAMENT_CATEGORIES[tournament.category as keyof typeof TOURNAMENT_CATEGORIES]} •{' '}
          {TOURNAMENT_LEVELS[tournament.level as keyof typeof TOURNAMENT_LEVELS]}
        </div>
      </CardContent>
      <div className="px-6 pb-6">
        <Link href={`/tournois/${tournament.id}`} className="w-full">
          <Button className="w-full" variant={isDraft ? 'outline' : 'default'}>
            {isDraft ? 'Continuer' : 'Voir le tournoi'}
          </Button>
        </Link>
      </div>
    </Card>
  );
}

function RegistrationCard({
  registration,
  isPending = false,
}: {
  registration: any;
  isPending?: boolean;
}) {
  const tournament = registration.tournaments;
  const formattedDate = new Date(tournament.start_date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <Card className={`hover:shadow-lg transition-shadow ${isPending ? 'border-yellow-200' : ''}`}>
      <CardHeader>
        <div className="flex justify-between items-start mb-2">
          <div className="flex gap-2">
            <span className="text-xs font-semibold px-2 py-1 rounded-full bg-primary/10 text-primary">
              {TOURNAMENT_VARIANTS[tournament.variant as keyof typeof TOURNAMENT_VARIANTS]}
            </span>
            {isPending && (
              <span className="text-xs font-semibold px-2 py-1 rounded-full bg-yellow-100 text-yellow-800">
                En attente
              </span>
            )}
          </div>
        </div>
        <CardTitle className="line-clamp-2">{tournament.title}</CardTitle>
        {registration.team_name && (
          <CardDescription>Équipe: {registration.team_name}</CardDescription>
        )}
        {registration.position && (
          <CardDescription>Poste: {registration.position}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center text-sm text-muted-foreground">
          <Calendar className="h-4 w-4 mr-2" />
          {formattedDate}
        </div>
        <div className="flex items-center text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 mr-2" />
          {tournament.city}
        </div>
      </CardContent>
      <div className="px-6 pb-6">
        <Link href={`/tournois/${tournament.id}`} className="w-full">
          <Button className="w-full">Voir le tournoi</Button>
        </Link>
      </div>
    </Card>
  );
}





