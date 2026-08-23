-- Apply only after the Phase 3 Preview content/admin API verification has passed.
-- ACL/RLS only: no row data, columns, constraints, or existing records are changed.

begin;

alter table if exists public.deal_items enable row level security;
alter table if exists public.image_categories enable row level security;
alter table if exists public.images enable row level security;

-- Browser clients use /api/main public allowlists and admin session validation.
-- Do not expose the underlying tables or create broad public RLS policies.
revoke all privileges on table public.deal_items from public, anon, authenticated;
revoke all privileges on table public.image_categories from public, anon, authenticated;
revoke all privileges on table public.images from public, anon, authenticated;

-- Server-side API handlers use the service role and continue to own all access.
grant select, insert, update, delete on table public.deal_items to service_role;
grant select, insert, update, delete on table public.image_categories to service_role;
grant select, insert, update, delete on table public.images to service_role;

commit;
