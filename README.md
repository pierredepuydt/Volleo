# Volleyball Tournament Manager

Application Next.js pour créer et gérer des tournois de volley (indoor 6x6 et beach 2x2).

## 🚀 Démarrage rapide

**Voir le fichier [SETUP.md](./SETUP.md) pour un guide d'installation détaillé étape par étape.**

## 📋 Stack Technique

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Database & Auth**: Supabase (PostgreSQL + Auth)
- **Forms**: React Hook Form + Zod
- **Validation**: Zod schemas

## ✨ Fonctionnalités

### MVP (Minimum Viable Product) ✅

- ✅ **Authentification** : Email + mot de passe via Supabase Auth
- ✅ **Création de tournois** : Indoor 6x6 et Beach 2x2
- ✅ **Modes d'inscription flexibles** :
  - Par équipe (avec noms des joueurs pour beach 2x2)
  - Solo simple
  - Solo avec postes pour indoor 6x6 (passeur, central, réceptionneur, pointu, libéro)
  - Mode mixte équipe ou solo
- ✅ **Gestion des inscriptions** : Approbation manuelle par l'organisateur
- ✅ **Tournois publics et privés** : Partage via lien avec token d'accès unique
- ✅ **Dashboard "Mes tournois"** :
  - Tournois créés (brouillons, publiés, en cours, historique)
  - Participations (approuvées, en attente)
- ✅ **Suggestions personnalisées** : Basées sur le niveau, sexe et ville de l'utilisateur
- ✅ **Profil utilisateur** : Gestion des informations personnelles
- ✅ **UI moderne** : Design responsive avec Tailwind CSS et shadcn/ui

### Hors scope MVP (Futures fonctionnalités)

- Gestion des matchs et calendrier des rencontres
- Paiement en ligne (Stripe)
- Carte interactive pour la localisation
- Notifications par email
- Chat entre participants
- Système de notation des joueurs

## 🏗️ Structure du Projet

```
volleyball-tournament-app/
├── src/
│   ├── app/                          # App Router (Next.js 14+)
│   │   ├── auth/                     # Pages d'authentification
│   │   │   ├── connexion/            # Page de connexion
│   │   │   ├── inscription/          # Page d'inscription
│   │   │   └── signout/              # Route de déconnexion
│   │   ├── tournois/
│   │   │   ├── [id]/                 # Détail + inscription tournoi
│   │   │   │   ├── editer/           # Édition tournoi
│   │   │   │   ├── page.tsx
│   │   │   │   ├── tournament-detail.tsx
│   │   │   │   ├── registration-form.tsx
│   │   │   │   └── registrations-list.tsx
│   │   │   └── creer/                # Création de tournoi
│   │   ├── mes-tournois/             # Dashboard utilisateur
│   │   ├── profil/                   # Page profil
│   │   ├── layout.tsx                # Layout principal
│   │   ├── page.tsx                  # Page d'accueil
│   │   ├── globals.css               # Styles globaux
│   │   └── not-found.tsx             # Page 404
│   ├── components/
│   │   ├── ui/                       # Composants shadcn/ui
│   │   ├── navigation.tsx            # Navigation principale
│   │   └── tournament-list.tsx       # Liste des tournois
│   ├── lib/
│   │   ├── supabase/                 # Configuration Supabase
│   │   │   ├── client.ts             # Client browser
│   │   │   ├── server.ts             # Client serveur
│   │   │   └── middleware.ts         # Middleware auth
│   │   ├── utils.ts                  # Utilitaires
│   │   └── constants.ts              # Constantes de l'app
│   └── types/
│       └── database.types.ts         # Types TypeScript pour la DB
├── middleware.ts                      # Middleware Next.js
├── supabase-schema.sql               # Schéma de base de données
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
├── SETUP.md                          # Guide d'installation détaillé
└── README.md                         # Ce fichier
```

## 🗄️ Schéma de Base de Données

### Tables principales

#### `profiles`
Extension du système auth de Supabase avec informations complémentaires :
- Prénom, nom, téléphone
- Genre, niveau, ville (pour suggestions personnalisées)

