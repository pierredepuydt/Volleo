# 💳 Configuration du Système de Paiement Stripe

Ce guide explique comment configurer et utiliser le système de paiement Stripe intégré à Volleo.

## 📋 Table des matières

1. [Installation](#installation)
2. [Configuration de Supabase](#configuration-de-supabase)
3. [Configuration de Stripe](#configuration-de-stripe)
4. [Configuration des Variables d'Environnement](#configuration-des-variables-denvironnement)
5. [Configuration du Webhook](#configuration-du-webhook)
6. [Configuration du Cron Job](#configuration-du-cron-job)
7. [Test du Système](#test-du-système)
8. [Flux de Paiement](#flux-de-paiement)

---

## 🚀 Installation

Les packages Stripe sont déjà installés :
```bash
npm install stripe @stripe/stripe-js
```

---

## 🗄️ Configuration de Supabase

### 1. Exécuter les scripts SQL de migration

⚠️ **IMPORTANT** : La migration se fait en **2 parties** (à cause des contraintes PostgreSQL sur les types enum)

#### Étape 1 : Script PARTIE 1

1. Connectez-vous à votre projet Supabase
2. Allez dans **SQL Editor**
3. Copiez et exécutez **`supabase-payment-migration-part1.sql`**
4. ✅ Vous devriez voir : "PARTIE 1 terminée avec succès !"

#### Étape 2 : Attendre 5-10 secondes ⏰

PostgreSQL a besoin de commiter les nouvelles valeurs d'enum avant de pouvoir les utiliser.

#### Étape 3 : Script PARTIE 2

1. Après avoir attendu, exécutez **`supabase-payment-migration-part2.sql`**
2. ✅ Vous devriez voir : "Migration COMPLÈTE avec succès !"

**Ce que font les scripts :**
- ✅ PARTIE 1 : Colonnes, types enum, index, triggers
- ✅ PARTIE 2 : Fonctions et vues (qui utilisent les nouveaux types)

### 2. Obtenir la clé Service Role

1. Allez dans **Settings** > **API** dans votre projet Supabase
2. Copiez la clé **service_role** (⚠️ **PRIVÉE**, ne jamais exposer côté client)
3. Ajoutez-la à vos variables d'environnement (voir ci-dessous)

---

## 🎨 Configuration de Stripe

### 1. Créer un compte Stripe

1. Créez un compte sur [stripe.com](https://stripe.com)
2. Activez le mode **Test** pour les tests

### 2. Obtenir les clés API

1. Allez dans **Developers** > **API Keys**
2. Copiez :
   - **Publishable key** (pk_test_...) → pour le frontend
   - **Secret key** (sk_test_...) → pour le backend

### 3. Configurer le Webhook

1. Allez dans **Developers** > **Webhooks**
2. Cliquez sur **Add endpoint**
3. URL de l'endpoint : `https://votre-domaine.com/api/webhooks/stripe`
4. Sélectionnez les événements à écouter :
   - `checkout.session.completed`
   - `checkout.session.expired`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Cliquez sur **Add endpoint**
6. Copiez le **Signing secret** (whsec_...)

---

## ⚙️ Configuration des Variables d'Environnement

Créez ou modifiez votre fichier `.env.local` :

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://votreprojet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anon
SUPABASE_SERVICE_ROLE_KEY=votre_cle_service_role  # ⚠️ PRIVÉE

# Stripe
STRIPE_SECRET_KEY=sk_test_...                     # ⚠️ PRIVÉE
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...                   # ⚠️ PRIVÉE

# Application
NEXT_PUBLIC_SITE_URL=http://localhost:3000        # Ou votre domaine en production

# Cron Job (optionnel pour sécuriser le cron)
CRON_SECRET=votre_secret_aleatoire
```

### ⚠️ Important pour la Production

Sur Vercel (ou autre hébergeur) :
1. Allez dans **Settings** > **Environment Variables**
2. Ajoutez TOUTES les variables ci-dessus
3. Pour les variables secrètes, utilisez des valeurs de **PRODUCTION** :
   - `sk_live_...` au lieu de `sk_test_...`
   - Webhook secret de production

---

## 🔔 Configuration du Webhook

### En Développement Local

Pour tester les webhooks en local, utilisez Stripe CLI :

```bash
# Installer Stripe CLI
brew install stripe/stripe-cli/stripe

# Se connecter à votre compte
stripe login

# Écouter les webhooks localement
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Récupérer le webhook secret affiché et l'ajouter à .env.local
```

### En Production

Le webhook est automatiquement configuré via le dashboard Stripe (voir section précédente).

---

## ⏰ Configuration du Cron Job

Le système doit expirer automatiquement les paiements non effectués après 24h.

### Sur Vercel

1. Créez un fichier `vercel.json` à la racine :

```json
{
  "crons": [
    {
      "path": "/api/cron/expire-payments",
      "schedule": "*/30 * * * *"
    }
  ]
}
```

Ceci exécute le cron toutes les 30 minutes.

2. Ajoutez la variable `CRON_SECRET` dans Vercel :
   - Allez dans **Settings** > **Environment Variables**
   - Ajoutez `CRON_SECRET` avec une valeur aléatoire complexe
   - Vercel ajoutera automatiquement le header `authorization: Bearer ${CRON_SECRET}`

### Sur un autre hébergeur

Configurez un cron job externe qui appelle :
```bash
curl -X GET https://votre-domaine.com/api/cron/expire-payments \
  -H "Authorization: Bearer ${CRON_SECRET}"
```

---

## 🧪 Test du Système

### 1. Créer un Tournoi Payant

1. Connectez-vous en tant qu'organisateur
2. Créez un tournoi
3. Définissez un **prix** (ex: 10 €)
4. Publiez le tournoi

### 2. S'inscrire au Tournoi

1. Connectez-vous avec un autre compte (joueur)
2. Inscrivez-vous au tournoi
3. L'inscription est en statut `pending`

### 3. Accepter l'Inscription

1. Retournez sur le compte organisateur
2. Allez sur la page du tournoi
3. Acceptez l'inscription du joueur
4. ✅ L'inscription passe en `accepted_unpaid`
5. ✅ Une deadline de 24h est automatiquement créée

### 4. Effectuer le Paiement

1. Retournez sur le compte joueur
2. Vous devez voir le **bandeau de paiement** avec :
   - Le montant à payer
   - Le compte à rebours 24h
   - Le bouton "Payer maintenant"
3. Cliquez sur **Payer maintenant**
4. Vous êtes redirigé vers Stripe Checkout

### 5. Cartes de Test Stripe

Utilisez ces numéros de carte en mode test :

- **Succès** : `4242 4242 4242 4242`
- **Échec** : `4000 0000 0000 0002`
- **3D Secure** : `4000 0025 0000 3155`

Date d'expiration : N'importe quelle date future  
CVC : N'importe quels 3 chiffres

### 6. Vérifier le Webhook

Après le paiement :
1. ✅ Le webhook reçoit `checkout.session.completed`
2. ✅ L'inscription passe en `accepted_paid`
3. ✅ Le joueur voit "Participation confirmée"

---

## 🔄 Flux de Paiement Complet

### Schéma du Processus

```
1. Joueur s'inscrit → status: pending

2. Organisateur accepte → status: accepted_unpaid
   ├── Création automatique de payment_deadline (+24h)
   ├── Génération de la session Stripe (lors du clic "Payer")
   └── Bandeau de paiement affiché au joueur

3a. Joueur paie dans les 24h
    └── Webhook: checkout.session.completed
        └── status: accepted_paid ✅

3b. Joueur ne paie pas dans les 24h
    └── Cron job détecte l'expiration
        └── status: expired_unpaid ❌
            └── Place libérée

3c. Paiement échoue
    └── Webhook: payment_intent.payment_failed
        └── payment_status: failed
            └── Joueur peut réessayer jusqu'à la deadline
```

### Statuts Possibles

| Statut | Description |
|--------|-------------|
| `pending` | En attente de validation par l'organisateur |
| `accepted_unpaid` | Accepté, en attente de paiement (24h) |
| `accepted_paid` | Payé et confirmé ✅ |
| `expired_unpaid` | Non payé dans les 24h ❌ |
| `payment_failed` | Échec de paiement (peut réessayer) |
| `rejected` | Refusé par l'organisateur |
| `waitlisted` | En liste d'attente |

---

## 📧 Emails (TODO)

Le système prévoit l'envoi d'emails automatiques :

- ✉️ **Acceptation** : Lien de paiement + rappel deadline
- ⏰ **Rappel** : 12h avant expiration
- ✅ **Confirmation** : Paiement réussi
- ❌ **Expiration** : Délai dépassé
- ⚠️ **Échec** : Paiement échoué

Implémenter avec Resend, SendGrid, ou un autre service d'emailing.

---

## 🛡️ Sécurité

### Bonnes Pratiques

✅ **Clés Stripe** : Toujours server-side, jamais exposées  
✅ **Webhook** : Vérification de signature obligatoire  
✅ **RLS Supabase** : Politiques activées pour les paiements  
✅ **Cron Job** : Protégé par secret  
✅ **Service Role** : Utilisée uniquement côté serveur  

### Vérifications Côté Serveur

Toutes les opérations critiques sont vérifiées :
- ✅ Propriété de l'inscription
- ✅ Prix du tournoi existe
- ✅ Deadline non dépassée
- ✅ Statut correct

---

## 🆘 Dépannage

### Le webhook ne fonctionne pas

1. Vérifiez que `STRIPE_WEBHOOK_SECRET` est correct
2. Vérifiez les logs Stripe : **Developers** > **Webhooks** > **Attempts**
3. En local, utilisez `stripe listen`

### Le cron job ne s'exécute pas

1. Vérifiez `vercel.json` à la racine
2. Vérifiez que `CRON_SECRET` est défini
3. Consultez les logs Vercel : **Deployments** > **Functions**

### Les paiements ne s'enregistrent pas

1. Vérifiez les logs du webhook dans Vercel/Console
2. Vérifiez que `SUPABASE_SERVICE_ROLE_KEY` est correct
3. Vérifiez les politiques RLS Supabase

---

## 📊 Monitoring

### Dashboard Stripe

- Consultez tous les paiements : **Payments** > **All payments**
- Statistiques : **Payments** > **Graphs**
- Webhooks reçus : **Developers** > **Webhooks**

### Supabase

Requête pour voir les statistiques :

```sql
SELECT * FROM tournament_payment_stats
WHERE organizer_id = 'votre_user_id';
```

---

## 🎉 C'est Tout !

Votre système de paiement Stripe est maintenant configuré et fonctionnel !

Pour toute question, consultez :
- [Documentation Stripe](https://stripe.com/docs)
- [Documentation Supabase](https://supabase.com/docs)

