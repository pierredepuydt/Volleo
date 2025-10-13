'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users, TrendingUp } from 'lucide-react';
import {
  TOURNAMENT_VARIANTS,
  TOURNAMENT_CATEGORIES,
  TOURNAMENT_LEVELS,
} from '@/lib/constants';

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

interface TournamentCardProps {
  tournament: Tournament;
  index: number;
}

export function TournamentCard({ tournament, index }: TournamentCardProps) {
  const formattedDate = new Date(tournament.start_date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const organizerName =
    tournament.profiles?.first_name && tournament.profiles?.last_name
      ? `${tournament.profiles.first_name} ${tournament.profiles.last_name}`
      : 'Organisateur';

  // Couleur de fond selon le variant
  const bgGradient =
    tournament.variant === 'beach_2x2'
      ? 'from-amber-50 to-orange-50'
      : 'from-blue-50 to-cyan-50';

  // Badge variant selon le niveau
  const levelBadgeVariant =
    tournament.level === 'beginner'
      ? 'success'
      : tournament.level === 'advanced'
      ? 'warning'
      : 'info';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      whileHover={{ y: -8, transition: { duration: 0.2 } }}
    >
      <Link href={`/tournois/${tournament.id}`}>
        <Card className="h-full hover:shadow-xl transition-all duration-300 border-slate-200 overflow-hidden group cursor-pointer">
          {/* Header avec gradient */}
          <div className={`h-24 bg-gradient-to-br ${bgGradient} relative overflow-hidden`}>
            <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10" />
            <div className="absolute top-3 right-3 flex gap-2">
              <Badge variant="default" className="bg-white/90 text-slate-700 border-0 shadow-sm">
                {TOURNAMENT_VARIANTS[tournament.variant]}
              </Badge>
            </div>
          </div>

          <CardHeader className="pb-3">
            <div className="flex gap-2 mb-3 flex-wrap">
              <Badge variant={levelBadgeVariant}>
                <TrendingUp className="h-3 w-3 mr-1" />
                {TOURNAMENT_LEVELS[tournament.level]}
              </Badge>
              <Badge variant="outline" className="bg-slate-50">
                {TOURNAMENT_CATEGORIES[tournament.category]}
              </Badge>
            </div>
            <h3 className="font-bold text-lg text-slate-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
              {tournament.title}
            </h3>
            {tournament.description && (
              <p className="text-sm text-slate-600 line-clamp-2 mt-2">
                {tournament.description}
              </p>
            )}
          </CardHeader>

          <CardContent className="space-y-2 pb-3">
            <div className="flex items-center text-sm text-slate-600">
              <Calendar className="h-4 w-4 mr-2 text-blue-500" />
              <span>{formattedDate}</span>
            </div>
            <div className="flex items-center text-sm text-slate-600">
              <MapPin className="h-4 w-4 mr-2 text-red-500" />
              <span>{tournament.city}</span>
            </div>
            <div className="flex items-center text-sm text-slate-600">
              <Users className="h-4 w-4 mr-2 text-green-500" />
              <span>
                {tournament.max_teams ? `Max ${tournament.max_teams} équipes` : 'Places illimitées'}
              </span>
            </div>
            <div className="text-xs text-slate-500 pt-2 border-t">
              Par {organizerName}
            </div>
          </CardContent>

          <CardFooter className="pt-0">
            <Button className="w-full bg-blue-600 hover:bg-blue-700 group-hover:shadow-md transition-all">
              Voir le tournoi
            </Button>
          </CardFooter>
        </Card>
      </Link>
    </motion.div>
  );
}

