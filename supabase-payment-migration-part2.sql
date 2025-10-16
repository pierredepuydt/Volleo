-- ============================================================================
-- Migration Stripe - PARTIE 2/2 : Fonctions et Vues
-- ============================================================================
-- ⚠️ Exécutez cette partie APRÈS avoir attendu 5-10 secondes après la PARTIE 1
-- ============================================================================

-- 1. Créer une fonction pour expirer automatiquement les paiements
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

-- 2. Créer une vue pour les statistiques de paiement des organisateurs
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

-- 3. Notification finale
DO $$ 
BEGIN
  RAISE NOTICE '✅ Migration COMPLÈTE avec succès !';
  RAISE NOTICE '';
  RAISE NOTICE '🎉 Le système de paiement Stripe est maintenant configuré.';
  RAISE NOTICE '';
  RAISE NOTICE '⚙️  Prochaines étapes :';
  RAISE NOTICE '1. Configurer les variables d''environnement :';
  RAISE NOTICE '   - STRIPE_SECRET_KEY';
  RAISE NOTICE '   - NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY';
  RAISE NOTICE '   - STRIPE_WEBHOOK_SECRET';
  RAISE NOTICE '   - SUPABASE_SERVICE_ROLE_KEY';
  RAISE NOTICE '   - CRON_SECRET';
  RAISE NOTICE '';
  RAISE NOTICE '2. Consultez STRIPE_SETUP.md pour la configuration complète';
END $$;

