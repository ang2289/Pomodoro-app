-- Fix the PL/pgSQL variable/column ambiguity in the download counter update.
-- This changes only the bundle-download claim function; no order data is rewritten.

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
  v_download_count integer;
begin
  select * into v_order
  from public.digital_product_orders
  where digital_product_orders.download_token = p_download_token
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
  where digital_product_bundle_files.id = p_bundle_file_id
    and digital_product_bundle_files.product_code = v_order.product_code
    and digital_product_bundle_files.status = 'active';

  if not found then
    raise exception 'DIGITAL_PRODUCT_BUNDLE_UNAVAILABLE' using errcode = 'P0001';
  end if;

  update public.digital_product_orders as orders
  set download_count = orders.download_count + 1
  where orders.id = v_order.id
  returning orders.download_count into v_download_count;

  return query
  select v_bundle.object_key,
         v_bundle.file_name,
         v_bundle.content_type,
         v_download_count,
         v_order.download_limit;
end;
$$;

revoke all on function public.claim_digital_product_bundle_download(text, uuid) from public, anon, authenticated;
grant execute on function public.claim_digital_product_bundle_download(text, uuid) to service_role;
