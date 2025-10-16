# 🗄️ Instructions de Migration - Système de Paiement Stripe

## ⚠️ IMPORTANT : Migration en 2 Parties

La migration de la base de données doit se faire en **2 étapes** à cause d'une contrainte PostgreSQL :  
Les nouvelles valeurs d'enum doivent être commitées avant d'être utilisées dans des vues ou fonctions.

---

## 📋 Procédure

### Étape 1 : Exécuter PARTIE 1 ⚙️

1. **Connectez-vous** à votre projet Supabase
2. Allez dans **SQL Editor** (icône `</>` dans la barre latérale)
3. Cliquez sur **New Query**
4. **Copiez tout le contenu** de `supabase-payment-migration-part1.sql`
5. **Collez** dans l'éditeur SQL
6. Cliquez sur **RUN** (ou `Ctrl+Enter`)

✅ **Résultat attendu** :
```
NOTICE: ✅ PARTIE 1 terminée avec succès !
NOTICE: ⏰ Attendez 5-10 secondes avant d'exécuter la PARTIE 2
NOTICE: 📄 Fichier: supabase-payment-migration-part2.sql
```

---

### Étape 2 : ATTENDRE ⏰

⚠️ **Attendez 5 à 10 secondes** avant de continuer.

Cette pause permet à PostgreSQL de **commiter** les nouvelles valeurs d'enum dans la base de données.

Vous pouvez :
- ☕ Prendre un café
- 📖 Lire la suite de STRIPE_SETUP.md
- 🎵 Écouter une chanson de 10 secondes

---

### Étape 3 : Exécuter PARTIE 2 🎯

1. Toujours dans **SQL Editor**
2. Cliquez sur **New Query** (ou effacez la requête précédente)
3. **Copiez tout le contenu** de `supabase-payment-migration-part2.sql`
4. **Collez** dans l'éditeur SQL
5. Cliquez sur **RUN**

✅ **Résultat attendu** :
```
NOTICE: ✅ Migration COMPLÈTE avec succès !
NOTICE: 
NOTICE: 🎉 Le système de paiement Stripe est maintenant configuré.
NOTICE: 
NOTICE: ⚙️  Prochaines étapes :
NOTICE: 1. Configurer les variables d'environnement :
...
```

---

## ✅ Vérification

Pour vérifier que la migration a réussi, exécutez dans SQL Editor :

```sql
-- Vérifier que les nouvelles colonnes existent
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'registrations' 
AND column_name IN ('stripe_session_id', 'payment_status', 'payment_deadline');

-- Vérifier les nouveaux statuts d'enum
SELECT enumlabel 
FROM pg_enum 
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'registration_status')
ORDER BY enumlabel;

-- Vérifier la vue
SELECT * FROM tournament_payment_stats LIMIT 1;
```

**Résultats attendus :**
- ✅ 3 colonnes trouvées pour registrations
- ✅ Les statuts incluent : `accepted_paid`, `accepted_unpaid`, `expired_unpaid`, `payment_failed`
- ✅ La vue `tournament_payment_stats` existe (même si vide au début)

---

## 🚨 En cas d'erreur

### Erreur : "enum value already exists"

➡️ **Solution** : C'est normal si vous ré-exécutez le script. Les `IF NOT EXISTS` gèrent cela.

### Erreur : "unsafe use of new value"

➡️ **Solution** : Vous n'avez pas attendu assez longtemps entre PARTIE 1 et PARTIE 2.
- Attendez encore 10 secondes
- Ré-exécutez uniquement la PARTIE 2

### Erreur : "column already exists"

➡️ **Solution** : Les colonnes ont déjà été ajoutées. Passez directement à la PARTIE 2.

### Autre erreur

➡️ **Solution** : 
1. Vérifiez que vous utilisez PostgreSQL (Supabase utilise PostgreSQL 15+)
2. Vérifiez que vous avez les droits suffisants
3. Consultez les logs complets dans l'éditeur SQL

---

## 📝 Rollback (Annulation)

Si vous voulez annuler la migration :

```sql
-- Supprimer les colonnes ajoutées
ALTER TABLE tournaments DROP COLUMN IF EXISTS price;

ALTER TABLE registrations 
  DROP COLUMN IF EXISTS stripe_session_id,
  DROP COLUMN IF EXISTS stripe_payment_intent_id,
  DROP COLUMN IF EXISTS payment_status,
  DROP COLUMN IF EXISTS accepted_at,
  DROP COLUMN IF EXISTS payment_deadline,
  DROP COLUMN IF EXISTS paid_at;

-- Supprimer les fonctions et vues
DROP VIEW IF EXISTS tournament_payment_stats;
DROP FUNCTION IF EXISTS expire_unpaid_registrations();
DROP FUNCTION IF EXISTS set_payment_deadline();
DROP TRIGGER IF EXISTS trigger_set_payment_deadline ON registrations;

-- Note: Les valeurs d'enum ne peuvent pas être facilement supprimées
-- Il faudrait recréer le type enum complet, ce qui nécessite de supprimer
-- toutes les colonnes qui l'utilisent d'abord.
```

---

## 🎯 Prochaines étapes

Une fois la migration terminée :

1. ✅ Consultez **STRIPE_SETUP.md** pour configurer Stripe
2. ✅ Ajoutez les variables d'environnement
3. ✅ Configurez le webhook Stripe
4. ✅ Testez le système de paiement

---

**Bon courage ! 🚀**

