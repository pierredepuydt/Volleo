'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';

interface TournamentAboutProps {
  description?: string | null;
}

export function TournamentAbout({ description }: TournamentAboutProps) {
  const hasDescription = description && description.trim().length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      <Card className="shadow-sm border-slate-200">
        <CardHeader className="border-b bg-slate-50">
          <CardTitle className="flex items-center gap-2 text-xl">
            <FileText className="h-5 w-5 text-blue-600" />
            À propos du tournoi
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {hasDescription ? (
            <div className="prose prose-slate max-w-none">
              <p className="text-slate-700 leading-relaxed whitespace-pre-wrap text-base">
                {description}
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                <FileText className="h-8 w-8 text-slate-400" />
              </div>
              <p className="text-slate-500 text-sm font-medium mb-1">
                Aucune description pour le moment
              </p>
              <p className="text-slate-400 text-xs max-w-xs">
                L&apos;organisateur n&apos;a pas encore ajouté de description pour ce tournoi.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

