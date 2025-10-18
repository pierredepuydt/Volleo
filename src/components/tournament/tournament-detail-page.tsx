'use client';

import { Suspense, useState } from 'react';
import { motion } from 'framer-motion';
import { useMediaQuery } from '@/hooks/use-media-query';
import { TournamentHeader } from './tournament-header';
import { TournamentAbout } from './tournament-about';
import { TournamentInfoSidebar } from './tournament-info-sidebar';
import { TournamentRegistrationPanel } from './tournament-registration-panel';
import { TournamentPositionsSummary } from './tournament-positions-summary';
import {
  TournamentHeaderSkeleton,
  TournamentAboutSkeleton,
  TournamentRegistrationSkeleton,
  TournamentPositionsSkeleton,
  TournamentSidebarSkeleton,
} from './tournament-skeletons';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RegistrationsList } from '@/app/tournois/[id]/registrations-list';

interface TournamentDetailPageProps {
  tournament: any;
  user: any;
  userRegistration: any;
  registrations: any[];
  accessToken?: string;
  currentUserProfile?: any;
}

export function TournamentDetailPage({
  tournament,
  user,
  userRegistration,
  registrations,
  accessToken,
  currentUserProfile,
}: TournamentDetailPageProps) {
  const isOrganizer = user?.id === tournament.organizer_id;
  const isMobile = useMediaQuery('(max-width: 1024px)');
  const [selectedPosition, setSelectedPosition] = useState('');

  const handleSelectPosition = (position: string) => {
    setSelectedPosition(position);
    // Scroll to registration form
    const registrationSection = document.getElementById('registration-section');
    if (registrationSection) {
      registrationSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-slate-50/30 to-white">
      <div className="container mx-auto px-4 lg:px-8 py-8 max-w-7xl">
        {/* Header */}
        <Suspense fallback={<TournamentHeaderSkeleton />}>
          <TournamentHeader
            tournament={tournament}
            isOrganizer={isOrganizer}
            accessToken={accessToken}
          />
        </Suspense>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 mt-8">
          {/* Left Column (2/3) */}
          <div className="lg:col-span-2 space-y-6 md:space-y-8">
            {/* About Section */}
            <Suspense fallback={<TournamentAboutSkeleton />}>
              <TournamentAbout description={tournament.description} />
            </Suspense>

            {/* Registration Section */}
            <div id="registration-section">
              <Suspense fallback={<TournamentRegistrationSkeleton />}>
                <TournamentRegistrationPanel
                  tournament={tournament}
                  user={user}
                  userRegistration={userRegistration}
                  currentUserProfile={currentUserProfile}
                  isOrganizer={isOrganizer}
                />
              </Suspense>
            </div>

            {/* Positions & Quotas (6x6 positional only) */}
            {tournament.variant === 'indoor_6x6' &&
              tournament.registration_mode === 'solo_positional' && (
                <Suspense fallback={<TournamentPositionsSkeleton />}>
                  <TournamentPositionsSummary
                    tournament={tournament}
                    registrations={registrations}
                    onSelectPosition={user && !isOrganizer && !userRegistration ? handleSelectPosition : undefined}
                  />
                </Suspense>
              )}

            {/* Organizer Management */}
            {isOrganizer && registrations.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.4 }}
              >
                <Card className="shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 border-b">
                    <CardTitle className="text-xl">Gestion des inscriptions</CardTitle>
                    <CardDescription>{registrations.length} inscription(s)</CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <Tabs defaultValue="all" className="w-full">
                      <TabsList className="grid w-full grid-cols-4 h-11">
                        <TabsTrigger value="all" className="text-sm font-medium">
                          Toutes
                        </TabsTrigger>
                        <TabsTrigger value="pending" className="text-sm font-medium">
                          En attente
                        </TabsTrigger>
                        <TabsTrigger value="approved" className="text-sm font-medium">
                          Approuvées
                        </TabsTrigger>
                        <TabsTrigger value="rejected" className="text-sm font-medium">
                          Refusées
                        </TabsTrigger>
                      </TabsList>
                      <TabsContent value="all" className="mt-6">
                        <RegistrationsList
                          registrations={registrations}
                          tournamentId={tournament.id}
                          tournamentPrice={tournament.price}
                        />
                      </TabsContent>
                      <TabsContent value="pending" className="mt-6">
                        <RegistrationsList
                          registrations={registrations.filter((r) => r.status === 'pending')}
                          tournamentId={tournament.id}
                          tournamentPrice={tournament.price}
                        />
                      </TabsContent>
                      <TabsContent value="approved" className="mt-6">
                        <RegistrationsList
                          registrations={registrations.filter((r) => r.status === 'approved')}
                          tournamentId={tournament.id}
                          tournamentPrice={tournament.price}
                        />
                      </TabsContent>
                      <TabsContent value="rejected" className="mt-6">
                        <RegistrationsList
                          registrations={registrations.filter((r) => r.status === 'rejected')}
                          tournamentId={tournament.id}
                          tournamentPrice={tournament.price}
                        />
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Right Column (1/3) - Sidebar */}
          <div className="lg:col-span-1">
            <Suspense fallback={<TournamentSidebarSkeleton />}>
              <TournamentInfoSidebar tournament={tournament} isMobile={isMobile} />
            </Suspense>
          </div>
        </div>
      </div>
    </main>
  );
}

