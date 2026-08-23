begin;

alter table public.group_buy_campaigns
  add column if not exists original_registration_ends_at timestamptz,
  add column if not exists registration_extension_count integer not null default 0,
  add column if not exists last_registration_extension_reason text,
  add column if not exists last_registration_extended_at timestamptz,
  add column if not exists registration_closed_at timestamptz,
  add column if not exists payment_opened_at timestamptz,
  add column if not exists estimated_ship_min_business_days integer not null default 7,
  add column if not exists estimated_ship_max_business_days integer not null default 14,
  add column if not exists estimated_latest_ship_at timestamptz,
  add column if not exists supplier_ordered_at timestamptz,
  add column if not exists supplier_expected_ship_at timestamptz,
  add column if not exists shipping_notice text,
  add column if not exists shipping_delay_reason text;

update public.group_buy_campaigns
   set original_registration_ends_at = registration_ends_at
 where original_registration_ends_at is null
   and registration_ends_at is not null;

do $constraints$
begin
  if not exists (
    select 1 from pg_constraint
     where conrelid = 'public.group_buy_campaigns'::regclass
       and conname = 'group_buy_campaigns_registration_extension_count_check'
  ) then
    alter table public.group_buy_campaigns
      add constraint group_buy_campaigns_registration_extension_count_check
      check (registration_extension_count between 0 and 1);
  end if;

  if not exists (
    select 1 from pg_constraint
     where conrelid = 'public.group_buy_campaigns'::regclass
       and conname = 'group_buy_campaigns_estimated_ship_days_check'
  ) then
    alter table public.group_buy_campaigns
      add constraint group_buy_campaigns_estimated_ship_days_check
      check (
        estimated_ship_min_business_days >= 0
        and estimated_ship_max_business_days >= estimated_ship_min_business_days
      );
  end if;
end
$constraints$;

alter table public.group_buy_orders
  add column if not exists promised_ship_by timestamptz,
  add column if not exists shipping_carrier text,
  add column if not exists tracking_number text,
  add column if not exists shipment_note text;

-- 訂單既有 shipped_at，沿用為實際出貨時間，不新增 actual_shipped_at。

create table if not exists public.group_buy_campaign_events (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.group_buy_campaigns(id) on delete cascade,
  actor_user_id uuid null references public.users(id) on delete set null,
  actor_role text not null default 'system'
    check (actor_role in ('system', 'owner', 'admin')),
  event_type text not null,
  from_status text null,
  to_status text null,
  message text null,
  metadata jsonb not null default '{}'::jsonb,
  dedupe_key text null unique,
  created_at timestamptz not null default now()
);

create index if not exists group_buy_campaign_events_campaign_created_at_idx
  on public.group_buy_campaign_events (campaign_id, created_at desc);

alter table public.group_buy_campaign_events enable row level security;
revoke all on public.group_buy_campaign_events from anon, authenticated;

commit;
