-- ============================================================================
-- Migration Stripe - PARTIE 1/2 : Modifications de Schéma
-- ============================================================================
-- Cette partie ajoute les colonnes et les nouveaux types enum
-- Exécutez cette partie en premier, puis attendez 5-10 secondes avant
-- d'exécuter la PARTIE 2
-- ============================================================================

-- 1. Ajouter le champ price aux tournaments
ALTER TABLE tournaments
ADD COLUMN IF NOT EXISTS price NUMERIC(10, 2) DEFAULT NULL;

COMMENT ON COLUMN tournaments.price IS 'Prix d''inscription en euros (null = gratuit)';

-- 2. Ajouter les nouveaux statuts de registration
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

-- 5. Créer des index pour améliorer les performances
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
-- ⚠️ Attendez maintenant 5-10 secondes avant d'exécuter la PARTIE 2
-- ============================================================================

DO $$ 
BEGIN
  RAISE NOTICE '✅ PARTIE 1 terminée avec succès !';
  RAISE NOTICE '⏰ Attendez 5-10 secondes avant d''exécuter la PARTIE 2';
  RAISE NOTICE '📄 Fichier: supabase-payment-migration-part2.sql';
END $$;

