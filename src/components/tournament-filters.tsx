'use client';

import { motion } from 'framer-motion';
import { Search, Filter, X, MapPin, Trophy, Users, TrendingUp, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useState } from 'react';
import {
  TOURNAMENT_VARIANTS,
  TOURNAMENT_CATEGORIES,
  TOURNAMENT_LEVELS,
} from '@/lib/constants';

interface TournamentFiltersProps {
  onFilterChange: (filters: FilterState) => void;
  cities: string[];
  totalResults: number;
}

export interface FilterState {
  search: string;
  variant: string;
  category: string;
  level: string;
  city: string;
}

export function TournamentFilters({ onFilterChange, cities, totalResults }: TournamentFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    variant: 'all',
    category: 'all',
    level: 'all',
    city: 'all',
  });

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters: FilterState = {
      search: '',
      variant: 'all',
      category: 'all',
      level: 'all',
      city: 'all',
    };
    setFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  const activeFiltersCount = Object.entries(filters).filter(
    ([key, value]) => key !== 'search' && value !== 'all'
  ).length;

  return (
    <div className="mb-8">
      {/* Barre de recherche principale */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 mb-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Input de recherche */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input
              type="text"
              placeholder="Rechercher un tournoi par nom ou ville..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="pl-12 pr-4 py-6 text-base rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-500"
            />
            {filters.search && (
              <button
                onClick={() => handleFilterChange('search', '')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Bouton pour ouvrir les filtres */}
          <Button
            onClick={() => setIsOpen(!isOpen)}
            variant={isOpen ? 'default' : 'outline'}
            size="lg"
            className={`px-6 py-6 rounded-xl font-semibold whitespace-nowrap ${
              isOpen 
                ? 'bg-blue-600 hover:bg-blue-700' 
                : 'border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Filter className="h-5 w-5 mr-2" />
            Filtres
            {activeFiltersCount > 0 && (
              <Badge className="ml-2 bg-amber-500 hover:bg-amber-600 text-white border-0">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </div>

        {/* Résultats count */}
        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="text-slate-600">
            <span className="font-semibold text-blue-600">{totalResults}</span> tournoi{totalResults > 1 ? 's' : ''} trouvé{totalResults > 1 ? 's' : ''}
          </span>
          {activeFiltersCount > 0 && (
            <button
              onClick={clearFilters}
              className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
            >
              <X className="h-4 w-4" />
              Réinitialiser les filtres
            </button>
          )}
        </div>
      </div>

      {/* Panel de filtres détaillés */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 overflow-hidden"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Filter className="h-5 w-5 text-blue-600" />
              Filtres avancés
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Filtre Type */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                <Trophy className="h-4 w-4 text-blue-600" />
                Type de tournoi
              </label>
              <Select
                value={filters.variant}
                onValueChange={(value) => handleFilterChange('variant', value)}
              >
                <SelectTrigger className="w-full rounded-xl border-slate-200">
                  <SelectValue placeholder="Tous les types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  <SelectItem value="indoor_6x6">
                    {TOURNAMENT_VARIANTS.indoor_6x6}
                  </SelectItem>
                  <SelectItem value="beach_2x2">
                    {TOURNAMENT_VARIANTS.beach_2x2}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Filtre Catégorie */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-600" />
                Catégorie
              </label>
              <Select
                value={filters.category}
                onValueChange={(value) => handleFilterChange('category', value)}
              >
                <SelectTrigger className="w-full rounded-xl border-slate-200">
                  <SelectValue placeholder="Toutes catégories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes catégories</SelectItem>
                  <SelectItem value="mixed">
                    {TOURNAMENT_CATEGORIES.mixed}
                  </SelectItem>
                  <SelectItem value="men">
                    {TOURNAMENT_CATEGORIES.men}
                  </SelectItem>
                  <SelectItem value="women">
                    {TOURNAMENT_CATEGORIES.women}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Filtre Niveau */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                Niveau
              </label>
              <Select
                value={filters.level}
                onValueChange={(value) => handleFilterChange('level', value)}
              >
                <SelectTrigger className="w-full rounded-xl border-slate-200">
                  <SelectValue placeholder="Tous niveaux" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous niveaux</SelectItem>
                  <SelectItem value="beginner">
                    {TOURNAMENT_LEVELS.beginner}
                  </SelectItem>
                  <SelectItem value="intermediate">
                    {TOURNAMENT_LEVELS.intermediate}
                  </SelectItem>
                  <SelectItem value="advanced">
                    {TOURNAMENT_LEVELS.advanced}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Filtre Ville */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-blue-600" />
                Ville
              </label>
              <Select
                value={filters.city}
                onValueChange={(value) => handleFilterChange('city', value)}
              >
                <SelectTrigger className="w-full rounded-xl border-slate-200">
                  <SelectValue placeholder="Toutes villes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes villes</SelectItem>
                  {cities.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tags actifs */}
          {activeFiltersCount > 0 && (
            <div className="mt-6 pt-6 border-t border-slate-200">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium text-slate-600">Filtres actifs :</span>
                {filters.variant !== 'all' && (
                  <Badge
                    variant="secondary"
                    className="pl-3 pr-2 py-1 bg-blue-100 text-blue-700 hover:bg-blue-200 cursor-pointer"
                    onClick={() => handleFilterChange('variant', 'all')}
                  >
                    {TOURNAMENT_VARIANTS[filters.variant as keyof typeof TOURNAMENT_VARIANTS]}
                    <X className="h-3 w-3 ml-1.5" />
                  </Badge>
                )}
                {filters.category !== 'all' && (
                  <Badge
                    variant="secondary"
                    className="pl-3 pr-2 py-1 bg-green-100 text-green-700 hover:bg-green-200 cursor-pointer"
                    onClick={() => handleFilterChange('category', 'all')}
                  >
                    {TOURNAMENT_CATEGORIES[filters.category as keyof typeof TOURNAMENT_CATEGORIES]}
                    <X className="h-3 w-3 ml-1.5" />
                  </Badge>
                )}
                {filters.level !== 'all' && (
                  <Badge
                    variant="secondary"
                    className="pl-3 pr-2 py-1 bg-amber-100 text-amber-700 hover:bg-amber-200 cursor-pointer"
                    onClick={() => handleFilterChange('level', 'all')}
                  >
                    {TOURNAMENT_LEVELS[filters.level as keyof typeof TOURNAMENT_LEVELS]}
                    <X className="h-3 w-3 ml-1.5" />
                  </Badge>
                )}
                {filters.city !== 'all' && (
                  <Badge
                    variant="secondary"
                    className="pl-3 pr-2 py-1 bg-purple-100 text-purple-700 hover:bg-purple-200 cursor-pointer"
                    onClick={() => handleFilterChange('city', 'all')}
                  >
                    {filters.city}
                    <X className="h-3 w-3 ml-1.5" />
                  </Badge>
                )}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}

