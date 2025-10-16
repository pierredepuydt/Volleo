'use client';

import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, Users, Shield, Trophy, Lock, Globe, Timer } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { TOURNAMENT_CATEGORIES, REGISTRATION_MODES } from '@/lib/constants';
import { useEffect, useState } from 'react';

interface TournamentInfoSidebarProps {
  tournament: any;
  isMobile?: boolean;
}

export function TournamentInfoSidebar({ tournament, isMobile = false }: TournamentInfoSidebarProps) {
  const [timeUntilDeadline, setTimeUntilDeadline] = useState('');

  useEffect(() => {
    const calculateTimeUntilDeadline = () => {
      const now = new Date();
      const deadline = new Date(tournament.registration_deadline);
      const diff = deadline.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeUntilDeadline('Terminé');
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

      if (days > 0) {
        setTimeUntilDeadline(`J-${days}`);
      } else if (hours > 0) {
        setTimeUntilDeadline(`${hours}h restantes`);
      } else {
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        setTimeUntilDeadline(`${minutes}min restantes`);
      }
    };

    calculateTimeUntilDeadline();
    const interval = setInterval(calculateTimeUntilDeadline, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [tournament.registration_deadline]);

  const formattedStartDate = new Date(tournament.start_date).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const formattedStartTime = new Date(tournament.start_date).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const formattedEndDate = new Date(tournament.end_date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const formattedEndTime = new Date(tournament.end_date).toLocaleTimeString('fr-FR', {
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

  const InfoItem = ({ icon: Icon, label, value, badge }: any) => (
    <div className="flex items-start gap-3 py-3">
      <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center">
        <Icon className="h-5 w-5 text-blue-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-900 mb-1">{label}</p>
        {typeof value === 'string' ? (
          <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{value}</p>
        ) : (
          value
        )}
        {badge && (
          <Badge variant="secondary" className="mt-2">
            {badge}
          </Badge>
        )}
      </div>
    </div>
  );

  const content = (
    <div className="space-y-1">
      <InfoItem
        icon={Calendar}
        label="Dates du tournoi"
        value={
          <div className="space-y-1">
            <p className="text-sm text-slate-600">
              Début : {formattedStartDate} à {formattedStartTime}
            </p>
            <p className="text-sm text-slate-600">
              Fin : {formattedEndDate} à {formattedEndTime}
            </p>
          </div>
        }
      />

      <Separator />

      <InfoItem
        icon={Timer}
        label="Inscription jusqu'au"
        value={formattedDeadline}
        badge={timeUntilDeadline && timeUntilDeadline !== 'Terminé' ? timeUntilDeadline : undefined}
      />

      <Separator />

      <InfoItem
        icon={MapPin}
        label="Lieu"
        value={`${tournament.address}\n${tournament.postal_code} ${tournament.city}\n${tournament.country}`}
      />

      <Separator />

      <InfoItem
        icon={Users}
        label="Catégorie"
        value={TOURNAMENT_CATEGORIES[tournament.category as keyof typeof TOURNAMENT_CATEGORIES]}
      />

      <Separator />

      <InfoItem
        icon={Trophy}
        label="Mode d'inscription"
        value={
          <div className="space-y-1">
            <p className="text-sm text-slate-600">
              {REGISTRATION_MODES[tournament.registration_mode as keyof typeof REGISTRATION_MODES]}
            </p>
            {tournament.max_teams && (
              <p className="text-sm text-slate-500">Maximum {tournament.max_teams} équipes</p>
            )}
          </div>
        }
      />

      <Separator />

      <InfoItem
        icon={tournament.is_public ? Globe : Lock}
        label="Visibilité"
        value={
          <Badge variant={tournament.is_public ? 'default' : 'secondary'} className="font-medium">
            {tournament.is_public ? (
              <>
                <Globe className="h-3 w-3 mr-1" />
                Public
              </>
            ) : (
              <>
                <Lock className="h-3 w-3 mr-1" />
                Privé
              </>
            )}
          </Badge>
        }
      />
    </div>
  );

  // Mobile version (Accordion)
  if (isMobile) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <Accordion type="single" collapsible defaultValue="info" className="w-full">
          <AccordionItem value="info" className="border rounded-xl px-4 bg-white shadow-sm">
            <AccordionTrigger className="hover:no-underline py-4">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-600" />
                <span className="font-semibold text-lg">Informations</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-4">
              {content}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </motion.div>
    );
  }

  // Desktop version (Sticky Card)
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-auto"
    >
      <Card className="shadow-lg border-slate-200">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 border-b">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Shield className="h-5 w-5 text-blue-600" />
            Informations
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          {content}
        </CardContent>
      </Card>
    </motion.div>
  );
}

