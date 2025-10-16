// Banque de 20 images prédéfinies pour les tournois de volleyball
// Images optimisées depuis Unsplash

export interface TournamentImage {
  id: string;
  url: string;
  thumbnail: string;
  category: 'beach' | 'indoor' | 'mixed';
  description: string;
}

export const TOURNAMENT_IMAGES: TournamentImage[] = [
  // Beach Volleyball (8 images)
  {
    id: 'beach-1',
    url: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=800&auto=format&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=200&auto=format&fit=crop',
    category: 'beach',
    description: 'Match de beach volley au coucher du soleil',
  },
  {
    id: 'beach-2',
    url: 'https://images.unsplash.com/photo-1592656094267-764a45160876?w=800&auto=format&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1592656094267-764a45160876?w=200&auto=format&fit=crop',
    category: 'beach',
    description: 'Joueurs de beach volley en action',
  },
  {
    id: 'beach-3',
    url: 'https://images.unsplash.com/photo-1594623930572-300a3011d9ae?w=800&auto=format&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1594623930572-300a3011d9ae?w=200&auto=format&fit=crop',
    category: 'beach',
    description: 'Terrain de beach volley vue du ciel',
  },
  {
    id: 'beach-4',
    url: 'https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?w=800&auto=format&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?w=200&auto=format&fit=crop',
    category: 'beach',
    description: 'Service au beach volleyball',
  },
  {
    id: 'beach-5',
    url: 'https://images.unsplash.com/photo-1593699584318-65b8f21f2685?w=800&auto=format&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1593699584318-65b8f21f2685?w=200&auto=format&fit=crop',
    category: 'beach',
    description: 'Plage de volleyball avec palmiers',
  },
  {
    id: 'beach-6',
    url: 'https://images.unsplash.com/photo-1622163642998-1ea32b0bbc67?w=800&auto=format&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1622163642998-1ea32b0bbc67?w=200&auto=format&fit=crop',
    category: 'beach',
    description: 'Action intense au beach volley',
  },
  {
    id: 'beach-7',
    url: 'https://images.unsplash.com/photo-1628974538623-6f2c1c325278?w=800&auto=format&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1628974538623-6f2c1c325278?w=200&auto=format&fit=crop',
    category: 'beach',
    description: 'Terrain de beach avec filet orange',
  },
  {
    id: 'beach-8',
    url: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&auto=format&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=200&auto=format&fit=crop',
    category: 'beach',
    description: 'Compétition de beach volleyball',
  },

  // Indoor Volleyball (8 images)
  {
    id: 'indoor-1',
    url: 'https://images.unsplash.com/photo-1612872087865-6f7e4e3f83f8?w=800&auto=format&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1612872087865-6f7e4e3f83f8?w=200&auto=format&fit=crop',
    category: 'indoor',
    description: 'Match de volleyball en salle',
  },
  {
    id: 'indoor-2',
    url: 'https://images.unsplash.com/photo-1593699584318-65b8f21f2684?w=800&auto=format&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1593699584318-65b8f21f2684?w=200&auto=format&fit=crop',
    category: 'indoor',
    description: 'Smash puissant en intérieur',
  },
  {
    id: 'indoor-3',
    url: 'https://images.unsplash.com/photo-1547347298-4074aaf5f7a1?w=800&auto=format&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1547347298-4074aaf5f7a1?w=200&auto=format&fit=crop',
    category: 'indoor',
    description: 'Équipe de volleyball indoor',
  },
  {
    id: 'indoor-4',
    url: 'https://images.unsplash.com/photo-1590603696084-5eab42687ce4?w=800&auto=format&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1590603696084-5eab42687ce4?w=200&auto=format&fit=crop',
    category: 'indoor',
    description: 'Gymnase de volleyball professionnel',
  },
  {
    id: 'indoor-5',
    url: 'https://images.unsplash.com/photo-1612872087720-5e5a3d5f4e88?w=800&auto=format&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1612872087720-5e5a3d5f4e88?w=200&auto=format&fit=crop',
    category: 'indoor',
    description: 'Défense en volleyball',
  },
  {
    id: 'indoor-6',
    url: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&auto=format&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=200&auto=format&fit=crop',
    category: 'indoor',
    description: 'Contre au filet',
  },
  {
    id: 'indoor-7',
    url: 'https://images.unsplash.com/photo-1587280501635-68a0e82cd5fe?w=800&auto=format&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1587280501635-68a0e82cd5fe?w=200&auto=format&fit=crop',
    category: 'indoor',
    description: 'Terrain indoor vu de haut',
  },
  {
    id: 'indoor-8',
    url: 'https://images.unsplash.com/photo-1622163642998-1ea32b0bbc66?w=800&auto=format&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1622163642998-1ea32b0bbc66?w=200&auto=format&fit=crop',
    category: 'indoor',
    description: 'Ambiance de match indoor',
  },

  // Mixed / General (4 images)
  {
    id: 'mixed-1',
    url: 'https://images.unsplash.com/photo-1628974538623-5f2c1c325279?w=800&auto=format&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1628974538623-5f2c1c325279?w=200&auto=format&fit=crop',
    category: 'mixed',
    description: 'Équipe mixte de volleyball',
  },
  {
    id: 'mixed-2',
    url: 'https://images.unsplash.com/photo-1626224583765-f87db24ac4eb?w=800&auto=format&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1626224583765-f87db24ac4eb?w=200&auto=format&fit=crop',
    category: 'mixed',
    description: 'Esprit d\'équipe au volleyball',
  },
  {
    id: 'mixed-3',
    url: 'https://images.unsplash.com/photo-1612872087853-f1e7f8fae25c?w=800&auto=format&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1612872087853-f1e7f8fae25c?w=200&auto=format&fit=crop',
    category: 'mixed',
    description: 'Célébration après un point',
  },
  {
    id: 'mixed-4',
    url: 'https://images.unsplash.com/photo-1590603696084-5eab42687ce5?w=800&auto=format&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1590603696084-5eab42687ce5?w=200&auto=format&fit=crop',
    category: 'mixed',
    description: 'Préparation avant le match',
  },
];

// Fonction helper pour obtenir une image par défaut selon le type de tournoi
export function getDefaultImageByVariant(variant: 'indoor_6x6' | 'beach_2x2'): string {
  if (variant === 'beach_2x2') {
    return TOURNAMENT_IMAGES.find(img => img.id === 'beach-1')?.url || TOURNAMENT_IMAGES[0].url;
  }
  return TOURNAMENT_IMAGES.find(img => img.id === 'indoor-1')?.url || TOURNAMENT_IMAGES[8].url;
}

// Fonction pour filtrer les images par catégorie
export function getImagesByCategory(category: 'beach' | 'indoor' | 'mixed' | 'all' = 'all'): TournamentImage[] {
  if (category === 'all') {
    return TOURNAMENT_IMAGES;
  }
  return TOURNAMENT_IMAGES.filter(img => img.category === category);
}

// Fonction pour obtenir une image aléatoire
export function getRandomImage(category?: 'beach' | 'indoor' | 'mixed'): TournamentImage {
  const images = category ? getImagesByCategory(category) : TOURNAMENT_IMAGES;
  return images[Math.floor(Math.random() * images.length)];
}

