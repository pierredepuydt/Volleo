'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users, TrendingUp, ArrowRight } from 'lucide-react';
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
  image_url?: string | null;
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

  // Image de fond personnalisée ou par défaut selon le variant
  const bgImage = tournament.image_url || 
    (tournament.variant === 'beach_2x2'
      ? 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=800&auto=format&fit=crop'
      : 'https://images.unsplash.com/photo-1612872087865-6f7e4e3f83f8?w=800&auto=format&fit=crop');

  // Badge variant selon le niveau
  const levelBadgeColor =
    tournament.level === 'beginner'
      ? 'bg-green-500/90'
      : tournament.level === 'advanced'
      ? 'bg-red-500/90'
      : 'bg-blue-500/90';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      whileHover={{ y: -8, transition: { duration: 0.2 } }}
      className="h-full"
    >
      <Link href={`/tournois/${tournament.id}`}>
        <Card className="h-full hover:shadow-2xl transition-all duration-300 border-slate-200 overflow-hidden group cursor-pointer rounded-2xl">
          {/* Header avec image de fond */}
          <div className="h-48 relative overflow-hidden">
            <Image
              src={bgImage}
              alt={`${tournament.variant} volleyball`}
              fill
              className="object-cover object-center group-hover:scale-110 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            
            {/* Badges positionnés sur l'image */}
            <div className="absolute top-4 left-4 flex gap-2 flex-wrap">
              <Badge className={`${levelBadgeColor} text-white border-0 shadow-lg backdrop-blur-sm`}>
                <TrendingUp className="h-3 w-3 mr-1" />
                {TOURNAMENT_LEVELS[tournament.level]}
              </Badge>
              <Badge className="bg-white/90 text-slate-700 border-0 shadow-lg">
                {TOURNAMENT_VARIANTS[tournament.variant]}
              </Badge>
            </div>

            <div className="absolute bottom-4 left-4 right-4">
              <Badge variant="outline" className="bg-white/95 text-slate-700 border-0 shadow-sm">
                {TOURNAMENT_CATEGORIES[tournament.category]}
              </Badge>
            </div>
          </div>

          <CardHeader className="pb-3 pt-5">
            <h3 className="font-bold text-xl text-slate-900 line-clamp-2 group-hover:text-blue-600 transition-colors leading-tight">
              {tournament.title}
            </h3>
            {tournament.description && (
              <p className="text-sm text-slate-600 line-clamp-2 mt-2 leading-relaxed">
                {tournament.description}
              </p>
            )}
          </CardHeader>

          <CardContent className="space-y-3 pb-4">
            <div className="flex items-center text-sm text-slate-600">
              <div className="bg-blue-50 p-2 rounded-lg mr-3">
                <Calendar className="h-4 w-4 text-blue-600" />
              </div>
              <span className="font-medium">{formattedDate}</span>
            </div>
            <div className="flex items-center text-sm text-slate-600">
              <div className="bg-red-50 p-2 rounded-lg mr-3">
                <MapPin className="h-4 w-4 text-red-600" />
              </div>
              <span className="font-medium">{tournament.city}</span>
            </div>
            <div className="flex items-center text-sm text-slate-600">
              <div className="bg-green-50 p-2 rounded-lg mr-3">
                <Users className="h-4 w-4 text-green-600" />
              </div>
              <span className="font-medium">
                {tournament.max_teams ? `Max ${tournament.max_teams} équipes` : 'Places illimitées'}
              </span>
            </div>
            <div className="text-xs text-slate-500 pt-3 border-t border-slate-100">
              Organisé par <span className="font-semibold text-slate-700">{organizerName}</span>
            </div>
          </CardContent>

          <CardFooter className="pt-0 pb-5">
            <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 group-hover:shadow-lg transition-all text-white font-semibold rounded-xl py-6 group/button">
              Voir le tournoi
              <ArrowRight className="h-4 w-4 ml-2 group-hover/button:translate-x-1 transition-transform" />
            </Button>
          </CardFooter>
        </Card>
      </Link>
    </motion.div>
  );
}

