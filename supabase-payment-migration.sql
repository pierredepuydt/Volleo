-- Migration pour ajouter le système de paiement Stripe
-- À exécuter dans l'éditeur SQL de Supabase
-- 
-- ⚠️ IMPORTANT: Ce script doit être exécuté en DEUX PARTIES
-- PARTIE 1: Ajouter les nouveaux types enum et les colonnes (lignes 1-90)
-- PARTIE 2: Créer les vues et fonctions (lignes 92-fin)
-- Entre les deux, attendre quelques secondes pour que les valeurs d'enum soient commitées

-- ============================================================================
-- PARTIE 1: MODIFICATIONS DE SCHÉMA
-- Exécutez cette partie en premier, puis attendez 5 secondes
-- ============================================================================

-- 1. Ajouter le champ price aux tournaments
ALTER TABLE tournaments
ADD COLUMN IF NOT EXISTS price NUMERIC(10, 2) DEFAULT NULL;

COMMENT ON COLUMN tournaments.price IS 'Prix d''inscription en euros (null = gratuit)';

-- 2. Ajouter les nouveaux statuts de registration
-- Modifier le type enum pour inclure les nouveaux statuts
DO $$ 
BEGIN
  -- Vérifier et ajouter 'accepted_unpaid'
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'accepted_unpaid' 
    AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'registration_status')
  ) THEN
    ALTER TYPE registration_status ADD VALUE 'accepted_unpaid';
  END IF;

  -- Vérifier et ajouter 'accepted_paid'
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'accepted_paid' 
    AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'registration_status')
  ) THEN
    ALTER TYPE registration_status ADD VALUE 'accepted_paid';
  END IF;

  -- Vérifier et ajouter 'expired_unpaid'
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'expired_unpaid' 
    AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'registration_status')
  ) THEN
    ALTER TYPE registration_status ADD VALUE 'expired_unpaid';
  END IF;

  -- Vérifier et ajouter 'payment_failed'
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'payment_failed' 
    AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'registration_status')
  ) THEN
    ALTER TYPE registration_status ADD VALUE 'payment_failed';
  END IF;
END $$;

-- 3. Ajouter les champs de paiement aux registrations
ALTER TABLE registrations
ADD COLUMN IF NOT EXISTS stripe_session_id TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT NULL CHECK (payment_status IN ('pending', 'completed', 'failed', 'expired')),
ADD COLUMN IF NOT EXISTS accepted_at TIMESTAMPTZ DEFAULT NULL,
ADD COLUMN IF NOT EXISTS payment_deadline TIMESTAMPTZ DEFAULT NULL,
ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ DEFAULT NULL;

-- 4. Ajouter des commentaires pour la documentation
COMMENT ON COLUMN registrations.stripe_session_id IS 'ID de la session Stripe Checkout';
COMMENT ON COLUMN registrations.stripe_payment_intent_id IS 'ID de l''intention de paiement Stripe';
COMMENT ON COLUMN registrations.payment_status IS 'Statut du paiement (pending, completed, failed, expired)';
COMMENT ON COLUMN registrations.accepted_at IS 'Date et heure d''acceptation de l''inscription';
COMMENT ON COLUMN registrations.payment_deadline IS 'Date limite pour payer (24h après acceptation)';
COMMENT ON COLUMN registrations.paid_at IS 'Date et heure du paiement confirmé';

