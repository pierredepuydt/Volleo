# 🎉 Système de Paiement Stripe - Implémenté

## ✅ Ce qui a été implémenté

### 1. **Base de Données** ✅
- ✅ Nouveaux champs dans `tournaments` : `price`
- ✅ Nouveaux statuts de paiement ajoutés
- ✅ Nouveaux champs dans `registrations` :
  - `stripe_session_id`
  - `stripe_payment_intent_id`
  - `payment_status`
  - `accepted_at`
  - `payment_deadline`
  - `paid_at`
- ✅ Script SQL complet : `supabase-payment-migration.sql`
- ✅ Fonctions et triggers automatiques
- ✅ Vue pour statistiques de paiement

### 2. **Backend - Routes API** ✅

#### `/api/payments/create-checkout-session` ✅
- Crée une session Stripe Checkout
- Vérifications de sécurité (propriétaire, deadline, prix)
- Réutilise la session si elle existe déjà
- Retourne l'URL de paiement Stripe

#### `/api/webhooks/stripe` ✅
- Reçoit les événements Stripe
- Gère :
  - `checkout.session.completed` → passage à `accepted_paid`
  - `checkout.session.expired` → passage à `expired_unpaid`
  - `payment_intent.succeeded`
  - `payment_intent.payment_failed`
- Utilise Supabase Service Role pour bypass RLS

#### `/api/cron/expire-payments` ✅
- Expire automatiquement les paiements non effectués
- Protégé par `CRON_SECRET`
- Compatible GET et POST
- Retourne le nombre d'inscriptions expirées

#### `/api/tournaments/[id]/delete` ✅
- Supprime un tournoi (fonctionnalité bonus)

### 3. **Frontend - Composants** ✅

#### `<PaymentBanner />` ✅
Composant complet qui affiche:
- ✅ **Bandeau de paiement** avec compte à rebours 24h
- ✅ **Bouton "Payer maintenant"** qui redirige vers Stripe
- ✅ **États multiples** :
  - `accepted_unpaid` → Bandeau bleu avec countdown
  - `accepted_paid` → Badge vert "Participation confirmée"
  - `expired_unpaid` → Alert rouge "Inscription expirée"
  - `payment_failed` → Alert orange avec bouton "Réessayer"
- ✅ **Compte à rebours en temps réel** (mise à jour chaque seconde)
- ✅ **Design moderne** avec dégradés et animations

### 4. **Types TypeScript** ✅
- ✅ Nouveaux types dans `database.types.ts` :
  - `PaymentStatus`
  - Nouveaux `RegistrationStatus` étendus
- ✅ Tous les champs de paiement typés

### 5. **Configuration** ✅
- ✅ Fichiers utilitaires Stripe :
  - `src/lib/stripe/server.ts` → pour backend
  - `src/lib/stripe/client.ts` → pour frontend
- ✅ `vercel.json` → Configuration du cron job
- ✅ Gestion gracieuse de l'absence de clés pendant le build

### 6. **Documentation** ✅
- ✅ `STRIPE_SETUP.md` → Guide complet de configuration
- ✅ `STRIPE_IMPLEMENTATION_SUMMARY.md` → Ce fichier
- ✅ Commentaires dans le code SQL

---

## 📋 Prochaines Étapes (À faire)

### 1. **Configuration Initiale** (OBLIGATOIRE)

#### A. Exécuter le script SQL
```sql
-- Dans l'éditeur SQL de Supabase
-- Coller et exécuter : supabase-payment-migration.sql
```

#### B. Configurer les variables d'environnement
Ajouter dans `.env.local` :
```bash
# Stripe (obtenir sur stripe.com)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Supabase Service Role (pour webhooks)
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Cron (générer une chaîne aléatoire)
CRON_SECRET=votre_secret_aleatoire

# Site URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

#### C. Configurer le Webhook Stripe
1. Aller sur Dashboard Stripe > Developers > Webhooks
2. Ajouter l'endpoint : `https://votre-domaine.com/api/webhooks/stripe`
3. Sélectionner les événements (voir STRIPE_SETUP.md)
4. Copier le `signing secret`

### 2. **Intégration dans l'Interface** (TODO)

