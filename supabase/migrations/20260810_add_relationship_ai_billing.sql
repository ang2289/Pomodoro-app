-- Relationship AI billing, subscription entitlements, and atomic usage quotas.
-- This migration is intentionally independent from the existing product-image approval RPC.
BEGIN;

DO $$
DECLARE
  constraint_row RECORD;
BEGIN
  FOR constraint_row IN
    SELECT conname
    FROM pg_constraint
    WHERE conrelid = 'public.bank_transfer_reports'::regclass
      AND contype = 'c'
      AND pg_get_constraintdef(oid) ILIKE '%plan_id%'
  LOOP
    EXECUTE format(
      'ALTER TABLE public.bank_transfer_reports DROP CONSTRAINT %I',
      constraint_row.conname
    );
  END LOOP;
END;
$$;

ALTER TABLE public.bank_transfer_reports
  ADD CONSTRAINT bank_transfer_reports_plan_id_check
  CHECK (plan_id IN ('99', '199', 'relationship_pro', 'relationship_business'));

CREATE TABLE IF NOT EXISTS public.relationship_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  plan TEXT NOT NULL CHECK (plan IN ('relationship_pro', 'relationship_business')),
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'active', 'expired', 'rejected')),
  started_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  usage_anchor_at TIMESTAMPTZ,
  payment_report_id UUID NOT NULL
    REFERENCES public.bank_transfer_reports(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT relationship_subscriptions_payment_report_id_key UNIQUE (payment_report_id),
  CONSTRAINT relationship_subscriptions_active_dates_check CHECK (
    status <> 'active'
    OR (
      started_at IS NOT NULL
      AND expires_at IS NOT NULL
      AND usage_anchor_at IS NOT NULL
      AND expires_at > started_at
    )
  )
);

CREATE INDEX IF NOT EXISTS idx_relationship_subscriptions_user_expiry
  ON public.relationship_subscriptions(user_id, expires_at DESC);
CREATE INDEX IF NOT EXISTS idx_relationship_subscriptions_status
  ON public.relationship_subscriptions(status);

