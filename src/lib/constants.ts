export const TOURNAMENT_VARIANTS = {
  indoor_6x6: 'Indoor 6x6',
  beach_2x2: 'Beach 2x2',
} as const;

export const TOURNAMENT_CATEGORIES = {
  mixed: 'Mixte',
  men: 'Hommes',
  women: 'Femmes',
} as const;

export const TOURNAMENT_LEVELS = {
  beginner: 'Débutant',
  intermediate: 'Intermédiaire',
  advanced: 'Avancé',
} as const;

export const REGISTRATION_MODES = {
  team: 'Par équipe',
  solo: 'Solo',
  solo_positional: 'Solo avec postes',
  team_or_solo: 'Équipe ou solo',
} as const;

export const TOURNAMENT_STATUS = {
  draft: 'Brouillon',
  published: 'Publié',
  ongoing: 'En cours',
  completed: 'Terminé',
  cancelled: 'Annulé',
} as const;

export const REGISTRATION_STATUS = {
  pending: 'En attente',
  approved: 'Approuvé',
  rejected: 'Refusé',
  waitlisted: 'Liste d\'attente',
} as const;

export const GENDERS = {
  male: 'Homme',
  female: 'Femme',
  other: 'Autre',
} as const;

export const POSITIONS = {
  setter: 'Passeur',
  middle: 'Central',
  outside: 'Réceptionneur-Attaquant',
  opposite: 'Pointu',
  libero: 'Libéro',
} as const;

export const POSITION_LIMITS = {
  setter: 1,
  middle: 2,
  outside: 2,
  opposite: 1,
  libero: 1,
} as const;





