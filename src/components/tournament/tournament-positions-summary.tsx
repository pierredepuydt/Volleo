'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { UserPlus, Target } from 'lucide-react';
import { POSITIONS } from '@/lib/constants';

interface TournamentPositionsSummaryProps {
  tournament: any;
  registrations: any[];
  onSelectPosition?: (position: string) => void;
}

export function TournamentPositionsSummary({
  tournament,
  registrations,
  onSelectPosition,
}: TournamentPositionsSummaryProps) {
  // Only show for indoor 6x6 with positional signup
  if (tournament.variant !== 'indoor_6x6' || tournament.registration_mode !== 'solo_positional') {
    return null;
  }

  const positionQuotas = tournament.position_quotas || {};
  const approvedRegistrations = registrations.filter((r) => r.status === 'approved');

  // Count approved registrations by position
  const positionCounts: Record<string, number> = {};
  approvedRegistrations.forEach((reg) => {
    if (reg.position) {
      positionCounts[reg.position] = (positionCounts[reg.position] || 0) + 1;
    }
  });

  const positions = [
    { key: 'setter', icon: '⚙️', color: 'blue' },
    { key: 'middle', icon: '🏔️', color: 'purple' },
    { key: 'outside', icon: '⚡', color: 'orange' },
    { key: 'opposite', icon: '🎯', color: 'red' },
    { key: 'libero', icon: '🛡️', color: 'green' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
    >
      <Card className="shadow-lg border-slate-200">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 border-b">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Target className="h-5 w-5 text-purple-600" />
            Postes & Quotas
          </CardTitle>
          <CardDescription>Répartition des postes pour ce tournoi 6×6</CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          {positions.map((position) => {
            const quota = positionQuotas[position.key] || 0;
            const selected = positionCounts[position.key] || 0;
            const percentage = quota > 0 ? (selected / quota) * 100 : 0;
            const isAvailable = selected < quota;
            const isFull = selected >= quota;

            return (
              <div
                key={position.key}
                className="p-4 rounded-xl border bg-white hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center text-xl">
                      {position.icon}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">
                        {POSITIONS[position.key as keyof typeof POSITIONS]}
                      </p>
                      <p className="text-sm text-slate-500">
                        {selected} / {quota} sélectionné{selected > 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge
                      variant={isAvailable ? 'default' : 'secondary'}
                      className={`${
                        isAvailable
                          ? 'bg-green-100 text-green-700 border-green-300'
                          : 'bg-slate-100 text-slate-600 border-slate-300'
                      } font-semibold`}
                    >
                      {isAvailable ? '✓ Disponible' : '✗ Complet'}
                    </Badge>

                    {isAvailable && onSelectPosition && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onSelectPosition(position.key)}
                        className="h-8 px-3 text-xs border-blue-300 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-400"
                      >
                        <UserPlus className="h-3.5 w-3.5 mr-1" />
                        Demander
                      </Button>
                    )}
                  </div>
                </div>

                <Progress
                  value={percentage}
                  className="h-2"
                  indicatorClassName={
                    isFull
                      ? 'bg-slate-400'
                      : percentage > 75
                      ? 'bg-orange-500'
                      : 'bg-green-500'
                  }
                />
              </div>
            );
          })}

          <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
            <p className="text-sm text-blue-800 leading-relaxed">
              <span className="font-semibold">💡 Note :</span> Les postes sont attribués par
              l'organisateur après validation de votre inscription. La sélection finale dépend de
              la disponibilité et des quotas définis.
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