#### A. Modifier le formulaire de création de tournoi
Ajouter un champ "Prix" dans `src/app/tournois/creer/create-tournament-form.tsx`:
```tsx
<div className="space-y-2">
  <Label htmlFor="price">Prix d'inscription (€) - Optionnel</Label>
  <Input
    id="price"
    type="number"
    step="0.01"
    min="0"
    placeholder="0.00 (gratuit)"
    {...register('price')}
  />
  <p className="text-xs text-muted-foreground">
    Laissez vide pour un tournoi gratuit
  </p>
</div>
```

#### B. Modifier le formulaire d'édition
Même chose dans `src/app/tournois/[id]/editer/edit-tournament-form.tsx`

#### C. Intégrer PaymentBanner sur la page du tournoi
Dans `src/app/tournois/[id]/page.tsx` ou le composant de détail :
```tsx
import { PaymentBanner } from '@/components/payment-banner';

// Dans le composant, après avoir récupéré l'inscription
{userRegistration && tournament.price && (
  <PaymentBanner
    registration={userRegistration}
    tournamentPrice={tournament.price}
    tournamentTitle={tournament.title}
  />
)}
```

#### D. Modifier la logique d'acceptation
Dans le composant qui gère l'acceptation des inscriptions, changer le statut de `approved` à `accepted_unpaid` si le tournoi a un prix :
```tsx
const newStatus = tournament.price > 0 ? 'accepted_unpaid' : 'approved';
const acceptedAt = new Date().toISOString();
const paymentDeadline = tournament.price > 0 
  ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  : null;

await supabase
  .from('registrations')
  .update({ 
    status: newStatus,
    accepted_at: acceptedAt,
    payment_deadline: paymentDeadline
  })
  .eq('id', registrationId);
```

#### E. Afficher le statut de paiement côté organisateur
Dans `src/app/tournois/[id]/registrations-list.tsx`, ajouter une colonne "Paiement" :
```tsx
{registration.status === 'accepted_paid' && <Badge>Payé</Badge>}
{registration.status === 'accepted_unpaid' && <Badge variant="warning">En attente</Badge>}
{registration.status === 'expired_unpaid' && <Badge variant="destructive">Expiré</Badge>}
```

### 3. **Système d'Emails** (TODO)

Implémenter l'envoi d'emails avec Resend, SendGrid ou autre :

#### A. Installation
```bash
npm install resend
```

#### B. Créer le service d'email
```typescript
// src/lib/email/send-payment-reminder.ts
export async function sendPaymentReminder(registration, tournament) {
  // Email avec lien de paiement
}

export async function sendPaymentConfirmation(registration, tournament) {
  // Email de confirmation
}

export async function sendPaymentExpired(registration, tournament) {
  // Email d'expiration
}
```

#### C. Intégrer dans les webhooks
Dans `src/app/api/webhooks/stripe/route.ts`, appeler ces fonctions.

### 4. **Tests** (TODO)

#### A. Tests Locaux
1. Utiliser Stripe CLI pour les webhooks locaux
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

2. Tester avec cartes de test Stripe :
- `4242 4242 4242 4242` → Succès
- `4000 0000 0000 0002` → Échec

#### B. Tests End-to-End
1. Créer un tournoi payant (10€)
2. S'inscrire avec un autre compte
3. Accepter l'inscription (organisateur)
4. Vérifier le bandeau de paiement
5. Effectuer le paiement
6. Vérifier le statut `accepted_paid`

### 5. **Production** (TODO)

#### A. Sur Vercel
1. Ajouter toutes les variables d'environnement (avec clés LIVE)
2. Le cron sera automatiquement activé via `vercel.json`

#### B. Webhook en Production
1. URL: `https://votre-domaine.com/api/webhooks/stripe`
2. Utiliser le `signing secret` de production

---

## 🎯 Flux Complet

