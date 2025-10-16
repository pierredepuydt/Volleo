'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Share2, Edit, Lock, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/components/ui/use-toast';
import {
  TOURNAMENT_VARIANTS,
  TOURNAMENT_LEVELS,
  TOURNAMENT_STATUS,
} from '@/lib/constants';
import Image from 'next/image';

interface TournamentHeaderProps {
  tournament: any;
  isOrganizer: boolean;
  accessToken?: string;
}

export function TournamentHeader({
  tournament,
  isOrganizer,
  accessToken,
}: TournamentHeaderProps) {
  const { toast } = useToast();

  const handleShare = async () => {
    const url = tournament.is_public
      ? `${window.location.origin}/tournois/${tournament.id}`
      : `${window.location.origin}/tournois/${tournament.id}?token=${tournament.access_token}`;

    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: '✓ Lien copié !',
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

  const variantConfig = {
    indoor_6x6: { emoji: '🏐', label: 'Indoor 6×6', color: 'blue' },
    beach_2x2: { emoji: '🏖️', label: 'Beach 2×2', color: 'orange' },
  };

  const variant =
    variantConfig[tournament.variant as keyof typeof variantConfig] ||
    variantConfig.indoor_6x6;

  return (
    <div className="relative">
      {/* Breadcrumb */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-6"
      >
        <Link
          href="/#tournois"
          className="inline-flex items-center gap-2 text-slate-600 hover:text-blue-600 transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Tous les tournois</span>
        </Link>
      </motion.div>

      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
        {/* Title & Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex-1 min-w-0"
        >
          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <Badge
              variant="default"
              className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white font-semibold"
            >
              {variant.emoji} {variant.label}
            </Badge>
            
            <Badge
              variant="secondary"
              className="px-3 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 border-green-200 font-semibold"
            >
              {TOURNAMENT_LEVELS[tournament.level as keyof typeof TOURNAMENT_LEVELS]}
            </Badge>

            {tournament.status === 'published' && (
              <Badge
                variant="outline"
                className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border-emerald-300 font-semibold"
              >
                ✓ Publié
              </Badge>
            )}

            {!tournament.is_public && (
              <Badge
                variant="outline"
                className="px-3 py-1.5 bg-amber-50 text-amber-700 border-amber-300 font-semibold flex items-center gap-1.5"
              >
                <Lock className="h-3.5 w-3.5" />
                Privé
              </Badge>
            )}
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-3 tracking-tight leading-tight">
            {tournament.title}
          </h1>

          {/* Organizer */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-semibold text-sm shadow-md">
              {organizerName.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Organisé par</p>
              <p className="text-base font-semibold text-slate-700">{organizerName}</p>
            </div>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="flex items-center gap-3"
        >
          {isOrganizer && (
            <Link href={`/tournois/${tournament.id}/editer`}>
              <Button
                variant="outline"
                size="default"
                className="h-11 px-5 border-slate-300 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-700 transition-all"
              >
                <Edit className="h-4 w-4 mr-2" />
                Éditer
              </Button>
            </Link>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="default"
                className="h-11 px-5 border-slate-300 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-700 transition-all"
                aria-label="Partager le tournoi"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Partager
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={handleShare} className="cursor-pointer">
                <Globe className="h-4 w-4 mr-2" />
                Copier le lien
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </motion.div>
      </div>
    </div>
  );
}

