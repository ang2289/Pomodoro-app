-- Phase 1: close direct Data API access to backend-only public tables.
-- This migration changes access controls only; it does not delete or rewrite data.

begin;

alter table if exists public.password_resets enable row level security;
alter table if exists public.ecpay_logs enable row level security;
alter table if exists public.orders enable row level security;
alter table if exists public.guest_trials enable row level security;
alter table if exists public.link_clicks enable row level security;
alter table if exists public.short_clicks enable row level security;
alter table if exists public.short_links enable row level security;
alter table if exists public.qr_codes enable row level security;
alter table if exists public.qr_scans enable row level security;

revoke all privileges on table public.password_resets from anon, authenticated;
revoke all privileges on table public.ecpay_logs from anon, authenticated;
revoke all privileges on table public.orders from anon, authenticated;
revoke all privileges on table public.guest_trials from anon, authenticated;
revoke all privileges on table public.link_clicks from anon, authenticated;
revoke all privileges on table public.short_clicks from anon, authenticated;
revoke all privileges on table public.short_links from anon, authenticated;
revoke all privileges on table public.qr_codes from anon, authenticated;
revoke all privileges on table public.qr_scans from anon, authenticated;

commit;