-- One row per AI attempt. Reserved rows count against quota while Gemini is running.
-- Failed rows remain for audit/rate limiting but never count as successful usage.
CREATE TABLE IF NOT EXISTS public.relationship_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  request_id UUID NOT NULL,
  plan TEXT NOT NULL CHECK (plan IN ('free', 'relationship_pro', 'relationship_business')),
  subscription_id UUID REFERENCES public.relationship_subscriptions(id) ON DELETE SET NULL,
  usage_period_start TIMESTAMPTZ,
  usage_period_end TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'reserved'
    CHECK (status IN ('reserved', 'succeeded', 'failed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  CONSTRAINT relationship_usage_request_id_key UNIQUE (request_id),
  CONSTRAINT relationship_usage_period_check CHECK (
    (plan = 'free' AND subscription_id IS NULL
      AND usage_period_start IS NULL AND usage_period_end IS NULL)
    OR
    (plan <> 'free' AND subscription_id IS NOT NULL
      AND usage_period_start IS NOT NULL AND usage_period_end IS NOT NULL
      AND usage_period_end > usage_period_start)
  )
);

CREATE INDEX IF NOT EXISTS idx_relationship_usage_user_status
  ON public.relationship_usage(user_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_relationship_usage_user_period
  ON public.relationship_usage(user_id, usage_period_start, usage_period_end, status);

CREATE OR REPLACE FUNCTION public.set_relationship_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS relationship_subscriptions_set_updated_at
  ON public.relationship_subscriptions;
CREATE TRIGGER relationship_subscriptions_set_updated_at
  BEFORE UPDATE ON public.relationship_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.set_relationship_updated_at();

DROP TRIGGER IF EXISTS relationship_usage_set_updated_at
  ON public.relationship_usage;
CREATE TRIGGER relationship_usage_set_updated_at
  BEFORE UPDATE ON public.relationship_usage
  FOR EACH ROW EXECUTE FUNCTION public.set_relationship_updated_at();

ALTER TABLE public.relationship_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.relationship_usage ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.relationship_subscriptions FROM anon, authenticated;
REVOKE ALL ON public.relationship_usage FROM anon, authenticated;

-- Returns the effective server-side entitlement and the current usage cycle.
CREATE OR REPLACE FUNCTION public.get_relationship_access(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  active_subscription public.relationship_subscriptions%ROWTYPE;
  latest_expiry TIMESTAMPTZ;
  effective_plan TEXT := 'free';
  effective_status TEXT := 'free';
  quota_limit INTEGER := 5;
  used_count INTEGER := 0;
  period_index INTEGER;
  period_start TIMESTAMPTZ;
  period_end TIMESTAMPTZ;
BEGIN
  UPDATE public.relationship_usage
  SET status = 'failed', completed_at = NOW()
  WHERE user_id = p_user_id
    AND status = 'reserved'
    AND created_at < NOW() - INTERVAL '15 minutes';

  SELECT * INTO active_subscription
  FROM public.relationship_subscriptions
  WHERE user_id = p_user_id
    AND status = 'active'
    AND started_at <= NOW()
    AND expires_at > NOW()
  ORDER BY
    CASE WHEN plan = 'relationship_business' THEN 2 ELSE 1 END DESC,
    expires_at DESC
  LIMIT 1;

  IF FOUND THEN
    effective_plan := active_subscription.plan;
    effective_status := 'active';
    quota_limit := CASE effective_plan
      WHEN 'relationship_business' THEN 1000
      ELSE 300
    END;
    period_index := GREATEST(
      0,
      FLOOR(EXTRACT(EPOCH FROM (NOW() - active_subscription.usage_anchor_at)) / 2592000)::INTEGER
    );
    period_start := active_subscription.usage_anchor_at + period_index * INTERVAL '30 days';
    period_end := LEAST(period_start + INTERVAL '30 days', active_subscription.expires_at);

    SELECT COUNT(*) INTO used_count
    FROM public.relationship_usage
    WHERE user_id = p_user_id
      AND status = 'succeeded'
      AND usage_period_start = period_start
      AND usage_period_end = period_end;
  ELSE
    SELECT MAX(expires_at) INTO latest_expiry
    FROM public.relationship_subscriptions
    WHERE user_id = p_user_id;

    IF latest_expiry IS NOT NULL THEN
      effective_status := 'expired';
    END IF;

    SELECT COUNT(*) INTO used_count
    FROM public.relationship_usage
    WHERE user_id = p_user_id
      AND plan = 'free'
      AND status = 'succeeded';
  END IF;

  RETURN jsonb_build_object(
    'plan', CASE WHEN effective_plan = 'free' THEN NULL ELSE effective_plan END,
    'subscription_status', effective_status,
    'expires_at', CASE
      WHEN effective_status = 'active' THEN active_subscription.expires_at
      ELSE latest_expiry
    END,
    'usage_limit', quota_limit,
    'usage_used', LEAST(quota_limit, used_count),
    'usage_remaining', GREATEST(0, quota_limit - used_count),
    'usage_period_start', period_start,
    'usage_period_end', period_end,
    'can_use_business', effective_plan = 'relationship_business'
  );
END;
$$;

-- Atomically resolves plan, enforces per-user rate/quota limits, and reserves one slot.
CREATE OR REPLACE FUNCTION public.reserve_relationship_use(
  p_user_id UUID,
  p_request_id UUID,
  p_mode TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  active_subscription public.relationship_subscriptions%ROWTYPE;
  existing_row public.relationship_usage%ROWTYPE;
  effective_plan TEXT := 'free';
  quota_limit INTEGER := 5;
  used_count INTEGER := 0;
  reserved_count INTEGER := 0;
  recent_attempts INTEGER := 0;
  period_index INTEGER;
  period_start TIMESTAMPTZ;
  period_end TIMESTAMPTZ;
BEGIN
  IF p_mode NOT IN ('love', 'work', 'social', 'business') THEN
    RETURN jsonb_build_object('allowed', false, 'reason', 'invalid_mode');
  END IF;

  PERFORM pg_advisory_xact_lock(hashtextextended(p_user_id::TEXT, 0));

  UPDATE public.relationship_usage
  SET status = 'failed', completed_at = NOW()
  WHERE user_id = p_user_id
    AND status = 'reserved'
    AND created_at < NOW() - INTERVAL '15 minutes';

  SELECT * INTO existing_row
  FROM public.relationship_usage
  WHERE request_id = p_request_id AND user_id = p_user_id;

  IF FOUND THEN
    RETURN jsonb_build_object(
      'allowed', existing_row.status IN ('reserved', 'succeeded'),
      'reason', 'idempotent',
      'status', existing_row.status,
      'plan', CASE WHEN existing_row.plan = 'free' THEN NULL ELSE existing_row.plan END,
      'usage_period_start', existing_row.usage_period_start,
      'usage_period_end', existing_row.usage_period_end
    );
  END IF;

  SELECT COUNT(*) INTO recent_attempts
  FROM public.relationship_usage
  WHERE user_id = p_user_id
    AND created_at > NOW() - INTERVAL '10 seconds';

  IF recent_attempts >= 3 THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'reason', 'rate_limited',
      'retry_after_seconds', 10
    );
  END IF;

  SELECT * INTO active_subscription
  FROM public.relationship_subscriptions
  WHERE user_id = p_user_id
    AND status = 'active'
    AND started_at <= NOW()
    AND expires_at > NOW()
  ORDER BY
    CASE WHEN plan = 'relationship_business' THEN 2 ELSE 1 END DESC,
    expires_at DESC
  LIMIT 1;

  IF FOUND THEN
    effective_plan := active_subscription.plan;
    quota_limit := CASE effective_plan
      WHEN 'relationship_business' THEN 1000
      ELSE 300
    END;
    period_index := GREATEST(
      0,
      FLOOR(EXTRACT(EPOCH FROM (NOW() - active_subscription.usage_anchor_at)) / 2592000)::INTEGER
    );
    period_start := active_subscription.usage_anchor_at + period_index * INTERVAL '30 days';
    period_end := LEAST(period_start + INTERVAL '30 days', active_subscription.expires_at);

    SELECT
      COUNT(*) FILTER (WHERE status = 'succeeded'),
      COUNT(*) FILTER (WHERE status = 'reserved')
    INTO used_count, reserved_count
    FROM public.relationship_usage
    WHERE user_id = p_user_id
      AND usage_period_start = period_start
      AND usage_period_end = period_end;
  ELSE
    SELECT
      COUNT(*) FILTER (WHERE status = 'succeeded'),
      COUNT(*) FILTER (WHERE status = 'reserved')
    INTO used_count, reserved_count
    FROM public.relationship_usage
    WHERE user_id = p_user_id
      AND plan = 'free';
  END IF;

  IF p_mode = 'business' AND effective_plan <> 'relationship_business' THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'reason', 'business_plan_required',
      'plan', CASE WHEN effective_plan = 'free' THEN NULL ELSE effective_plan END,
      'usage_limit', quota_limit,
      'usage_used', used_count,
      'usage_remaining', GREATEST(0, quota_limit - used_count - reserved_count),
      'usage_period_start', period_start,
      'usage_period_end', period_end
    );
  END IF;

  IF used_count + reserved_count >= quota_limit THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'reason', 'limit_reached',
      'plan', CASE WHEN effective_plan = 'free' THEN NULL ELSE effective_plan END,
      'usage_limit', quota_limit,
      'usage_used', used_count,
      'usage_remaining', 0,
      'usage_period_start', period_start,
      'usage_period_end', period_end
    );
  END IF;

  INSERT INTO public.relationship_usage(
    user_id,
    request_id,
    plan,
    subscription_id,
    usage_period_start,
    usage_period_end,
    status
  ) VALUES (
    p_user_id,
    p_request_id,
    effective_plan,
    CASE WHEN effective_plan = 'free' THEN NULL ELSE active_subscription.id END,
    period_start,
    period_end,
    'reserved'
  );

  RETURN jsonb_build_object(
    'allowed', true,
    'reason', 'reserved',
    'plan', CASE WHEN effective_plan = 'free' THEN NULL ELSE effective_plan END,
    'subscription_status', CASE WHEN effective_plan = 'free' THEN 'free' ELSE 'active' END,
    'expires_at', CASE WHEN effective_plan = 'free' THEN NULL ELSE active_subscription.expires_at END,
    'usage_limit', quota_limit,
    'usage_used', used_count,
    'usage_remaining', GREATEST(0, quota_limit - used_count - reserved_count - 1),
    'usage_period_start', period_start,
    'usage_period_end', period_end,
    'can_use_business', effective_plan = 'relationship_business'
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.complete_relationship_use(
  p_user_id UUID,
  p_request_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  affected INTEGER;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtextextended(p_user_id::TEXT, 0));

  UPDATE public.relationship_usage
  SET status = 'succeeded', completed_at = NOW()
  WHERE user_id = p_user_id
    AND request_id = p_request_id
    AND status = 'reserved';
  GET DIAGNOSTICS affected = ROW_COUNT;

  IF affected <> 1 THEN
    RETURN jsonb_build_object('completed', false);
  END IF;

  RETURN jsonb_build_object('completed', true)
    || public.get_relationship_access(p_user_id);
END;
$$;

CREATE OR REPLACE FUNCTION public.release_relationship_use(
  p_user_id UUID,
  p_request_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM pg_advisory_xact_lock(hashtextextended(p_user_id::TEXT, 0));

  UPDATE public.relationship_usage
  SET status = 'failed', completed_at = NOW()
  WHERE user_id = p_user_id
    AND request_id = p_request_id
    AND status = 'reserved';
  RETURN FOUND;
END;
$$;

CREATE OR REPLACE FUNCTION public.approve_relationship_bank_transfer_report(
  p_report_id UUID,
  p_admin_user_id UUID,
  p_review_note TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  report_row public.bank_transfer_reports%ROWTYPE;
  existing_subscription public.relationship_subscriptions%ROWTYPE;
  current_subscription public.relationship_subscriptions%ROWTYPE;
  base_time TIMESTAMPTZ;
  starts_time TIMESTAMPTZ;
  expires_time TIMESTAMPTZ;
  usage_anchor_time TIMESTAMPTZ;
  expected_amount INTEGER;
  inserted_subscription public.relationship_subscriptions%ROWTYPE;
BEGIN
  SELECT * INTO report_row
  FROM public.bank_transfer_reports
  WHERE id = p_report_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'relationship_payment_report_not_found';
  END IF;

  SELECT * INTO existing_subscription
  FROM public.relationship_subscriptions
  WHERE payment_report_id = p_report_id;

  IF FOUND THEN
    RETURN jsonb_build_object(
      'ok', true,
      'already_processed', true,
      'subscription_id', existing_subscription.id,
      'plan', existing_subscription.plan,
      'started_at', existing_subscription.started_at,
      'expires_at', existing_subscription.expires_at
    );
  END IF;

  IF report_row.status <> 'pending' THEN
    RAISE EXCEPTION 'relationship_payment_report_already_reviewed';
  END IF;

  expected_amount := CASE report_row.plan_id
    WHEN 'relationship_pro' THEN 99
    WHEN 'relationship_business' THEN 299
    ELSE NULL
  END;

  IF expected_amount IS NULL THEN
    RAISE EXCEPTION 'not_a_relationship_payment_report';
  END IF;
  IF report_row.amount_ntd <> expected_amount THEN
    RAISE EXCEPTION 'relationship_payment_amount_mismatch';
  END IF;

  SELECT MAX(expires_at) INTO base_time
  FROM public.relationship_subscriptions
  WHERE user_id = report_row.user_id
    AND status = 'active'
    AND expires_at > NOW();

  SELECT * INTO current_subscription
  FROM public.relationship_subscriptions
  WHERE user_id = report_row.user_id
    AND status = 'active'
    AND started_at <= NOW()
    AND expires_at > NOW()
  ORDER BY
    CASE WHEN plan = 'relationship_business' THEN 2 ELSE 1 END DESC,
    expires_at DESC
  LIMIT 1;

  -- A Pro -> Business upgrade is effective immediately and keeps the same usage cycle.
  -- A purchase at the same tier, or Business -> Pro, starts after current entitlement.
  IF report_row.plan_id = 'relationship_business'
    AND current_subscription.plan = 'relationship_pro' THEN
    starts_time := NOW();
    usage_anchor_time := current_subscription.usage_anchor_at;
  ELSE
    starts_time := COALESCE(base_time, NOW());
    usage_anchor_time := starts_time;
  END IF;
  expires_time := COALESCE(base_time, NOW()) + INTERVAL '30 days';

  INSERT INTO public.relationship_subscriptions(
    user_id,
    email,
    plan,
    status,
    started_at,
    expires_at,
    usage_anchor_at,
    payment_report_id
  ) VALUES (
    report_row.user_id,
    report_row.email,
    report_row.plan_id,
    'active',
    starts_time,
    expires_time,
    usage_anchor_time,
    report_row.id
  )
  RETURNING * INTO inserted_subscription;

  UPDATE public.bank_transfer_reports
  SET status = 'approved',
      reviewed_by = p_admin_user_id,
      reviewed_at = NOW(),
      review_note = NULLIF(BTRIM(p_review_note), ''),
      updated_at = NOW()
  WHERE id = report_row.id;

  RETURN jsonb_build_object(
    'ok', true,
    'already_processed', false,
    'subscription_id', inserted_subscription.id,
    'plan', inserted_subscription.plan,
    'started_at', inserted_subscription.started_at,
    'expires_at', inserted_subscription.expires_at
  );
END;
$$;

REVOKE ALL ON FUNCTION public.get_relationship_access(UUID) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.reserve_relationship_use(UUID, UUID, TEXT) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.complete_relationship_use(UUID, UUID) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.release_relationship_use(UUID, UUID) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.approve_relationship_bank_transfer_report(UUID, UUID, TEXT) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.get_relationship_access(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION public.reserve_relationship_use(UUID, UUID, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.complete_relationship_use(UUID, UUID) TO service_role;
GRANT EXECUTE ON FUNCTION public.release_relationship_use(UUID, UUID) TO service_role;
GRANT EXECUTE ON FUNCTION public.approve_relationship_bank_transfer_report(UUID, UUID, TEXT) TO service_role;

COMMIT;
