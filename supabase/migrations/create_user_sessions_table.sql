-- Custom auth sessions for the self-managed public.users login flow.
-- Raw session tokens are returned to the client once and never stored.
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  revoked_at TIMESTAMP WITH TIME ZONE,
  user_agent TEXT,
  ip TEXT
);

ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.user_sessions FROM anon, authenticated;
GRANT ALL ON TABLE public.user_sessions TO service_role;

CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id
  ON public.user_sessions(user_id);

CREATE INDEX IF NOT EXISTS idx_user_sessions_token_hash
  ON public.user_sessions(token_hash);

CREATE INDEX IF NOT EXISTS idx_user_sessions_active
  ON public.user_sessions(expires_at)
  WHERE revoked_at IS NULL;

COMMENT ON TABLE public.user_sessions IS
  'Self-managed login sessions. Stores SHA-256 token hashes only; raw tokens are never persisted.';

COMMENT ON COLUMN public.user_sessions.token_hash IS
  'SHA-256 hash of the bearer token returned to the frontend.';