#### `tournaments`
- Informations générales (titre, description, dates)
- Type : variant (indoor/beach), catégorie (mixte/homme/femme), niveau
- Mode d'inscription (team/solo/solo_positional/team_or_solo)
- Localisation (adresse, ville, code postal, pays)
- Visibilité (public/privé avec token)
- Statut (draft/published/ongoing/completed/cancelled)

#### `registrations`
- Lien vers tournoi et utilisateur
- Informations du participant (nom, email, téléphone, genre, niveau)
- Poste (pour 6x6 avec inscription par poste)
- Nom d'équipe et coéquipiers (pour inscriptions par équipe)
- Statut (pending/approved/rejected/waitlisted)

### Sécurité (Row Level Security)

- Les utilisateurs ne peuvent voir que leurs propres données sensibles
- Les tournois publics sont visibles par tous
- Les tournois privés nécessitent le token ou d'être l'organisateur
- Les organisateurs peuvent gérer les inscriptions à leurs tournois
- Politiques détaillées dans `supabase-schema.sql`

## 🎯 Règles Métier

### Variants et catégories

- **Indoor 6x6** : Volleyball en salle, 6 joueurs par équipe
  - Postes : passeur (1), centraux (2), réceptionneurs-attaquants (2), pointu (1), libéro (1)
- **Beach 2x2** : Beach volleyball, 2 joueurs par équipe
  - Pas de postes spécifiques

- **Catégories** : Mixte, Hommes, Femmes
- **Niveaux** : Débutant, Intermédiaire, Avancé

### Modes d'inscription

1. **Par équipe** :
   - Pour 6x6 : Inscription de l'équipe complète
   - Pour 2x2 : Inscription avec les noms des deux joueurs

2. **Solo** :
   - Inscription individuelle
   - L'organisateur forme les équipes

3. **Solo avec postes** (6x6 uniquement) :
   - Inscription par poste spécifique
   - Waiting list par poste
   - L'organisateur approuve par poste

4. **Équipe ou solo** (2x2 uniquement) :
   - Permet les deux modes
   - Flexibilité maximale

### Validation des inscriptions

- **Toujours avec approbation** de l'organisateur
- Pas d'auto-acceptation dans le MVP
- Statuts : pending → approved/rejected/waitlisted

## 🛠️ Commandes

```bash
# Installation
npm install

# Développement
npm run dev              # Démarre le serveur (http://localhost:3000)

# Production
npm run build            # Build de production
npm start                # Lance le build

# Code quality
npm run lint             # ESLint
npm run format           # Prettier (formatage)
```

## 🚀 Déploiement

### Vercel (Recommandé)

1. Pushez votre code sur GitHub
2. Importez le projet sur Vercel
3. Ajoutez les variables d'environnement
4. Déployez !

Vercel s'intègre parfaitement avec Next.js et Supabase.

### Autres plateformes

L'application peut être déployée sur toute plateforme supportant Next.js :
- Netlify
- Railway
- AWS Amplify
- Etc.

## 📝 Développement

### Ajouter un nouveau composant shadcn/ui

Les composants sont déjà inclus. Pour en ajouter d'autres :

```bash
# Exemple : ajouter le composant Dialog
npx shadcn-ui@latest add dialog
```

### Modifier le schéma de base de données

1. Modifiez `supabase-schema.sql`
2. Exécutez les migrations dans Supabase SQL Editor
3. Mettez à jour les types dans `src/types/database.types.ts`

### Conventions de code

- **TypeScript strict** activé
- **ESLint** configuré avec next/core-web-vitals
- **Prettier** pour le formatage uniforme
- **Server Components** par défaut (Next.js App Router)
- **Client Components** uniquement quand nécessaire ('use client')

## 🤝 Contribution

Pour contribuer au projet :

1. Forkez le repository
2. Créez une branche (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add AmazingFeature'`)
4. Pushez vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📄 Licence

Ce projet est sous licence MIT.

## 🙋 Support

Pour toute question :
- Consultez [SETUP.md](./SETUP.md) pour l'installation
- Vérifiez les logs du serveur de développement
- Consultez la [documentation Next.js](https://nextjs.org/docs)
- Consultez la [documentation Supabase](https://supabase.com/docs)

---

Développé avec ❤️ pour la communauté de volleyball

