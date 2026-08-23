-- DANGER: This script deletes transaction test data for one verified campaign.
-- Run preview-reset-yannick-first-group-buy.sql and download the JSON backup first.
-- It intentionally ends with ROLLBACK. Review every result and NOTICE before changing
-- the final ROLLBACK to COMMIT in a separately reviewed execution copy.

begin;

-- Fail closed if campaign/workspace/schema identity differs from the inspected database.
do $guard$
declare
  v_count integer;
  v_campaign_id uuid;
  v_workspace_id uuid;
  v_workspace_name text;
  v_workspace_status text;
  v_table text;
  v_column text;
begin
  select count(*), min(id::text)::uuid, min(workspace_id::text)::uuid
    into v_count, v_campaign_id, v_workspace_id
  from public.group_buy_campaigns
  where slug = 'yannick-first-group-buy';

  if v_count <> 1 then
    raise exception 'RESET BLOCKED: expected exactly one campaign for slug, found %', v_count;
  end if;
  if v_campaign_id <> 'a825eb6b-731b-4c7e-a3c1-fe5cb0d3c410'::uuid then
    raise exception 'RESET BLOCKED: campaign id changed (%). Re-run inspection.', v_campaign_id;
  end if;
  if v_workspace_id <> 'd5c44874-8a20-44a3-8505-20bcd39441a3'::uuid then
    raise exception 'RESET BLOCKED: workspace id changed (%). Re-run inspection.', v_workspace_id;
  end if;

  select name, status into v_workspace_name, v_workspace_status
  from public.group_buy_workspaces where id = v_workspace_id;
  if v_workspace_name is distinct from 'RXV 團購工作空間' or v_workspace_status is distinct from 'active' then
    raise exception 'RESET BLOCKED: workspace identity/status changed (%, %).', v_workspace_name, v_workspace_status;
  end if;
  if not exists (
    select 1
    from public.group_buy_campaigns
    where id = v_campaign_id
      and original_registration_ends_at > now()
  ) then
    raise exception 'RESET BLOCKED: stored original registration end date is missing or no longer in the future';
  end if;

  foreach v_table in array array[
    'group_buy_campaigns', 'group_buy_orders', 'group_buy_order_items',
    'group_buy_payment_reports', 'group_buy_order_events',
    'group_buy_order_recovery_tokens', 'group_buy_notifications',
    'group_buy_products', 'group_buy_product_images', 'group_buy_shipping_methods'
  ] loop
    if to_regclass('public.' || v_table) is null then
      raise exception 'RESET BLOCKED: missing table public.%', v_table;
    end if;
  end loop;

  foreach v_column in array array[
    'status', 'threshold_mode', 'min_registration_value', 'min_paid_value',
    'payment_open_mode', 'payment_deadline', 'registration_closed_at',
    'payment_opened_at', 'supplier_ordered_at', 'estimated_earliest_ship_at',
    'estimated_latest_ship_at', 'supplier_expected_ship_at', 'description',
    'notice_text', 'updated_at'
  ] loop
    if not exists (
      select 1 from information_schema.columns
      where table_schema = 'public'
        and table_name = 'group_buy_campaigns'
        and column_name = v_column
    ) then
      raise exception 'RESET BLOCKED: missing group_buy_campaigns.%', v_column;
    end if;
  end loop;
end
$guard$;

create temporary table _yannick_reset_order_ids (
  id uuid primary key
) on commit drop;

insert into _yannick_reset_order_ids (id)
select o.id
from public.group_buy_orders o
where o.campaign_id = 'a825eb6b-731b-4c7e-a3c1-fe5cb0d3c410'::uuid;

-- Delete deepest children first. Every predicate is anchored to the verified order ids.
-- Notifications additionally require the target campaign_id.
delete from public.group_buy_notifications n
where n.campaign_id = 'a825eb6b-731b-4c7e-a3c1-fe5cb0d3c410'::uuid
  and exists (select 1 from _yannick_reset_order_ids o where o.id = n.order_id);

delete from public.group_buy_order_recovery_tokens t
where exists (select 1 from _yannick_reset_order_ids o where o.id = t.order_id);

delete from public.group_buy_payment_reports p
where exists (select 1 from _yannick_reset_order_ids o where o.id = p.order_id);

