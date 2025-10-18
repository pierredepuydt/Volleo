# 🔄 Alternatives au Cron Vercel

## ✅ Solution Implémentée : Expiration à la Demande

Au lieu d'utiliser un cron Vercel (qui peut être problématique), j'ai implémenté une solution plus simple et fiable :

### 🎯 Comment ça fonctionne maintenant

1. **Expiration automatique lors des interactions utilisateur**
   - Quand un joueur essaie de payer → vérification automatique de l'expiration
   - Quand un joueur consulte sa page → vérification automatique
   - Quand l'organisateur consulte les inscriptions → vérification automatique

2. **API manuelle pour expirer en lot**
   - Route : `/api/payments/expire`
   - Peut être appelée par un service externe (Uptime Robot, etc.)
   - Sécurisée avec `CRON_SECRET`

3. **Fonction PostgreSQL automatique**
   - La fonction `expire_unpaid_registrations()` existe toujours
   - Elle est appelée à la demande au lieu d'être programmée

---

## 🚀 Avantages de cette approche

### ✅ Plus fiable
- Pas de dépendance aux crons Vercel
- Fonctionne même si Vercel a des problèmes de cron
- Pas de limite de temps d'exécution

### ✅ Plus simple
- Pas de configuration cron complexe
- Pas de gestion des timeouts
- Moins de points de défaillance

### ✅ Plus efficace
- Expiration seulement quand nécessaire
- Pas d'exécution inutile toutes les heures
- Réponse immédiate à l'utilisateur

---

## 🔧 Configuration

### Variables d'environnement nécessaires
```bash
# Stripe
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Supabase
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Optionnel : pour sécuriser l'API d'expiration
CRON_SECRET=your_random_secret
```

### Appel manuel de l'expiration (optionnel)
```bash
# Développement
curl http://localhost:3000/api/payments/expire

# Production (avec authentification)
curl -X POST https://your-app.vercel.app/api/payments/expire \
  -H "Authorization: Bearer your_cron_secret"
```

---

## 🔄 Alternatives externes (si besoin)

Si vous voulez quand même une expiration programmée, voici des alternatives :

### 1. Uptime Robot (gratuit)
- Créez un monitor qui appelle `/api/payments/expire` toutes les heures
- URL : `https://your-app.vercel.app/api/payments/expire`
- Headers : `Authorization: Bearer your_cron_secret`

### 2. GitHub Actions (gratuit)
```yaml
name: Expire Payments
on:
  schedule:
    - cron: '0 * * * *'  # Toutes les heures
jobs:
  expire:
    runs-on: ubuntu-latest
    steps:
      - name: Call expire API
        run: |
          curl -X POST https://your-app.vercel.app/api/payments/expire \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}"
```

### 3. Netlify Functions (si vous migrez)
- Plus fiable que Vercel pour les crons
- Configuration similaire

---

## ✅ Résultat

- ❌ **Supprimé** : `vercel.json`, `/api/cron/expire-payments/`
- ✅ **Ajouté** : `/api/payments/expire`, `src/lib/payment-utils.ts`
- ✅ **Amélioré** : Expiration automatique lors des interactions
- ✅ **Sécurisé** : API protégée par secret optionnel

Le système fonctionne maintenant sans cron et est plus fiable ! 🎉
