'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Trophy, Sparkles } from 'lucide-react';
import { TournamentCard } from './tournament-card';

interface Tournament {
  id: string;
  title: string;
  description: string | null;
  variant: 'indoor_6x6' | 'beach_2x2';
  category: 'mixed' | 'men' | 'women';
  level: 'beginner' | 'intermediate' | 'advanced';
  start_date: string;
  city: string;
  max_teams: number | null;
  profiles: {
    first_name: string | null;
    last_name: string | null;
  };
}

interface TournamentListProps {
  tournaments: Tournament[];
  userProfile?: any;
}

export function TournamentList({ tournaments, userProfile }: TournamentListProps) {
  if (tournaments.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-20 px-4"
      >
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-3xl p-12 max-w-lg mx-auto border border-blue-100">
          <Trophy className="h-16 w-16 text-blue-400 mx-auto mb-6" />
          <h3 className="text-2xl font-bold mb-3 text-slate-900">Aucun tournoi disponible</h3>
          <p className="text-slate-600 mb-8">
            Soyez le premier à créer un tournoi et lancez votre communauté !
          </p>
          <Link href="/tournois/creer">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              <Trophy className="h-5 w-5 mr-2" />
              Créer mon premier tournoi
            </Button>
          </Link>
        </div>
      </motion.div>
    );
  }

  // Group tournaments by relevance if user is logged in
  let suggestedTournaments: Tournament[] = [];
  let otherTournaments: Tournament[] = [];

  if (userProfile) {
    tournaments.forEach((tournament) => {
      const matchesLevel = tournament.level === userProfile.level;
      const matchesCity = tournament.city.toLowerCase() === userProfile.city?.toLowerCase();
      const matchesGender =
        tournament.category === 'mixed' ||
        (tournament.category === 'men' && userProfile.gender === 'male') ||
        (tournament.category === 'women' && userProfile.gender === 'female');

      if ((matchesLevel || matchesCity) && matchesGender) {
        suggestedTournaments.push(tournament);
      } else {
        otherTournaments.push(tournament);
      }
    });
  } else {
    otherTournaments = tournaments;
  }

  return (
    <div className="space-y-12">
      {suggestedTournaments.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <Sparkles className="h-6 w-6 text-amber-500" />
            <h3 className="text-2xl font-bold text-slate-900">
              Pour toi, {userProfile.first_name || 'volleyeur'} 👋
            </h3>
          </div>
          <p className="text-slate-600 mb-6">
            Ces tournois correspondent à ton profil
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {suggestedTournaments.map((tournament, index) => (
              <TournamentCard key={tournament.id} tournament={tournament} index={index} />
            ))}
          </div>
        </motion.div>
      )}

      {otherTournaments.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: suggestedTournaments.length > 0 ? 0.4 : 0.2 }}
        >
          {suggestedTournaments.length > 0 && (
            <h3 className="text-2xl font-bold text-slate-900 mb-6">
              Autres tournois à découvrir
            </h3>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {otherTournaments.map((tournament, index) => (
              <TournamentCard key={tournament.id} tournament={tournament} index={index} />
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}





