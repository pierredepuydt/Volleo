'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TournamentFilters, FilterState } from './tournament-filters';
import { TournamentList } from './tournament-list';
import { TournamentSkeletonGrid } from './tournament-skeleton';
import { SearchX } from 'lucide-react';

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

interface TournamentSearchProps {
  tournaments: Tournament[];
  userProfile?: any;
}

export function TournamentSearch({ tournaments, userProfile }: TournamentSearchProps) {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    variant: 'all',
    category: 'all',
    level: 'all',
    city: 'all',
  });
  const [isFiltering, setIsFiltering] = useState(false);

  // Extraire les villes uniques pour le filtre
  const cities = useMemo(() => {
    const uniqueCities = Array.from(new Set(tournaments.map(t => t.city))).sort();
    return uniqueCities;
  }, [tournaments]);

  // Fonction de filtrage
  const filteredTournaments = useMemo(() => {
    setIsFiltering(true);
    
    let result = tournaments;

    // Filtre par recherche texte (titre + ville)
    if (filters.search.trim()) {
      const searchLower = filters.search.toLowerCase().trim();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(searchLower) ||
          t.city.toLowerCase().includes(searchLower) ||
          t.description?.toLowerCase().includes(searchLower)
      );
    }

    // Filtre par variant
    if (filters.variant !== 'all') {
      result = result.filter((t) => t.variant === filters.variant);
    }

    // Filtre par catégorie
    if (filters.category !== 'all') {
      result = result.filter((t) => t.category === filters.category);
    }

    // Filtre par niveau
    if (filters.level !== 'all') {
      result = result.filter((t) => t.level === filters.level);
    }

    // Filtre par ville
    if (filters.city !== 'all') {
      result = result.filter((t) => t.city === filters.city);
    }

    // Petit délai pour montrer l'effet de chargement
    setTimeout(() => setIsFiltering(false), 150);

    return result;
  }, [tournaments, filters]);

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  return (
    <div>
      {/* Composant de filtres */}
      <TournamentFilters
        onFilterChange={handleFilterChange}
        cities={cities}
        totalResults={filteredTournaments.length}
      />

      {/* Résultats */}
      <AnimatePresence mode="wait">
        {isFiltering ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <TournamentSkeletonGrid count={3} />
          </motion.div>
        ) : filteredTournaments.length > 0 ? (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <TournamentList
              tournaments={filteredTournaments}
              userProfile={userProfile}
            />
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="text-center py-16"
          >
            <div className="bg-gradient-to-br from-slate-50 to-blue-50/30 rounded-3xl p-12 max-w-lg mx-auto border border-slate-200">
              <div className="bg-slate-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <SearchX className="h-10 w-10 text-slate-400" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-slate-900">
                Aucun tournoi trouvé
              </h3>
              <p className="text-slate-600 mb-6">
                Aucun tournoi ne correspond à vos critères de recherche.
                <br />
                Essayez de modifier ou réinitialiser vos filtres.
              </p>
              <button
                onClick={() => handleFilterChange({
                  search: '',
                  variant: 'all',
                  category: 'all',
                  level: 'all',
                  city: 'all',
                })}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors"
              >
                Réinitialiser les filtres
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

