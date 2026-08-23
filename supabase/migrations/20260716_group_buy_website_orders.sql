begin;

alter table public.group_buy_campaigns
  add column payment_open_mode text not null default 'manual';
alter table public.group_buy_campaigns
  add constraint group_buy_campaigns_payment_open_mode_check
  check (payment_open_mode in ('manual', 'automatic'));

alter table public.group_buy_orders
  add column user_id uuid null references public.users(id) on delete set null,
  add column rules_accepted_at timestamptz not null,
  add column rules_version text not null default 'group-buy-v1';
alter table public.group_buy_orders alter column customer_email set not null;
create index group_buy_orders_user_id_created_at_idx on public.group_buy_orders (user_id, created_at desc);
create index group_buy_orders_customer_email_lower_idx on public.group_buy_orders (lower(customer_email));

create table public.group_buy_order_recovery_tokens (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.group_buy_orders(id) on delete cascade,
  token_hash text not null unique,
  purpose text not null default 'email_order_access' check (purpose in ('email_order_access')),
  expires_at timestamptz not null,
  consumed_at timestamptz null,
  revoked_at timestamptz null,
  created_at timestamptz not null default now()
);
create index group_buy_order_recovery_tokens_order_id_idx on public.group_buy_order_recovery_tokens (order_id, created_at desc);
create index group_buy_order_recovery_tokens_active_idx on public.group_buy_order_recovery_tokens (expires_at)
  where consumed_at is null and revoked_at is null;
alter table public.group_buy_order_recovery_tokens enable row level security;
revoke all on public.group_buy_order_recovery_tokens from anon, authenticated;

create table public.group_buy_notifications (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid null references public.group_buy_campaigns(id) on delete cascade,
  order_id uuid null references public.group_buy_orders(id) on delete cascade,
  event_type text not null check (event_type in (
    'registration_confirmed', 'payment_opened', 'payment_deadline_reminder', 'payment_verified',
    'campaign_confirmed', 'shipped', 'ready_for_pickup', 'cancelled', 'refunded'
  )),
  channel text not null default 'email' check (channel in ('email')),
  recipient_email text not null,
  status text not null default 'notification_pending' check (status in (
    'notification_pending', 'notification_sent', 'notification_failed'
  )),
  provider text null,
  provider_message_id text null,
  attempt_count integer not null default 0,
  last_error text null,
  payload jsonb not null default '{}'::jsonb,
  dedupe_key text null unique,
  scheduled_at timestamptz not null default now(),
  sent_at timestamptz null,
  failed_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index group_buy_notifications_order_created_at_idx on public.group_buy_notifications (order_id, created_at desc);
create index group_buy_notifications_pending_idx on public.group_buy_notifications (scheduled_at)
  where status = 'notification_pending';
alter table public.group_buy_notifications enable row level security;
revoke all on public.group_buy_notifications from anon, authenticated;

alter table public.group_buy_order_items
  add column unit_cost_ntd integer null,
  add column line_cost_ntd integer null;

commit;
