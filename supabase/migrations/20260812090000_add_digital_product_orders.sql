-- Digital product orders are server-managed. This migration is idempotent and
-- does not alter or move existing payment, credit, image, or bank-transfer data.

create extension if not exists pgcrypto;

create table if not exists public.digital_product_orders (
  id uuid primary key default gen_random_uuid(),
  order_no text not null unique default (
    'IMG-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 12))
  ),
  product_code text not null check (product_code = 'image-bundle-full'),
  product_name text not null check (product_name = '1500+ 高畫質圖片素材庫完整版'),
  email text not null,
  amount_ntd integer not null check (amount_ntd = 399),
  account_last_five text not null check (account_last_five ~ '^[0-9]{5}$'),
  transfer_date date not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  processed_at timestamptz,
  processed_by uuid references public.users(id) on delete set null,
  download_token text unique,
  download_expires_at timestamptz,
  download_count integer not null default 0 check (download_count >= 0),
  download_limit integer not null default 3 check (download_limit > 0)
);

create index if not exists digital_product_orders_status_created_idx
  on public.digital_product_orders (status, created_at asc);
create index if not exists digital_product_orders_email_created_idx
  on public.digital_product_orders (email, created_at desc);

create or replace function public.set_digital_product_orders_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists digital_product_orders_set_updated_at on public.digital_product_orders;
create trigger digital_product_orders_set_updated_at
before update on public.digital_product_orders
for each row execute function public.set_digital_product_orders_updated_at();

-- No browser role accesses this raw order table. The Vercel API validates the
-- custom user session and writes only pending orders with server-side pricing.
alter table public.digital_product_orders enable row level security;
revoke all on table public.digital_product_orders from anon, authenticated;
grant select, insert, update, delete on table public.digital_product_orders to service_role;

create or replace function public.approve_digital_product_order(
  p_order_id uuid,
  p_admin_user_id uuid
)
returns table (
  order_no text,
  status text,
  download_expires_at timestamptz,
  download_limit integer
)
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_order public.digital_product_orders%rowtype;
begin
  select * into v_order
  from public.digital_product_orders
  where id = p_order_id
  for update;

  if not found then
    raise exception 'DIGITAL_PRODUCT_ORDER_NOT_FOUND' using errcode = 'P0002';
  end if;
  if v_order.status <> 'pending' then
    raise exception 'DIGITAL_PRODUCT_ORDER_ALREADY_REVIEWED' using errcode = 'P0001';
  end if;

  update public.digital_product_orders
  set
    status = 'approved',
    processed_at = now(),
    processed_by = p_admin_user_id,
    download_token = encode(gen_random_bytes(32), 'hex'),
    download_expires_at = now() + interval '7 days',
    download_count = 0,
    download_limit = 3
  where id = p_order_id;

  return query
  select o.order_no, o.status, o.download_expires_at, o.download_limit
  from public.digital_product_orders o
  where o.id = p_order_id;
end;
$$;

create or replace function public.reject_digital_product_order(
  p_order_id uuid,
  p_admin_user_id uuid,
  p_review_note text default null
)
returns table (order_no text, status text)
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_order public.digital_product_orders%rowtype;
begin
  select * into v_order
  from public.digital_product_orders
  where id = p_order_id
  for update;

  if not found then
    raise exception 'DIGITAL_PRODUCT_ORDER_NOT_FOUND' using errcode = 'P0002';
  end if;
  if v_order.status <> 'pending' then
    raise exception 'DIGITAL_PRODUCT_ORDER_ALREADY_REVIEWED' using errcode = 'P0001';
  end if;

  update public.digital_product_orders
  set
    status = 'rejected',
    processed_at = now(),
    processed_by = p_admin_user_id,
    note = coalesce(nullif(trim(p_review_note), ''), note)
  where id = p_order_id;

  return query
  select o.order_no, o.status
  from public.digital_product_orders o
  where o.id = p_order_id;
end;
$$;

revoke all on function public.approve_digital_product_order(uuid, uuid) from public, anon, authenticated;
revoke all on function public.reject_digital_product_order(uuid, uuid, text) from public, anon, authenticated;
grant execute on function public.approve_digital_product_order(uuid, uuid) to service_role;
grant execute on function public.reject_digital_product_order(uuid, uuid, text) to service_role;