-- 5. Créer un index pour améliorer les performances des requêtes sur le statut de paiement
CREATE INDEX IF NOT EXISTS idx_registrations_payment_status ON registrations(payment_status);
CREATE INDEX IF NOT EXISTS idx_registrations_stripe_session_id ON registrations(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_registrations_payment_deadline ON registrations(payment_deadline);

-- 6. Créer une fonction pour calculer automatiquement la deadline de paiement
CREATE OR REPLACE FUNCTION set_payment_deadline()
RETURNS TRIGGER AS $$
BEGIN
  -- Si le statut passe à accepted_unpaid et qu'il y a un prix, définir la deadline à +24h
  IF NEW.status = 'accepted_unpaid' AND NEW.accepted_at IS NOT NULL THEN
    NEW.payment_deadline := NEW.accepted_at + INTERVAL '24 hours';
    NEW.payment_status := 'pending';
  END IF;
  
  -- Si le paiement est complété
  IF NEW.status = 'accepted_paid' THEN
    NEW.payment_status := 'completed';
    NEW.paid_at := COALESCE(NEW.paid_at, NOW());
  END IF;
  
  -- Si expiré
  IF NEW.status = 'expired_unpaid' THEN
    NEW.payment_status := 'expired';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Créer un trigger pour appeler la fonction
DROP TRIGGER IF EXISTS trigger_set_payment_deadline ON registrations;
CREATE TRIGGER trigger_set_payment_deadline
  BEFORE INSERT OR UPDATE ON registrations
  FOR EACH ROW
  EXECUTE FUNCTION set_payment_deadline();

-- ============================================================================
-- FIN DE LA PARTIE 1
-- ⚠️ ARRÊTEZ ICI et attendez 5-10 secondes avant d'exécuter la PARTIE 2
-- Cela permet à PostgreSQL de commiter les nouvelles valeurs d'enum
-- ============================================================================


-- ============================================================================
-- PARTIE 2: FONCTIONS ET VUES
-- Exécutez cette partie après avoir attendu quelques secondes
-- ============================================================================

-- 8. Créer une fonction pour expirer automatiquement les paiements
CREATE OR REPLACE FUNCTION expire_unpaid_registrations()
RETURNS INTEGER AS $$
DECLARE
  expired_count INTEGER;
BEGIN
  WITH updated AS (
    UPDATE registrations
    SET 
      status = 'expired_unpaid',
      payment_status = 'expired',
      updated_at = NOW()
    WHERE 
      status = 'accepted_unpaid'
      AND payment_deadline < NOW()
      AND payment_status = 'pending'
    RETURNING id
  )
  SELECT COUNT(*) INTO expired_count FROM updated;
  
  RETURN expired_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION expire_unpaid_registrations IS 'Expire automatiquement les inscriptions non payées après 24h';

-- 9. Mettre à jour les RLS policies pour les paiements
-- Note: Les politiques pour les inscriptions existent déjà, donc on les ignore si elles existent
-- Les politiques existantes couvrent déjà l'accès aux informations de paiement

-- 10. Créer une vue pour les statistiques de paiement des organisateurs
-- Cette vue utilise les nouveaux statuts d'enum, d'où la nécessité d'attendre entre PARTIE 1 et PARTIE 2
CREATE OR REPLACE VIEW tournament_payment_stats AS
SELECT 
  t.id as tournament_id,
  t.title,
  t.organizer_id,
  t.price,
  COUNT(r.id) FILTER (WHERE r.status IN ('accepted_paid', 'accepted_unpaid')) as total_accepted,
  COUNT(r.id) FILTER (WHERE r.status = 'accepted_paid') as total_paid,
  COUNT(r.id) FILTER (WHERE r.status = 'accepted_unpaid') as total_unpaid,
  COUNT(r.id) FILTER (WHERE r.status = 'expired_unpaid') as total_expired,
  COALESCE(SUM(t.price) FILTER (WHERE r.status = 'accepted_paid'), 0) as total_revenue,
  COALESCE(SUM(t.price) FILTER (WHERE r.status = 'accepted_unpaid'), 0) as pending_revenue
FROM tournaments t
LEFT JOIN registrations r ON t.id = r.tournament_id
WHERE t.price IS NOT NULL AND t.price > 0
GROUP BY t.id, t.title, t.organizer_id, t.price;

COMMENT ON VIEW tournament_payment_stats IS 'Statistiques de paiement par tournoi pour les organisateurs';

-- 11. Notification pour informer que la migration est terminée
DO $$ 
BEGIN
  RAISE NOTICE 'Migration terminée avec succès ! Le système de paiement Stripe est maintenant configuré.';
  RAISE NOTICE 'N''oubliez pas de configurer vos clés Stripe dans les variables d''environnement :';
  RAISE NOTICE '- STRIPE_SECRET_KEY';
  RAISE NOTICE '- NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY';
  RAISE NOTICE '- STRIPE_WEBHOOK_SECRET';
END $$;