```
┌─────────────────────────────────────────────────────────┐
│ 1. Organisateur crée tournoi avec PRIX (ex: 10€)       │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ 2. Joueur s'inscrit → status: pending                  │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ 3. Organisateur accepte → status: accepted_unpaid      │
│    - accepted_at = NOW()                                │
│    - payment_deadline = accepted_at + 24h               │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ 4. Joueur voit BANDEAU avec compte à rebours            │
│    - Prix: 10€                                          │
│    - Temps restant: 23h 59m 30s                         │
│    - Bouton: "Payer maintenant"                         │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ 5. Joueur clique → API crée session Stripe              │
│    - POST /api/payments/create-checkout-session         │
│    - Redirige vers Stripe Checkout                      │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ 6a. PAIEMENT RÉUSSI                                     │
│     - Webhook: checkout.session.completed               │
│     - status: accepted_paid ✅                          │
│     - paid_at: NOW()                                    │
│     - Email: Confirmation envoyé                        │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ 6b. DÉLAI EXPIRÉ (24h sans paiement)                    │
│     - Cron job détecte expiration                       │
│     - status: expired_unpaid ❌                         │
│     - Place libérée                                     │
│     - Email: Expiration envoyé                          │
└─────────────────────────────────────────────────────────┘
```

---

## 📊 Statuts de Registration

| Statut | Description | Action utilisateur |
|--------|-------------|-------------------|
| `pending` | En attente validation | Attendre |
| `accepted_unpaid` | Accepté, doit payer sous 24h | **Payer** |
| `accepted_paid` | Payé et confirmé | ✅ Inscrit |
| `expired_unpaid` | Délai dépassé | Réinscrire |
| `payment_failed` | Paiement échoué | Réessayer |
| `rejected` | Refusé par organisateur | - |
| `waitlisted` | Liste d'attente | Attendre |

---

## 🔒 Sécurité

✅ **Toutes les clés Stripe** : Server-side uniquement  
✅ **Webhook** : Signature vérifiée  
✅ **RLS Supabase** : Politiques activées  
✅ **Service Role** : Utilisée uniquement côté serveur  
✅ **Cron** : Protégé par secret  
✅ **Vérifications** : Propriétaire, prix, deadline  

---

## 📝 Fichiers Créés

### Backend
- `src/lib/stripe/server.ts`
- `src/lib/stripe/client.ts`
- `src/app/api/payments/create-checkout-session/route.ts`
- `src/app/api/webhooks/stripe/route.ts`
- `src/app/api/cron/expire-payments/route.ts`

### Frontend
- `src/components/payment-banner.tsx`

### Base de Données
- `supabase-payment-migration.sql`

### Configuration
- `vercel.json`

### Documentation
- `STRIPE_SETUP.md`
- `STRIPE_IMPLEMENTATION_SUMMARY.md`

### Types
- `src/types/database.types.ts` (modifié)

---

## 🎨 Design du Bandeau de Paiement

Le `<PaymentBanner />` est moderne et complet :
- 🎨 **Dégradé bleu** pour l'état "en attente de paiement"
- ⏱️ **Compte à rebours dynamique** (mise à jour en temps réel)
- 💳 **Bouton CTA** bien visible
- ✅ **Badge vert** pour "Participation confirmée"
- ❌ **Alert rouge** pour "Inscription expirée"
- ⚠️ **Alert orange** pour "Paiement échoué"

---

## 🚀 Pour Déployer

1. ✅ **Exécuter** le script SQL dans Supabase
2. ✅ **Configurer** les variables d'environnement
3. ✅ **Configurer** le webhook Stripe
4. ✅ **Intégrer** le composant PaymentBanner
5. ✅ **Modifier** la logique d'acceptation
6. ✅ **Ajouter** le champ prix aux formulaires
7. ✅ **Tester** en local avec Stripe CLI
8. ✅ **Déployer** sur Vercel
9. ✅ **Configurer** le webhook en production

---

## 💡 Améliorations Futures

- [ ] Système de remboursement
- [ ] Paiements en plusieurs fois
- [ ] Codes promo / réductions
- [ ] Statistiques de revenus pour organisateurs
- [ ] Export comptable
- [ ] Factures PDF automatiques
- [ ] Rappels par email (12h avant expiration)
- [ ] Webhooks pour notifications Discord/Slack

---

## 🆘 Support

Consultez `STRIPE_SETUP.md` pour :
- Guide complet de configuration
- Test avec cartes Stripe
- Dépannage
- FAQ

---

**✨ Le système de paiement Stripe est prêt ! Il ne reste plus qu'à configurer et intégrer dans l'interface.**

