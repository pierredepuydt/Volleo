# Guide d'installation et de démarrage

Ce guide vous aidera à configurer et lancer l'application de gestion de tournois de volleyball.

## Prérequis

- **Node.js** version 18 ou supérieure
- **npm** ou **yarn**
- Un compte **Supabase** (gratuit) : https://supabase.com

## Étape 1 : Installation des dépendances

```bash
npm install
```

## Étape 2 : Configuration de Supabase

### 2.1 Créer un projet Supabase

1. Allez sur https://supabase.com
2. Créez un compte ou connectez-vous
3. Créez un nouveau projet
4. Attendez que le projet soit initialisé (1-2 minutes)

### 2.2 Créer la base de données

1. Dans votre projet Supabase, allez dans **SQL Editor** (dans le menu latéral)
2. Cliquez sur **New Query**
3. Copiez tout le contenu du fichier `supabase-schema.sql`
4. Collez-le dans l'éditeur SQL
5. Cliquez sur **Run** pour exécuter le script

Cela créera :
- Les tables nécessaires (profiles, tournaments, registrations)
- Les types personnalisés
- Les politiques de sécurité (Row Level Security)
- Les triggers automatiques

### 2.3 Configurer l'authentification

1. Dans Supabase, allez dans **Authentication** > **Providers**
2. Assurez-vous que **Email** est activé
3. (Optionnel) Vous pouvez désactiver la confirmation par email pour le développement :
   - Allez dans **Authentication** > **Settings**
   - Désactivez "Enable email confirmations"

## Étape 3 : Configuration des variables d'environnement

1. Copiez le fichier `.env.example` vers `.env.local` :

```bash
cp .env.example .env.local
```

2. Récupérez vos credentials Supabase :
   - Dans Supabase, allez dans **Settings** > **API**
   - Copiez l'URL du projet
   - Copiez la clé `anon/public`

3. Modifiez `.env.local` avec vos credentials :

```env
NEXT_PUBLIC_SUPABASE_URL=votre-url-supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre-cle-anon
```

## Étape 4 : Lancer l'application

```bash
npm run dev
```

L'application sera accessible sur http://localhost:3000

## Étape 5 : Créer votre premier compte

1. Allez sur http://localhost:3000
2. Cliquez sur **Inscription**
3. Remplissez le formulaire avec vos informations
4. Vous serez automatiquement connecté

## Fonctionnalités disponibles

### En tant qu'utilisateur connecté :

- **Créer un tournoi** : Cliquez sur "Créer un tournoi" dans le menu
- **S'inscrire à un tournoi** : Parcourez les tournois et cliquez sur "S'inscrire"
- **Gérer vos tournois** : Allez dans "Mes Tournois" pour voir :
  - Les tournois que vous avez créés
  - Les tournois auxquels vous participez
  - Vos inscriptions en attente

### En tant qu'organisateur :

- **Gérer les inscriptions** : Sur la page de votre tournoi, vous pouvez :
  - Voir toutes les inscriptions
  - Approuver ou refuser les inscriptions
  - Filtrer par statut
- **Éditer un tournoi** : Cliquez sur "Éditer" sur la page de votre tournoi
- **Tournois privés** : Créez un tournoi privé et partagez le lien avec token

## Structure des données

### Types de tournois
- **Indoor 6x6** : Volleyball en salle
- **Beach 2x2** : Beach volleyball

### Modes d'inscription
- **Par équipe** : L'organisateur crée une équipe complète
- **Solo** : Inscription individuelle
- **Solo avec postes** (6x6 uniquement) : Inscription par poste (passeur, central, etc.)
- **Équipe ou solo** (2x2 uniquement) : Permet les deux modes

### Statuts de tournoi
- **Brouillon** : Non publié, visible uniquement par l'organisateur
- **Publié** : Visible et ouvert aux inscriptions
- **En cours** : Le tournoi a commencé
- **Terminé** : Le tournoi est fini
- **Annulé** : Le tournoi est annulé

## Dépannage

### Problème : Erreur de connexion à Supabase

Vérifiez que :
- Vos credentials dans `.env.local` sont corrects
- Votre projet Supabase est bien actif
- Vous avez redémarré le serveur de dev après avoir modifié `.env.local`

### Problème : Erreur SQL lors de la création de la base

- Vérifiez que vous avez copié tout le contenu de `supabase-schema.sql`
- Essayez d'exécuter le script en plusieurs parties si nécessaire
- Vérifiez les logs d'erreur pour identifier la ligne problématique

### Problème : Impossible de créer un compte

- Vérifiez que l'authentification par email est activée dans Supabase
- Vérifiez les logs du serveur de développement
- Essayez de désactiver la confirmation par email (voir section 2.3)

## Commandes utiles

```bash
# Démarrer le serveur de développement
npm run dev

# Builder pour la production
npm run build

# Démarrer en mode production (après build)
npm start

# Linter le code
npm run lint

# Formater le code
npm run format
```

## Support

Pour toute question ou problème :
1. Vérifiez les logs du serveur de développement
2. Vérifiez les logs dans l'onglet Logs de Supabase
3. Consultez la documentation de Next.js : https://nextjs.org/docs
4. Consultez la documentation de Supabase : https://supabase.com/docs

## Prochaines étapes

Pour aller plus loin :
- Déployer sur Vercel (intégration native avec Supabase)
- Ajouter des images aux tournois
- Implémenter le système de paiement avec Stripe
- Ajouter une carte interactive pour la localisation
- Créer un système de gestion des matchs





