-- Private delivery metadata for image-bundle-full.  This migration is
-- additive, idempotent, and does not change existing payments, credits, or images.

create table if not exists public.digital_product_bundle_files (
  id uuid primary key default gen_random_uuid(),
  product_code text not null unique check (product_code = 'image-bundle-full'),
  version text not null,
  object_key text not null unique check (object_key ~ '^private/image-bundles/'),
  file_name text not null,
  size_bytes bigint not null check (size_bytes > 0),
  content_type text not null default 'application/zip',
  status text not null default 'active' check (status = 'active'),
  uploaded_at timestamptz not null default now(),
  uploaded_by uuid references public.users(id) on delete set null,
  updated_at timestamptz not null default now()
);

create or replace function public.set_digital_product_bundle_files_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists digital_product_bundle_files_set_updated_at on public.digital_product_bundle_files;
create trigger digital_product_bundle_files_set_updated_at
before update on public.digital_product_bundle_files
for each row execute function public.set_digital_product_bundle_files_updated_at();

alter table public.digital_product_bundle_files enable row level security;
revoke all on table public.digital_product_bundle_files from anon, authenticated;
grant select, insert, update, delete on table public.digital_product_bundle_files to service_role;

-- The row lock prevents concurrent token requests from exceeding download_limit.
-- It increments only after the API has confirmed that a current private object exists.
create or replace function public.claim_digital_product_bundle_download(
  p_download_token text,
  p_bundle_file_id uuid
)
returns table (
  object_key text,
  file_name text,
  content_type text,
  download_count integer,
  download_limit integer
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.digital_product_orders%rowtype;
  v_bundle public.digital_product_bundle_files%rowtype;
begin
  select * into v_order
  from public.digital_product_orders
  where download_token = p_download_token
  for update;

  if not found then
    raise exception 'DIGITAL_PRODUCT_DOWNLOAD_TOKEN_INVALID' using errcode = 'P0002';
  end if;
  if v_order.status <> 'approved' then
    raise exception 'DIGITAL_PRODUCT_ORDER_NOT_APPROVED' using errcode = 'P0001';
  end if;
  if v_order.download_expires_at is null or v_order.download_expires_at <= now() then
    raise exception 'DIGITAL_PRODUCT_DOWNLOAD_EXPIRED' using errcode = 'P0001';
  end if;
  if v_order.download_count >= v_order.download_limit then
    raise exception 'DIGITAL_PRODUCT_DOWNLOAD_LIMIT_REACHED' using errcode = 'P0001';
  end if;

  select * into v_bundle
  from public.digital_product_bundle_files
  where id = p_bundle_file_id
    and product_code = v_order.product_code
    and status = 'active';
  if not found then
    raise exception 'DIGITAL_PRODUCT_BUNDLE_UNAVAILABLE' using errcode = 'P0001';
  end if;

  update public.digital_product_orders
  set download_count = download_count + 1
  where id = v_order.id;

  return query
  select v_bundle.object_key, v_bundle.file_name, v_bundle.content_type,
         v_order.download_count + 1, v_order.download_limit;
end;
$$;

revoke all on function public.claim_digital_product_bundle_download(text, uuid) from public, anon, authenticated;
grant execute on function public.claim_digital_product_bundle_download(text, uuid) to service_role;