delete from public.group_buy_order_events e
where exists (select 1 from _yannick_reset_order_ids o where o.id = e.order_id);

delete from public.group_buy_order_items i
where exists (select 1 from _yannick_reset_order_ids o where o.id = i.order_id);

delete from public.group_buy_orders o
where o.campaign_id = 'a825eb6b-731b-4c7e-a3c1-fe5cb0d3c410'::uuid
  and exists (select 1 from _yannick_reset_order_ids t where t.id = o.id);

-- Preserve campaign/products/images/shipping/workspace/bank/shipping rules.
-- Remove only public references to the obsolete 58-item threshold.
update public.group_buy_campaigns
set
  status = 'registration_open',
  registration_ends_at = original_registration_ends_at,
  threshold_mode = 'quantity',
  min_registration_value = 70,
  min_paid_value = 70,
  payment_open_mode = 'manual',
  payment_deadline = null,
  registration_closed_at = null,
  payment_opened_at = null,
  supplier_ordered_at = null,
  supplier_expected_ship_at = null,
  estimated_earliest_ship_at = null,
  estimated_latest_ship_at = null,
  description = replace(description, '58 條', '成團門檻'),
  notice_text = replace(notice_text, '58 條', '成團門檻'),
  updated_at = now()
where id = 'a825eb6b-731b-4c7e-a3c1-fe5cb0d3c410'::uuid
  and slug = 'yannick-first-group-buy'
  and workspace_id = 'd5c44874-8a20-44a3-8505-20bcd39441a3'::uuid;

do $verify_update$
begin
  if not exists (
    select 1
    from public.group_buy_campaigns
    where id = 'a825eb6b-731b-4c7e-a3c1-fe5cb0d3c410'::uuid
      and slug = 'yannick-first-group-buy'
      and workspace_id = 'd5c44874-8a20-44a3-8505-20bcd39441a3'::uuid
      and status = 'registration_open'
      and registration_ends_at = original_registration_ends_at
      and registration_ends_at > now()
      and threshold_mode = 'quantity'
      and min_registration_value = 70
      and min_paid_value = 70
      and payment_open_mode = 'manual'
      and payment_deadline is null
      and registration_closed_at is null
      and payment_opened_at is null
  ) then
    raise exception 'RESET BLOCKED: campaign update verification failed';
  end if;
end
$verify_update$;

-- Verification results inside this transaction.
select
  c.id,
  c.slug,
  c.title,
  c.workspace_id,
  c.status,
  c.threshold_mode,
  c.min_registration_value,
  c.min_paid_value,
  c.payment_open_mode,
  c.registration_ends_at,
  c.payment_deadline,
  c.registration_closed_at,
  c.payment_opened_at,
  c.supplier_ordered_at,
  c.estimated_ship_min_business_days,
  c.estimated_ship_max_business_days
from public.group_buy_campaigns c
where c.id = 'a825eb6b-731b-4c7e-a3c1-fe5cb0d3c410'::uuid;

with target_products as (
  select id from public.group_buy_products
  where campaign_id = 'a825eb6b-731b-4c7e-a3c1-fe5cb0d3c410'::uuid
)
select
  (select count(*) from public.group_buy_orders where campaign_id = 'a825eb6b-731b-4c7e-a3c1-fe5cb0d3c410'::uuid) as remaining_orders,
  (select count(*) from public.group_buy_notifications where campaign_id = 'a825eb6b-731b-4c7e-a3c1-fe5cb0d3c410'::uuid and order_id is not null) as remaining_order_notifications,
  (select count(*) from target_products) as preserved_products,
  (select count(*) from public.group_buy_product_images i join target_products p on p.id = i.product_id) as preserved_product_images,
  (select count(*) from public.group_buy_shipping_methods where campaign_id = 'a825eb6b-731b-4c7e-a3c1-fe5cb0d3c410'::uuid) as preserved_shipping_methods;

-- Intentionally preserve campaign-level events without order_id for manual review.
select id, event_type, from_status, to_status, created_at
from public.group_buy_campaign_events
where campaign_id = 'a825eb6b-731b-4c7e-a3c1-fe5cb0d3c410'::uuid
order by created_at;

-- SAFETY DEFAULT. Do not change until preview counts and downloaded backup are confirmed.
rollback;
