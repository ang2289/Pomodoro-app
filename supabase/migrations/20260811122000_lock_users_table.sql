-- Run only after the session-authenticated current-user profile API is deployed.
-- This migration changes access controls only; it does not delete or rewrite users.

begin;

alter table if exists public.users enable row level security;

revoke all privileges on table public.users from anon, authenticated;

commit;
